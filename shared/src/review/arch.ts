import { prisma } from '../prisma';
import { getLLMClient, EMBEDDING_MODEL } from '../llm/client';
import { parseVerificationResult, type ArchitectureImpact } from './types';
import { verifierSystemPrompt, verifierUserPrompt } from './prompt';
import type { ReviewContext } from './context';
import type { Finding } from './types';

/**
 * Architecture-aware review.
 *
 * 1. Embed the change summary and find candidate decisions by cosine distance
 *    (pgvector `<=>`). This is RETRIEVAL, not proof of a conflict.
 * 2. Ask the LLM to verify whether any candidate is actually violated.
 */
export interface CandidateDecision {
  decisionId: string;
  title: string;
  rationale: string;
  distance: number;
}

const MAX_CANDIDATES = 4;
const CANDIDATE_DISTANCE_CUTOFF = 0.3;

export async function embed(text: string): Promise<number[]> {
  const client = getLLMClient();
  const res = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    encoding_format: 'float',
  });
  return res.data[0].embedding;
}

/** Retrieve candidate decisions from pgvector by cosine similarity. */
export async function retrieveCandidates(
  repoId: string,
  changeSummary: string
): Promise<CandidateDecision[]> {
  try {
    const vector = await embed(changeSummary);
    const rows: { id: string; title: string; rationale: string; distance: number }[] = await prisma.$queryRaw`
      SELECT d.id, d.title, d.rationale, (de.vector <=> ${vector}::vector) AS distance
      FROM decisions d
      JOIN decision_embeddings de ON de.decision_id = d.id
      WHERE d.repo_id = ${repoId} AND d.confirmed_by_user = true
      ORDER BY distance ASC
      LIMIT ${MAX_CANDIDATES}
    `;
    return rows
      .filter((r) => r.distance < CANDIDATE_DISTANCE_CUTOFF)
      .map((r) => ({ decisionId: r.id, title: r.title, rationale: r.rationale, distance: r.distance }));
  } catch (e) {
    console.warn(`[review] pgvector candidate retrieval failed: ${(e as Error).message}`);
    return [];
  }
}

/**
 * LLM-verify candidate decisions. Returns real conflicts only.
 * If verification is unavailable (no candidates, no model), returns [].
 */
export async function verifyConflicts(
  ctx: ReviewContext,
  candidates: CandidateDecision[],
  changeSummary: string,
  findings: Finding[]
): Promise<ArchitectureImpact[]> {
  if (candidates.length === 0) return [];

  const client = getLLMClient();
  const conflicts = await client.chat.completions.create({
    model: 'openai/gpt-4o-mini',
    messages: [
      { role: 'system', content: verifierSystemPrompt() },
      {
        role: 'user',
        content: verifierUserPrompt(ctx, candidates, changeSummary) +
          `\n\n<FINDINGS_SO_FAR>\n${JSON.stringify(findings.slice(0, 10))}\n</FINDINGS_SO_FAR>`,
      },
    ],
    temperature: 0,
  });

  const content = conflicts.choices[0]?.message?.content;
  if (!content) return [];

  const parsed = parseVerificationResult(content);
  if (!parsed.ok) {
    console.warn(`[review] architecture verifier returned invalid output: ${parsed.error}`);
    return [];
  }

  return parsed.data.conflicts.map((c) => ({
    document: 'Architecture',
    reason: c.reason,
    decisionId: c.decisionId ?? undefined,
    decisionTitle: c.decisionTitle ?? undefined,
    conflict: true,
  }));
}