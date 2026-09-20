/**
 * Natural-language metadata filter extraction.
 *
 * Rather than trying to be clever, this module applies hard, high-precision rules
 * to extract metadata filters the retrieval query should honour *before* scoring.
 * If a question mentions "PR #42" or "ADR-003", those are exact filters, not things
 * we want cosine similarity to discover for us.
 *
 * RULE: we never REMOVE a vector score threshold — metadata filtering narrows, it
 * never replaces, the retrieval gate.
 */

import type { DocMetadata } from '../types';

export type MetadataFilter = {
  sourceType?: string;
  prNumber?: number;
  issueNumber?: number;
  adrId?: string;
  /** Glob-ish path filter: startsWith match on filePath / path. */
  filePathPrefix?: string;
  documentType?: string;
};

const PR_RE = /(?:PR|pull request)\s*#(\d+)/i;
const ISSUE_RE = /(?:issue|bug|ticket)\s*#(\d+)/i;
const ADR_RE = /(?:ADR)[-\s]*(\d+)/i;
const ADR_ID_RE = /\b([0-9a-f]{20,40})\b/i; // MongoDB-like ADR ids stored as cuids
const FILE_PATH_RE = /\b(?:file|path|component|service)\s+([\w./\\-]+\.\w{1,10})\b/i;
const ARCH_COMPONENT_RE = /\b(?:architecture|service|component)\s+(?:of\s+)?(?:the\s+)?([\w.-]+)\b/i;

/**
 * Given a user question, return structured filters that will be composed into the
 * retrieval WHERE clause. Multiple filters may be returned (and, if so, are ANDed).
 */
export function extractMetadataFilters(question: string): MetadataFilter[] {
  const filters: MetadataFilter[] = [];

  const prMatch = PR_RE.exec(question);
  if (prMatch) filters.push({ sourceType: 'pr', prNumber: parseInt(prMatch[1], 10) });

  const issueMatch = ISSUE_RE.exec(question);
  if (issueMatch) filters.push({ sourceType: 'issue', issueNumber: parseInt(issueMatch[1], 10) });

  const adrMatch = ADR_RE.exec(question);
  if (adrMatch) filters.push({ sourceType: 'adr', adrId: adrMatch[0].trim() });

  const filePathMatch = FILE_PATH_RE.exec(question);
  if (filePathMatch) filters.push({ filePathPrefix: filePathMatch[1] });

  const compMatch = ARCH_COMPONENT_RE.exec(question);
  if (compMatch && !filePathMatch) filters.push({ filePathPrefix: compMatch[1].toLowerCase() });

  return filters;
}

/**
 * When the user message carries an explicit context block (e.g. AskDevHub about this
 * PR), convert that to a filter.
 */
export function contextToFilter(ctx: { prNumber?: number; issueNumber?: number; adrId?: string; filePath?: string; documentType?: string }): MetadataFilter | null {
  if (ctx.prNumber != null) return { sourceType: 'pr', prNumber: ctx.prNumber };
  if (ctx.issueNumber != null) return { sourceType: 'issue', issueNumber: ctx.issueNumber };
  if (ctx.adrId) return { sourceType: 'adr', adrId: ctx.adrId };
  if (ctx.filePath) return { filePathPrefix: ctx.filePath };
  if (ctx.documentType) return { documentType: ctx.documentType };
  return null;
}