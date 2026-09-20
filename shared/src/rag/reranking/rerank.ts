/**
 * Reranking retrieved chunks.
 *
 * Vector similarity alone is a weak guarantee of relevance, so we never present it
 * as proof. We take the wider candidate pool from pgvector and re-rank it with a
 * hybrid, deterministic score that blends three independent signals:
 *
 *   1. Semantic distance (pgvector cosine) — the broad "about this topic" signal.
 *   2. Lexical overlap (a Jaccard / term-frequency score) — catches exact names
 *      (function names, file paths, PR ids, package names) that embeddings blur.
 *   3. Query–metadata signal — whether the chunk's source kind / path / ids match
 *      something the question explicitly names (weighted up).
 *
 * This is deliberately dependency-free (no cross-encoder model) so it stays cheap,
 * fast, and unit-testable. A cross-encoder can be dropped in behind this interface
 * later without touching callers.
 */

import type { MetadataFilter } from '../retrieval/filters';
import type { DocMetadata, RetrievedChunk, RerankedChunk } from '../types';

export interface RerankSignal {
  /** 0..1 1 - distance */
  semantic: number;
  /** 0..1 lexical overlap */
  lexical: number;
  /** 0..1 metadata match */
  metadata: number;
}

export const WEIGHTS = { semantic: 0.5, lexical: 0.35, metadata: 0.15 };

/** Total unique tokens shared between query and chunk. */
export function tokenOverlap(query: string, content: string): number {
  const q = new Set(tokenize(query));
  let hits = 0;
  for (const t of tokenize(content.slice(0, 4000))) if (q.has(t)) hits++;
  return hits;
}

export function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9_][a-z0-9_.\-/]*/g) ?? []).filter(Boolean);
}

/** Jaccard-style overlap coefficient, 0..1. */
export function jaccard(query: string, content: string): number {
  const a = new Set(tokenize(query));
  const b = new Set(tokenize(content.slice(0, 4000)));
  if (a.size === 0) return 0;
  let inter = 0;
  const aTokens = Array.from(a);
  for (let i = 0; i < aTokens.length; i++) if (b.has(aTokens[i])) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

/** Does the metadata line up with anything the question explicitly names? */
export function metadataSignal(question: string, metadata: DocMetadata): number {
  const q = question.toLowerCase();
  let score = 0;

  if (metadata.filePath) {
    const base = metadata.filePath.split('/').pop() ?? '';
    const baseNoExt = base.replace(/\.[^.]+$/, '');
    if (baseNoExt && q.includes(baseNoExt.toLowerCase())) score += 1;
    if (q.includes(metadata.filePath.toLowerCase())) score += 0.5;
  }
  if (metadata.section && q.includes(metadata.section.toLowerCase())) score += 0.75;
  if (metadata.title && q.includes(metadata.title.toLowerCase())) score += 0.5;
  if (metadata.prNumber != null && q.includes(`#${metadata.prNumber}`)) score += 1;
  if (metadata.adrId && q.includes(metadata.adrId.toLowerCase())) score += 1;

  // Source-type affinity: questions about "documentation"/"architecture"/"ADR" favour those.
  if (/\badr\b|decision/i.test(q) && metadata.sourceType === 'adr') score += 0.5;
  if (/\barchitecture\b/i.test(q) && metadata.sourceType === 'architecture') score += 0.5;
  if (/\bpr\b|pull request|changed/i.test(q) && metadata.sourceType === 'pr') score += 0.4;

  return Math.min(1, score);
}

export function hybridScore(signal: RerankSignal): number {
  return (
    signal.semantic * WEIGHTS.semantic +
    signal.lexical * WEIGHTS.lexical +
    signal.metadata * WEIGHTS.metadata
  );
}

/**
 * Re-rank a candidate pool. `question` and `filters` inform lexical + metadata
 * signals. Returns a sorted, deduplicated list with a composite score.
 */
export function rerank(
  candidates: RetrievedChunk[],
  question: string,
  filters: MetadataFilter[] = [],
  topK = 6,
): RerankedChunk[] {
  // Dedupe by docId (a chunk can be file-covered and code-covered).
  const seen = new Set<string>();
  const scored: (RerankedChunk & { signal: RerankSignal })[] = [];

  for (const c of candidates) {
    if (seen.has(c.docId)) continue;
    seen.add(c.docId);
    // Distance could be NaN if pgvector returned a null distance (shouldn't happen).
    const semantic = c.distance == null || Number.isNaN(c.distance) ? 0 : Math.max(0, 1 - c.distance);
    const lexical = jaccard(question, c.content);
    const metadata = metadataSignal(question, c.metadata);
    const signal = { semantic, lexical, metadata };
    scored.push({ ...c, signal, score: hybridScore(signal) });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map(({ signal, ...rest }) => rest);
}