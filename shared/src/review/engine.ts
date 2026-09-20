import { prisma } from '../prisma';
import { getLLMClient, REVIEW_MODEL } from '../llm/client';
import { processDiff, type DiffChunk } from './diff';
import { extractIssueReferences, resolveIssues, type ResolvedIssue } from './issues';
import { fetchPR, fetchPRCommits, fetchPRDiff, type PRMetadata, type CommitSummary } from './github';
import { loadRepoContext, assembleContext, type ReviewContext } from './context';
import { systemPrompt, userPromptForChunk, metaPrompt } from './prompt';
import { retrieveCandidates, verifyConflicts } from './arch';
import { dedupeFindings, assignDedupKeys } from './dedupe';
import {
  parseChunkAnalysis,
  parseReviewMeta,
  type ReviewResult,
  type ReviewMeta,
  type DocumentationImpact,
} from './types';

/** Everything the engine needs to run one review of a PR at a head SHA. */
export interface ReviewInput {
  reviewId: string;
  repoId: string;
  repoFullName: string;
  prNumber: number;
  prTitle: string;
  prBody?: string;
  prUrl: string;
  headSha?: string | null;
  token: string;
}

interface RawChunkResult {
  findings: ReviewResult['findings'];
}

/** Extract the PR summary + intent once (cheap, no diff). */
async function extractMeta(ctx: Pick<ReviewContext, 'pr' | 'commits' | 'resolvedIssues'>): Promise<ReviewMeta> {
  const client = getLLMClient();
  const res = await client.chat.completions.create({
    model: REVIEW_MODEL,
    messages: [
      { role: 'system', content: 'You extract a concise, faithful summary and intent of a code change. Return ONLY valid JSON.' },
      { role: 'user', content: metaPrompt(ctx) },
    ],
    temperature: 0,
  });
  const content = res.choices[0]?.message?.content;
  const parsed = content ? parseReviewMeta(content) : { ok: false as const, error: 'empty response' };
  if (parsed.ok) return parsed.data;
  // Fallback to deterministic values when the LLM meta call fails.
  return { summary: ctx.pr.title, intent: ctx.pr.body || 'No description provided.' };
}

/** Call the LLM for one chunk, with a single retry on invalid/empty output. */
async function analyzeChunk(ctx: ReviewContext, chunk: DiffChunk): Promise<RawChunkResult> {
  const client = getLLMClient();
  const schema = {
    type: 'json_schema' as const,
    json_schema: {
      name: 'chunk_review',
      schema: {
        type: 'object',
        properties: {
          findings: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
                category: { type: 'string', enum: ['bug', 'security', 'performance', 'quality', 'testing', 'architecture'] },
                title: { type: 'string' },
                description: { type: 'string' },
                file: { type: ['string', 'null'] },
                line: { type: ['integer', 'null'] },
                line_end: { type: ['integer', 'null'] },
                suggestion: { type: ['string', 'null'] },
                confidence: { type: 'number' },
              },
              required: ['severity', 'category', 'title', 'description', 'confidence'],
              additionalProperties: false,
            },
          },
        },
        required: ['findings'],
        additionalProperties: false,
      },
    },
  };

  for (let attempt = 1; attempt <= 2; attempt++) {
    const res = await client.chat.completions.create({
      model: REVIEW_MODEL,
      messages: [
        { role: 'system', content: systemPrompt() },
        { role: 'user', content: userPromptForChunk(ctx, chunk) },
      ],
      response_format: schema as any,
      temperature: 0,
    });
    const content = res.choices[0]?.message?.content;
    if (!content) {
      if (attempt === 1) continue;
      return { findings: [] };
    }
    const parsed = parseChunkAnalysis(content);
    if (parsed.ok) {
      return { findings: parsed.data.findings };
    }
    // Retry once on invalid output.
  }
  return { findings: [] };
}

/**
 * Extract documentation impact deterministically.
 * Architecture conflicts are reports about the Architecture document; other
 * notable structural changes surface as documentation suggestions.
 */
function deriveDocumentationImpact(changeSummary: string, findings: ReviewResult['findings']): DocumentationImpact[] {
  const impacts: DocumentationImpact[] = [];
  const hasArch = findings.some((f) => f.category === 'architecture');
  const text = `${changeSummary} ${findings.map((f) => `${f.title} ${f.category}`).join(' ')}`.toLowerCase();

  if (hasArch) {
    impacts.push({ document: 'Architecture', reason: 'PR is flagged for an architecture-related finding.' });
  }
  if (/\b(api|endpoint|route|rest|graphql)\b/.test(text)) {
    impacts.push({ document: 'Technical Specification', reason: 'Change likely affects API/contract behavior.' });
  }
  if (/\b(retry|timeout|auth|toxen|secret|config|rate.?limit)\b/.test(text)) {
    impacts.push({ document: 'Technical Specification', reason: 'Change affects runtime behavior (retries/timeouts/auth).' });
  }

  // De-dupe by document name.
  const seen = new Set<string>();
  return impacts.filter((i) => (seen.has(i.document) ? false : (seen.add(i.document), true)));
}

