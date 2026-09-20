import type { Finding } from './types';

/**
 * Finding deduplication.
 * A stable `dedup_key` is derived deterministically so findings can be
 * compared across review runs (same key → same issue), enabling us to avoid
 * re-posting duplicates and to resolve findings that no longer apply.
 */

/** Normalize a title for stable comparison (lowercase, collapse whitespace). */
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9 ]/g, '')
    .trim();
}

/** Deterministic, human-readable key for a finding within a PR. */
export function dedupKey(f: Pick<Finding, 'title' | 'file' | 'line'>): string {
  const loc = f.file && f.line ? `${f.file}:${f.line}` : f.file || 'no-loc';
  return `${loc}::${normalizeTitle(f.title).slice(0, 80)}`;
}

/**
 * Deduplicate findings aggregated across chunks.
 * Preferred: an explicit file+line location. Fallback: title similarity.
 */
export function dedupeFindings(findings: Finding[]): Finding[] {
  const seen = new Set<string>();
  const out: Finding[] = [];

  for (const f of findings) {
    const location = f.file && f.line ? `${f.file}:${f.line}` : null;
    let key: string;
    if (location) {
      key = location + '::' + normalizeTitle(f.title).slice(0, 80);
    } else {
      key = 'title::' + normalizeTitle(f.title);
    }
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(f);
  }

  // Prefer higher-confidence / higher-severity duplicate: not needed once keyed
  // by location, but collapse exact-title duplicates that share proximity.
  return out;
}

/** Build a stable dedup_key for each finding (used for persistence). */
export function assignDedupKeys(findings: Finding[]): Map<Finding, string> {
  const map = new Map<Finding, string>();
  for (const f of findings) map.set(f, dedupKey(f));
  return map;
}