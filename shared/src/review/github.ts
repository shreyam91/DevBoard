import type { Finding } from './types';

/**
 * GitHub REST helpers for the review pipeline.
 * Reuse the existing Clerk-backed token helper from shared/src/utils/auth.
 */

export interface PRMetadata {
  number: number;
  title: string;
  body: string;
  author: string;
  baseBranch: string;
  headBranch: string;
  headSha: string;
  url: string;
  state: string;
}

export interface CommitSummary {
  sha: string;
  message: string;
  author: string;
}

const GITHUB_API = 'https://api.github.com';

async function gh<T>(url: string, token: string, accept?: string): Promise<T> {
  const res = await fetch(`${GITHUB_API}${url}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: accept || 'application/vnd.github.v3+json',
    },
  });
  if (res.status === 404) throw new Error(`GitHub 404: ${url}`);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`GitHub API error ${res.status} for ${url}: ${body.slice(0, 300)}`);
  }
  return (res.status === 204 ? ({} as T) : (await res.json())) as T;
}

export async function fetchPR(repoFullName: string, prNumber: number, token: string): Promise<PRMetadata> {
  type Raw = {
    number: number;
    title: string;
    body: string | null;
    user: { login: string };
    base: { ref: string; sha: string };
    head: { ref: string; sha: string };
    html_url: string;
    state: string;
  };
  const data = await gh<Raw>(`/repos/${repoFullName}/pulls/${prNumber}`, token);
  return {
    number: data.number,
    title: data.title,
    body: (data.body || '').trim(),
    author: data.user?.login || 'unknown',
    baseBranch: data.base.ref,
    headBranch: data.head.ref,
    headSha: data.head.sha,
    url: data.html_url,
    state: data.state,
  };
}

export async function fetchPRDiff(repoFullName: string, prNumber: number, token: string): Promise<string> {
  return gh<string>(`/repos/${repoFullName}/pulls/${prNumber}`, token, 'application/vnd.github.v3.diff') as unknown as string;
}

export async function fetchPRCommits(repoFullName: string, prNumber: number, token: string): Promise<CommitSummary[]> {
  type Raw = { sha: string; commit: { message: string }; author?: { login: string } }[];
  const data = await gh<Raw>(`/repos/${repoFullName}/pulls/${prNumber}/commits?per_page=100`, token);
  return data.map((c) => ({
    sha: c.sha,
    message: c.commit.message.split('\n')[0].trim(),
    author: c.author?.login || 'unknown',
  }));
}

/** Body + inline comments for an on-demand GitHub PR review. */
export interface ReviewComment {
  path: string;
  line: number;
  side?: 'RIGHT';
  body: string;
}

export interface GitHubReviewDraft {
  commit_id?: string;
  event: 'COMMENT' | 'REQUEST_CHANGES' | 'APPROVE';
  body: string;
  comments: ReviewComment[];
}

/**
 * Post an inline review to a GitHub PR.
 * This is only invoked through the user-facing "Post to GitHub" action
 * (offline-first by design) — never automatically from the worker.
 */
export async function postPullRequestReview(
  repoFullName: string,
  prNumber: number,
  draft: GitHubReviewDraft,
  token: string
): Promise<{ id: number; html_url: string }> {
  const res = await fetch(`${GITHUB_API}/repos/${repoFullName}/pulls/${prNumber}/reviews`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(draft),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Failed to post review (${res.status}): ${body.slice(0, 300)}`);
  }
  return (await res.json()) as { id: number; html_url: string };
}

/** Convenience: build inline comments for findings, dropping ones without a file/line. */
export function findingsToReviewComments(findings: Finding[]): ReviewComment[] {
  return findings
    .filter((f) => f.file && f.line)
    .slice(0, 25) // avoid spamming a PR
    .map((f) => ({
      path: f.file as string,
      line: f.line as number,
      side: 'RIGHT' as const,
      body: `**[${f.severity}] ${f.title}**\n\n${f.description}\n\n${f.suggestion ? `> ${f.suggestion}` : ''}`,
    }));
}