/**
 * Run the review pipeline end-to-end and persist results.
 * Never throws for recoverable AI/network errors — it records them on the Review.
 */
export async function runReview(input: ReviewInput): Promise<ReviewResult> {
  const started = Date.now();
  const log = (msg: string, meta: Record<string, unknown> = {}) =>
    console.log(`[review pr=${input.prNumber} repo=${input.repoId} review=${input.reviewId}] ${msg}`, meta);

  try {
    // 1. PR metadata, commits, diff.
    const pr: PRMetadata = await fetchPR(input.repoFullName, input.prNumber, input.token);
    const commits: CommitSummary[] = await fetchPRCommits(input.repoFullName, input.prNumber, input.token);
    const rawDiff = await fetchPRDiff(input.repoFullName, input.prNumber, input.token);
    const { changedFiles, chunks, totalChars } = processDiff(rawDiff);
    log(`fetched: ${changedFiles.length} files, ${chunks.length} chunks, ${totalChars} chars`);

    // 2. Issue references.
    const refs = extractIssueReferences(pr.title, pr.body, commits.map((c) => c.message));
    const resolvedIssues: ResolvedIssue[] = await resolveIssues(input.repoFullName, refs, input.token);
    if (refs.length) log(`issues: ${refs.length} referenced, ${resolvedIssues.length} resolved`);

    // 3. Repo architecture + decisions.
    const repoContext = await loadRepoContext(input.repoId);

    // 4. Assemble context and analyze chunks sequentially.
    const ctx: ReviewContext = assembleContext({
      repoId: input.repoId,
      repoFullName: input.repoFullName,
      pr,
      commits,
      resolvedIssues,
      changedFiles,
      chunks,
      architectureContent: repoContext.architectureContent,
      decisions: repoContext.decisions,
    });

    let aggregated: ReviewResult['findings'] = [];
    if (chunks.length > 0) {
      for (const chunk of chunks) {
        const t = Date.now();
        const result = await analyzeChunk(ctx, chunk);
        aggregated = aggregated.concat(result.findings);
        log(`chunk ${chunk.index + 1}/${chunks.length}: ${result.findings.length} findings in ${Date.now() - t}ms`);
      }
    }

    // 5. Dedup aggregated findings.
    aggregated = dedupeFindings(aggregated);

    // 6. Extract summary + intent (AI).
    const meta = await extractMeta(ctx);

    // 7. Architecture-aware verification.
    let architectureImpact: ReviewResult['architectureImpact'] = [];
    let documentationImpact: ReviewResult['documentationImpact'] = [];
    const changeSummary = `${meta.summary}: ${meta.intent}`.slice(0, 1000);
    const candidates = await retrieveCandidates(input.repoId, changeSummary);
    if (candidates.length > 0) {
      architectureImpact = await verifyConflicts(ctx, candidates, changeSummary, aggregated);
    }
    documentationImpact = deriveDocumentationImpact(changeSummary, aggregated.concat(
      architectureImpact.map((a) => ({
        severity: 'medium' as const,
        category: 'architecture' as const,
        title: `Architecture: ${a.decisionTitle || 'conflict'}`,
        description: a.reason,
        confidence: 0.6,
      }))
    ));

    // 8. Persist.
    const dedupKeys = assignDedupKeys(aggregated);
    await prisma.$transaction([
      prisma.review.update({
        where: { id: input.reviewId },
        data: {
          status: 'completed',
          head_sha: pr.headSha || input.headSha,
          summary: meta.summary,
          intent: meta.intent,
          architecture_impact: architectureImpact,
          documentation_impact: documentationImpact,
        },
      }),
      ...aggregated.map((f) =>
        prisma.reviewFinding.create({
          data: {
            review_id: input.reviewId,
            severity: f.severity,
            category: f.category,
            title: f.title,
            description: f.description,
            file: f.file || null,
            line: f.line ?? null,
            line_end: f.line_end ?? null,
            suggestion: f.suggestion || null,
            confidence: f.confidence,
            dedup_key: dedupKeys.get(f),
            status: 'open',
          },
        })
      ),
    ]);

    log(`completed: ${aggregated.length} findings, ${architectureImpact.length} arch conflicts, ${documentationImpact.length} doc impacts in ${Date.now() - started}ms`);

    return {
      summary: meta.summary,
      intent: meta.intent,
      findings: aggregated,
      architectureImpact: architectureImpact as ReviewResult['architectureImpact'],
      documentationImpact,
    };
  } catch (error) {
    log(`failed: ${(error as Error).message}`, { tookMs: Date.now() - started });
    await prisma.review.update({
      where: { id: input.reviewId },
      data: { status: 'failed', error: (error as Error).message.slice(0, 4000) },
    });
    throw error;
  }
}