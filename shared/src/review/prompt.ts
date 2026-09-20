import type { ReviewContext } from './context';
import type { DiffChunk } from './diff';
import type { CandidateDecision } from './arch';

/**
 * Prompts for the review engine + architecture verifier.
 * The reviewer is deliberately conservative: a few useful findings beat many
 * generic ones. Everything must be specific and grounded in the diff/context.
 */

const SEVERITY_GUIDE = `Severity:
- critical: definite correctness/security/data bug that blocks merge.
- high: likely bug or clear security/perf problem worth fixing before merge.
- medium: real issue with meaningful likelihood/impact.
- low: minor, but still an actual problem (not a style nitpick).

Rules (must follow):
- Prefer 3 useful findings over 20 generic ones. Quality over quantity.
- Every finding must state a concrete problem with a concrete cause and effect.
- Do NOT report: style nits, naming preferences, "consider improving readability", missing tests for trivial changes, uncertainty dressed as fact.
- Do not repeat the same finding across files.
- Only call a security issue if you are confident; state uncertainty in the description otherwise.
- Attach file + line (an ADDED line's new-file number) when the finding is anchored to a change. Omit line when a finding is PR-wide.
- confidence 0-1; require >= ~0.7 before reporting low-severity findings.
- Return ONLY valid JSON matching the schema.`;

export function systemPrompt(): string {
  return `You are an expert principal software engineer performing a rigorous, conservative code review of a GitHub PR. You read the PR itself, its description, its commit messages, referenced GitHub issues, the repository architecture, and existing architectural decisions to understand BOTH what changed AND why, then you judge whether the implementation is correct, safe, fast, maintainable, and consistent with the project's architecture.

Return ONLY a JSON object with this exact shape:
{
  "summary": "1-2 sentence summary of what the PR does",
  "intent": "what the developer is trying to accomplish, using issue/commit context",
  "findings": [
    {
      "severity": "critical|high|medium|low",
      "category": "bug|security|performance|quality|testing|architecture",
      "title": "short, specific title",
      "description": "concrete cause and effect",
      "file": "optional changed file path",
      "line": "optional integer, an ADDED line's new-file number",
      "line_end": "optional integer",
      "suggestion": "specific recommended fix",
      "confidence": 0.91
    }
  ]
}
${SEVERITY_GUIDE}`;
}

export function userPromptForChunk(ctx: ReviewContext, chunk: DiffChunk): string {
  const issueBlock = ctx.resolvedIssues.length
    ? ctx.resolvedIssues
        .map((i) => `- #${i.number} [${i.state}] ${i.title}\n  ${i.body.replace(/\n/g, ' ').slice(0, 400)}`)
        .join('\n')
    : 'None.';

  const decisionsBlock = ctx.decisions.length
    ? ctx.decisions.map((d) => `- ${d.title} (${d.category})\n  ${d.rationale.slice(0, 300)}`).join('\n')
    : 'None.';

  const archBlock = ctx.architectureContent ? ctx.architectureContent : 'No architecture document available.';

  const files = chunk.files
    .map(
      (f) =>
        `### ${f.path} (${f.additions}+/${f.deletions}-${f.new ? ', new' : ''}${f.truncated ? ', truncated' : ''})\n\`\`\`\n${f.text}\n\`\`\``
    )
    .join('\n\n');

  return `<PR_TITLE>${ctx.pr.title}</PR_TITLE>
<PR_DESCRIPTION>${ctx.pr.body || 'None provided.'}</PR_DESCRIPTION>
<PR_AUTHOR>${ctx.pr.author}</PR_AUTHOR>
<CHANGED_FILES>${ctx.changedFiles.join(', ')}</CHANGED_FILES>

<REFERENCED_ISSUES>
${issueBlock}
</REFERENCED_ISSUES>

<COMMIT_MESSAGES>
${ctx.commits.map((c) => `- ${c.sha.slice(0, 7)}: ${c.message}`).join('\n')}
</COMMIT_MESSAGES>

<CURRENT_ARCHITECTURE>
${archBlock}
</CURRENT_ARCHITECTURE>

<ARCHITECTURAL_DECISIONS>
${decisionsBlock}
</ARCHITECTURAL_DECISIONS>

<DIFF_CHUNK (${chunk.index + 1} of these)>
${files}
</DIFF_CHUNK>`;
}

export interface VerifierOptions {
  architectureContent: string | null;
  decisions: { id: string; title: string; rationale: string }[];
}

/** Compact prompt to extract the PR's summary + intent from title/body/commits/issues. */
export function metaPrompt(ctx: Pick<ReviewContext, 'pr' | 'commits' | 'resolvedIssues'>): string {
  return `<PR_TITLE>${ctx.pr.title}</PR_TITLE>
<PR_DESCRIPTION>${ctx.pr.body || 'None provided.'}</PR_DESCRIPTION>
<COMMIT_MESSAGES>${ctx.commits.map((c) => `- ${c.message}`).join('\n')}</COMMIT_MESSAGES>
<REFERENCED_ISSUES>${ctx.resolvedIssues.map((i) => `- #${i.number}: ${i.title}`).join('\n') || 'None.'}</REFERENCED_ISSUES>

Return ONLY valid JSON: {"summary": "1-2 sentences on what the PR does", "intent": "what the developer is trying to accomplish, grounded in the issues/commits"}`;
}

export function verifierSystemPrompt(): string {
  return `You verify whether a proposed PR change actually conflicts with an existing architectural decision.
Tensor-similarity merely RECOMMENDS candidates; you must read the actual decision text and the change to decide if there is a REAL conflict. Do not report a conflict just because text is topically similar. If nothing genuinely conflicts, return an empty conflicts array.
Return ONLY valid JSON: {"conflicts":[{"decisionId":"","decisionTitle":"","reason":"","severity":"low|medium|high","confidence":0-1}]}`;
}

export function verifierUserPrompt(
  ctx: ReviewContext,
  candidates: CandidateDecision[],
  changeSummary: string
): string {
  return `<PR_TITLE>${ctx.pr.title}</PR_TITLE>
<CHANGE_SUMMARY>
${changeSummary}
</CHANGE_SUMMARY>

<CANDIDATE_DECISIONS (need verification)>
${candidates.map((c) => `- [${c.decisionId}] ${c.title}\n  ${c.rationale.slice(0, 500)}`).join('\n')}
</CANDIDATE_DECISIONS>

${ctx.architectureContent ? `<CURRENT_ARCHITECTURE>\n${ctx.architectureContent}\n</CURRENT_ARCHITECTURE>` : ''}`;
}