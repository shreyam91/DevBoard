'use client';

import Link from 'next/link';

/**
 * Contextual "Ask DevHub" trigger. Links to the global Ask DevHub chat,
 * pre-filling a question from the surrounding context (an ADR, a PR, an
 * architecture decision, a doc…). The chat's repo picker chooses which
 * connected repo to ground the answer in.
 *
 * @example
 *   <AskDevHubButton question="What does PR #182 change?" label="Ask about this PR" />
 *   <AskDevHubButton question="Why use Redis?" repoId="real-repo-cuid" />
 */
export default function AskDevHubButton({
  question,
  repoId,
  context,
  label = 'Ask DevHub',
  variant = 'ghost',
  className,
}: {
  question: string;
  repoId?: string; // optional real repo id to preselect in the chat
  context?: Record<string, string | number>;
  label?: string;
  variant?: 'ghost' | 'secondary' | 'primary';
  className?: string;
}) {
  const ctx = new URLSearchParams();
  if (repoId) ctx.set('repo', repoId);
  if (context) {
    for (const [k, v] of Object.entries(context)) {
      if (v !== undefined && v !== null) ctx.set(k, String(v));
    }
  }
  ctx.set('q', question);

  return (
    <Link
      href={`/chat?${ctx.toString()}`}
      className={`btn btn-sm ${variant === 'primary' ? 'btn-primary' : variant === 'secondary' ? 'btn-secondary' : 'btn-ghost'} ${className ?? ''}`}
      title="Ask DevHub about this"
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      {label}
    </Link>
  );
}