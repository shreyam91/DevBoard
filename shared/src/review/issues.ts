/**
 * Issue reference extraction and resolution.
 *
 * Supports `#123`, `Issue #123`, `Fixes #123`, `Closes #123`, `Resolves #123`.
 * Extraction is deterministic (regex). Resolution goes through GitHub so we never
 * assume a bare number is an issue just because it appears in text.
 */

// `#` is a non-word char, so `\b#` never matches at string start or after a
// space. Match bare `#N` only right after start/whitespace; keywords are
// matched word-bounded in KEYWORD_PATTERN.
const REF_PATTERN = /(?:(?<=\s)|^)#(\d+)\b/gi;
const KEYWORD_PATTERN = /\b(?:issue|fixes|closes|resolves|refs?)\s*#(\d+)\b/gi;

export interface IssueReference {
  number: number;
  /** Whether an explicit keyword (e.g. "Fixes #") was present. */
  keyword: string | null;
  source: 'title' | 'description' | 'commit';
}

export interface ResolvedIssue {
  number: number;
  title: string;
  body: string;
  state: string;
  url: string;
}

/**
 * Extract candidate references from PR text.
 * Returns references where a keyword explicitly names an issue, plus bare
 * `#N` numbers. Callers resolve numbers through GitHub before trusting them.
 */
export function extractIssueReferences(
  title: string,
  description: string,
  commitMessages: string[] = []
): IssueReference[] {
  const refs: IssueReference[] = [];
  const seen = new Set<string>();

  const add = (number: number, keyword: string | null, source: IssueReference['source']) => {
    const key = `${source}:${number}:${keyword ?? ''}`;
    if (seen.has(key)) return;
    seen.add(key);
    refs.push({ number, keyword, source });
  };

  const walk = (text: string, source: IssueReference['source']) => {
    if (!text) return;
    for (const m of text.matchAll(KEYWORD_PATTERN)) {
      add(Number(m[1]), m[0].split('#')[0].trim(), source);
    }
    for (const m of text.matchAll(REF_PATTERN)) {
      add(Number(m[1]), null, source);
    }
  };

  walk(title, 'title');
  walk(description, 'description');
  commitMessages.forEach((msg) => walk(msg, 'commit'));

  // De-duplicate by number, preferring keyword-anchored refs.
  const byNumber = new Map<number, IssueReference>();
  for (const r of refs) {
    const existing = byNumber.get(r.number);
    if (!existing || (existing.keyword === null && r.keyword !== null)) {
      byNumber.set(r.number, r);
    }
  }
  return Array.from(byNumber.values());
}

interface GitHubIssueResponse {
  number: number;
  title: string;
  body: string | null;
  state: string;
  html_url: string;
}

/**
 * Resolve a PR's issue references through the GitHub API.
 * Only numbers that GitHub confirms are real issues are returned.
 *
 * `fetchImpl` is injected so tests can stub the network.
 */
export async function resolveIssues(
  fullName: string,
  refs: IssueReference[],
  token: string,
  fetchImpl: typeof fetch = fetch
): Promise<ResolvedIssue[]> {
  const results: ResolvedIssue[] = [];
  for (const ref of refs) {
    try {
      const res = await fetchImpl(
        `https://api.github.com/repos/${fullName}/issues/${ref.number}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );
      if (res.status === 404) continue; // not an issue (could be a PR or a non-ref)
      if (!res.ok) continue;
      const data = (await res.json()) as GitHubIssueResponse;
      if (data.html_url?.includes('/pull/')) continue; // it's a PR, not an issue
      results.push({
        number: data.number,
        title: data.title,
        body: (data.body || '').slice(0, 2000),
        state: data.state,
        url: data.html_url,
      });
    } catch {
      continue; // resolution is best-effort context, never fatal
    }
  }
  return results;
}