'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, GitFork, GitPullRequest, FileDiff, Boxes, CircleDot, MessageSquareText } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ScoreRing, SeverityBadge, StatusBadge, EmptyState } from '@/components/ui/primitives';
import { AIReviewPanel } from '@/components/pr-explorer/AIReviewPanel';
import { findPR, findRepo, getFindings, repoOf } from '@/data';

const TABS = [
  { id: 'overview', label: 'Overview', icon: <GitPullRequest className="h-3.5 w-3.5" /> },
  { id: 'ai', label: 'AI Review', icon: <MessageSquareText className="h-3.5 w-3.5" /> },
  { id: 'changes', label: 'Changes', icon: <FileDiff className="h-3.5 w-3.5" /> },
  { id: 'architecture', label: 'Architecture', icon: <Boxes className="h-3.5 w-3.5" /> },
  { id: 'issues', label: 'Issues', icon: <CircleDot className="h-3.5 w-3.5" /> },
] as const;

type Tab = (typeof TABS)[number]['id'];

export default function PRDetailPage({ params }: { params: { repoId: string; prNumber: string } }) {
  const prNumber = Number(params.prNumber);
  const pr = findPR(prNumber) ?? null;
  const repo = repoOf(params.repoId);
  const prFindings = getFindings().filter((f) => f.prNumber === prNumber);
  const [tab, setTab] = useState<Tab>('overview');

  const score = pr?.aiScore ?? null;
  const highCount = prFindings.filter((f) => f.severity === 'high' || f.severity === 'critical').length;
  const mediumCount = prFindings.filter((f) => f.severity === 'medium').length;

  return (
    <div className="space-y-5">
      <Link href="/prs" className="inline-flex items-center gap-1 text-[12.5px] font-medium text-[var(--text-muted)] hover:text-[var(--text)]">
        <ChevronLeft className="h-3.5 w-3.5" /> Pull Requests
      </Link>

      {/* PR header */}
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="mono text-[13px] font-semibold text-[var(--text-faint)]">#{prNumber}</span>
              <span className={cn('badge', pr?.status === 'open' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-600')}>
                <span className={cn('h-1.5 w-1.5 rounded-full', pr?.status === 'open' ? 'bg-emerald-500' : 'bg-slate-400')} />
                {pr?.status ?? 'unknown'}
              </span>
            </div>
            <h1 className="mt-1.5 text-[20px] font-bold tracking-tight text-[var(--text)]">{pr?.title ?? `Pull request #${prNumber}`}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[12.5px] text-[var(--text-muted)]">
              <span className="flex items-center gap-1"><GitFork className="h-3.5 w-3.5" />{repo.fullName}</span>
              {pr && (
                <>
                  <span>{pr.author}</span>
                  <span>·</span>
                  <span>{pr.filesChanged} files changed</span>
                  <span className="mono text-emerald-600">+{pr.additions}</span>
                  <span className="mono text-red-600">−{pr.deletions}</span>
                </>
              )}
            </div>
          </div>
          {score != null && (
            <div className="flex flex-col items-center gap-1">
              <ScoreRing score={score} size={56} label="Overall AI score" />
              <span className="text-[11px] text-[var(--text-faint)]">Overall</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mt-5 flex items-center gap-1 border-b border-[var(--border)]">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-1.5 border-b-2 px-3 py-2 text-[13px] font-medium transition-colors -mb-px',
                tab === t.id ? 'border-accent text-[var(--text)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
              )}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="card p-5 lg:col-span-2">
            <div className="label">AI Summary</div>
            <div className="mt-2 text-[14px] leading-relaxed text-[var(--text-secondary)]">
              {pr ? `${pr.title}. This change is reviewed by the AI reviewer; high-signal findings are shown below.` : 'Select a finding to drill into file and line context.'}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="badge border-red-200 bg-red-50 text-red-700">{highCount} {highCount === 1 ? 'High' : 'High/High+'}</span>
              <span className="badge border-amber-200 bg-amber-50 text-amber-700">{mediumCount} Medium</span>
              <span className="badge border-slate-200 bg-slate-100 text-slate-600">{prFindings.length} Findings</span>
            </div>
            <div className="mt-5 space-y-3">
              {prFindings.slice(0, 6).map((f) => (
                <div key={f.id} className="rounded-lg border border-[var(--border)] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0"><SeverityBadge severity={f.severity} /><span className="truncate text-[13px] font-medium text-[var(--text)]">{f.title}</span></div>
                    <StatusBadge status={f.status} />
                  </div>
                  <div className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--text-secondary)]">{f.description}</div>
                  <div className="mt-2 flex items-center justify-between text-[11.5px]">
                    <span className="mono text-[var(--text-faint)]">{f.file}{f.line != null ? `:${f.line}` : ''}</span>
                    <span className="text-[var(--text-faint)]">{Math.round(f.confidence * 100)}% confidence</span>
                  </div>
                </div>
              ))}
              {prFindings.length === 0 && (
                <EmptyState
                  title="No findings yet"
                  description="This pull request has no findings in the demo dataset. Open the AI Review tab to run a live review."
                />
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div className="card p-5">
              <div className="label">Changes</div>
              <div className="mt-3 space-y-2 text-[13px]">
                <div className="flex justify-between"><span className="text-[var(--text-muted)]">Files changed</span><span className="stat-value font-semibold">{pr?.filesChanged ?? 0}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-muted)]">Additions</span><span className="stat-value font-semibold text-emerald-600">+{pr?.additions ?? 0}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-muted)]">Deletions</span><span className="stat-value font-semibold text-red-600">−{pr?.deletions ?? 0}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-muted)]">Commits</span><span className="stat-value font-semibold">{pr ? 6 : 0}</span></div>
              </div>
            </div>
            <div className="card p-5">
              <div className="label">Repository</div>
              <Link href={`/repos/${repo.id}`} className="mt-2 block font-medium text-[var(--accent)] hover:underline">{repo.name}</Link>
              <Link href={`/dashboard/${repo.id}`} className="mt-1 block text-[12px] text-[var(--text-muted)] hover:text-[var(--text)]">Open full repo workspace →</Link>
            </div>
          </div>
        </div>
      )}

      {tab === 'ai' && (
        <div className="card overflow-hidden">
          <AIReviewPanel repoId={params.repoId} prNumber={params.prNumber} />
          <p className="border-t border-[var(--border)] px-5 py-2.5 text-[11.5px] text-[var(--text-faint)]">
            AI Review uses your live review data when available; demo repos show the empty/error state until connected.
          </p>
        </div>
      )}

      {tab === 'changes' && (
        <EmptyState
          title="No changes loaded"
          description="File-level changes for demo PRs are summarized in the header. Connected repositories show an interactive diff viewer."
          action={<Link href={findRepo(params.repoId) ? `/dashboard/${params.repoId}/pr/${prNumber}` : '/repos'} className="btn btn-primary btn-sm">Open diff viewer</Link>}
        />
      )}
      {tab === 'architecture' && (
        <EmptyState
          title="No architecture impact yet"
          description="PRs that affect architecture show impact here. Check the Architecture page for your current baseline."
          action={<Link href="/architecture" className="btn btn-primary btn-sm">View architecture</Link>}
        />
      )}
      {tab === 'issues' && (
        <EmptyState
          title="No linked issues"
          description="Issues referenced by this PR (e.g. #2345, Fixes #123) will appear here once GitHub data is connected."
        />
      )}
    </div>
  );
}