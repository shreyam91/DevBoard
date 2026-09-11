import { notFound } from 'next/navigation';
import Link from 'next/link';
import { GitFork, GitPullRequest, Users, CircleDot, ArrowUpRight, ExternalLink } from 'lucide-react';
import { cn } from '@/utils/cn';
import { PageHeader, EmptyState, SeverityBadge } from '@/components/ui/primitives';
import { findRepo, getPRs, getFindings } from '@/data';

export default function RepoDetailPage({ params }: { params: { repoId: string } }) {
  const repo = findRepo(params.repoId);
  if (!repo) notFound();

  const prs = getPRs().filter((p) => p.repoId === repo.id).slice(0, 5);
  const findings = getFindings().filter((f) => f.repoId === repo.id).slice(0, 5);
  const health = repo.health;

  const healthBars: [string, number][] = [
    ['Architecture', health.architecture],
    ['Documentation', health.documentation],
    ['Code quality', health.codeQuality],
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={repo.fullName}
        title={repo.name}
        description={repo.tech}
        actions={
          <Link href={`/dashboard/${repo.id}`} className="btn btn-secondary btn-sm">
            <ExternalLink className="h-3.5 w-3.5" /> Open full repository workspace
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Health */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">Health</h3>
            <span className={`badge ${health.aiReview === 'Healthy' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : health.aiReview === 'Needs attention' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-red-200 bg-red-50 text-red-700'}`}>{health.aiReview}</span>
          </div>
          <div className="mt-4 space-y-3">
            {healthBars.map(([label, val]) => (
              <div key={label}>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[var(--text-muted)]">{label}</span>
                  <span className="font-semibold stat-value">{val}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--surface-hover)]">
                  <div className={cn('h-full rounded-full', val >= 80 ? 'bg-[var(--ok)]' : val >= 60 ? 'bg-[var(--warning)]' : 'bg-[var(--danger)]')} style={{ width: `${val}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="card p-5">
          <h3 className="text-[13px] font-semibold">Repository stats</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { icon: <GitPullRequest className="h-4 w-4" />, label: 'PRs', value: repo.stats.prs },
              { icon: <GitFork className="h-4 w-4" />, label: 'Commits', value: repo.stats.commits.toLocaleString() },
              { icon: <Users className="h-4 w-4" />, label: 'Contributors', value: repo.stats.contributors },
              { icon: <CircleDot className="h-4 w-4" />, label: 'Open issues', value: repo.stats.openIssues },
            ].map((s) => (
              <div key={s.label} className="rounded-lg bg-[var(--surface-subtle)] p-3">
                <div className="flex items-center gap-1.5 text-[var(--text-muted)]">{s.icon}<span className="text-[11.5px]">{s.label}</span></div>
                <div className="mt-1 text-[20px] font-bold stat-value">{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI review health */}
        <div className="card p-5">
          <h3 className="text-[13px] font-semibold">Open findings</h3>
          <div className="mt-4 space-y-2">
            {findings.slice(0, 4).map((f) => (
              <div key={f.id} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <SeverityBadge severity={f.severity} />
                  <span className="truncate text-[12.5px] text-[var(--text-secondary)]">{f.title}</span>
                </div>
                <Link href={`/prs/${f.repoId}/${f.prNumber}`} className="shrink-0 mono text-[11px] text-[var(--text-faint)] hover:text-[var(--accent)]">#{f.prNumber}</Link>
              </div>
            ))}
            {findings.length === 0 && <div className="text-[12.5px] text-[var(--text-muted)]">No findings for this repo in the demo set.</div>}
          </div>
        </div>
      </div>

      {/* Recent PRs */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-[var(--text)]">Recent PRs</h3>
          <Link href="/prs" className="text-[12px] font-medium text-[var(--accent)] hover:underline">View all</Link>
        </div>
        <div className="card divide-y divide-[var(--border)]">
          {prs.map((p) => (
            <Link key={p.number} href={`/prs/${p.repoId}/${p.number}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-[var(--surface-hover)] transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <span className="mono text-[12px] text-[var(--text-faint)]">#{p.number}</span>
                <span className="truncate text-[13px] font-medium text-[var(--text)]">{p.title}</span>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                {p.aiScore != null ? (
                  <span className="text-[12px] text-[var(--text-muted)]">AI review: <span className={`font-semibold ${p.aiScore >= 85 ? 'text-[var(--ok)]' : p.aiScore >= 75 ? 'text-[var(--warning)]' : 'text-[var(--danger)]'}`}>{p.aiScore}</span></span>
                ) : <span className="text-[12px] text-[var(--text-faint)]">Not reviewed</span>}
                <ArrowUpRight className="h-4 w-4 text-[var(--text-faint)]" />
              </div>
            </Link>
          ))}
          {prs.length === 0 && <div className="p-6 text-center text-[13px] text-[var(--text-muted)]">No PRs in the demo set for this repo.</div>}
        </div>
      </div>

      {/* Repo action */}
      <EmptyState
        title="Full repository tools available"
        description="Commits, PR diffs, architecture graphs, decisions, conflicts, and settings live in the dedicated repository workspace."
        action={<Link href={`/dashboard/${repo.id}`} className="btn btn-primary btn-sm"><ArrowUpRight className="h-3.5 w-3.5" /> Open {repo.name}</Link>}
      />
    </div>
  );
}