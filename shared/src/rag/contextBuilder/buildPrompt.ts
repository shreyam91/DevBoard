/**
 * Context builder: turns reranked chunks + conversation history into a grounded
 * LLM prompt, and reconciles the model's citations back into clickable source links.
 *
 * Grounding contract:
 *   - The model answers ONLY from the supplied context.
 *   - If the context does not contain enough to answer, it must say the EXACT
 *     refusal sentence (never invent, never hedge into a guess).
 *   - Every factual claim that came from a source is marked with an inline [n]
 *     citation tag that we post-process into the Sources list.
 */

import type { Citation, RerankedChunk, SourceType } from '../types';

export const REFUSAL_PHRASE = "I couldn't find enough information in this project to answer that confidently.";

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface BuildPromptInput {
  question: string;
  contextChunks: RerankedChunk[];
  history?: ChatTurn[];
  repoFullName?: string;
}

export interface BuiltPrompt {
  system: string;
  user: string;
  /** Citation slots the model may reference by index (1-based). */
  sources: Citation[];
  /** True when retrieval produced nothing useful at all. */
  empty: boolean;
}

const PREFIX = `You are DevHub, an engineering assistant grounded ONLY in the connected repository's knowledge base.
Answer the developer's question strictly from the retrieved context below. Do not use any outside knowledge, general training, or guesses.
- If the retrieved context does not contain enough to answer confidently, reply with exactly:
  "${REFUSAL_PHRASE}"
  and do not add anything else.
- Ground every surrounding claim in a source by appending its number, like [1] for the first source, [2] for the second, and so on. Place the tag at the end of the sentence that relied on it.
- Be concise and technical. Prefer precise facts (technologies, file paths, PR numbers, ADR ids) over filler.
- When asked to explain "how it works" or "what changed", walk through the relevant sources in order.
- If the question references something in the conversation history, use history for context but still only cite the retrieved sources for NEW facts.`;

export function buildPrompt(input: BuildPromptInput): BuiltPrompt {
  const { question, contextChunks, history } = input;

  // Build citation slots (1-based) from the reranked order.
  const sources: Citation[] = contextChunks.map((c) => citationFor(c.metadata, c.content));

  if (contextChunks.length === 0) {
    return {
      system: PREFIX,
      user: buildHistoryBlock(history) + `Question: ${question}\n\n(NO RETRIEVED CONTEXT AVAILABLE)\n\nYou MUST reply with exactly this sentence and nothing else:\n"${REFUSAL_PHRASE}"`,
      sources,
      empty: true,
    };
  }

  const contextBlock = contextChunks
    .map((c, i) => {
      const nr = i + 1;
      const file = c.metadata.filePath ? ` (file: ${c.metadata.filePath})` : '';
      const section = c.metadata.section ? ` [section: ${c.metadata.section}]` : '';
      return `<source nr="${nr}" type="${c.metadata.sourceType}"${file}${section}>\n${c.content}\n</source>`;
    })
    .join('\n\n');

  return {
    system: PREFIX,
    user:
      buildHistoryBlock(history) +
      `Retrieved project context:\n${contextBlock}\n\n` +
      `Question: ${question}\n\n` +
      constrainingInstructions,
    sources,
    empty: false,
  };
}

const constrainingInstructions = `Read the retrieved sources above and answer the question. Requirements:
- Base your answer only on these sources. Never introduce facts that are not present in them.
- Put the relevant source number(s) inline at the points where you rely on them, e.g. "...uses Redis [1]".
- If the sources leave the question genuinely unanswered, reply with exactly:
  "${REFUSAL_PHRASE}"
- Do not mention "sources" generically; use the bracketed numbers.`;

function buildHistoryBlock(history?: ChatTurn[]): string {
  if (!history || history.length === 0) return '';
  const recent = history.slice(-6); // keep it bounded
  const lines = recent.map((t) => `<history role="${t.role}">\n${t.content.slice(0, 800)}\n</history>`);
  return `Conversation history (most recent first):\n${lines.join('\n')}\n\n`;
}

/**
 * Turn stored chunk metadata into a clickable citation.
 */
export function citationFor(meta: { sourceType?: string; title?: string; filePath?: string; prNumber?: number; issueNumber?: number; adrId?: string; repoFullName?: string; url?: string; section?: string }, content: string): Citation {
  const kind = (meta.sourceType ?? 'documentation') as SourceType;
  const full = meta.repoFullName ?? '';
  const title = meta.title ?? 'Source';
  const file = meta.filePath;
  const detail = detailText(meta, content);

  let href = '#';
  if (meta.url) href = meta.url;
  else if (kind === 'pr' && meta.prNumber != null) href = full ? `https://github.com/${full}/pull/${meta.prNumber}` : `#pr${meta.prNumber}`;
  else if (kind === 'issue' && meta.issueNumber != null) href = full ? `https://github.com/${full}/issues/${meta.issueNumber}` : `#issue${meta.issueNumber}`;
  else if (kind === 'adr') href = `#adr-${meta.adrId ?? ''}`;
  else if (file) href = full ? `https://github.com/${full}/blob/HEAD/${file}` : `#${file}`;

  return { kind, title, href, detail };
}

function detailText(meta: { sourceType?: string; filePath?: string; prNumber?: number; issueNumber?: number; adrId?: string; section?: string }, content: string): string {
  const excerpt = content.slice(0, 140).replace(/\s+/g, ' ').trim();
  switch (meta.sourceType) {
    case 'pr':
      return `PR #${meta.prNumber ?? ''} · ${excerpt}`;
    case 'issue':
      return `Issue #${meta.issueNumber ?? ''} · ${excerpt}`;
    case 'adr':
      return `${meta.adrId ? `ADR ${meta.adrId} · ` : ''}${meta.section ?? 'decision'} · ${excerpt}`;
    case 'architecture':
      return `ARCHITECTURE.md${meta.section ? ` — ${meta.section}` : ''} · ${excerpt}`;
    case 'file':
    case 'code_chunk':
      return `${meta.filePath ?? 'file'} · ${excerpt}`;
    default:
      return `${meta.filePath ?? meta.section ?? 'doc'} · ${excerpt}`;
  }
}

/**
 * Reconcile the model's raw answer: split run-on citation tags ([1][3] or [1, 3])
 * into individual tags, and collect which source indices were actually referenced
 * so the UI can show only the sources the answer stands on.
 */
export function reconcileSources(raw: string): { text: string; citedIndices: number[] } {
  // Normalize tags: [1][3] -> [1] [3]; [1,3] / [1, 3] -> [1] [3]
  const normalized = raw.replace(/\[\s*(\d+)\s*,\s*(\d+)\s*\]/g, '[$1][$2]');
  const tags = normalized.match(/\[(\d+)\]/g) ?? [];
  const cited = Array.from(new Set(tags.map((t) => parseInt(t.replace(/[\[\]]/g, ''), 10)))).sort((a, b) => a - b);
  return { text: normalized, citedIndices: cited };
}

/**
 * Build the final Sources list (only the distinctly cited ones) with resolved links.
 */
export function buildSources(sources: Citation[], citedIndices: number[]): Citation[] {
  const idx = new Set(citedIndices);
  return sources
    .map((s, i) => (idx.has(i + 1) ? s : null))
    .filter((s): s is Citation => s !== null);
}