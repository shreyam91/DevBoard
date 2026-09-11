import Link from 'next/link';
import { GitFork, CircleDot, ArrowUpRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { PageHeader, EmptyState } from '@/components/ui/primitives';
import { getRepos } from '@/data';

export default function ReposPage() {
  const repos = getRepos();
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Repositories"
        title="Repositories"
        description="Connected GitHub repositories under DevHub's engineering intelligence."
      />
      {repos.length === 0 ? (
        <EmptyState title="No repositories connected" description="Connect a GitHub repository and DevHub will analyze its architecture, PRs, and documentation." action={<Link href="/dashboard" className="btn btn-primary btn-sm"><GitFork className="h-3.5 w-3.5" /> Connect repository</Link>} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {repos.map((r) => (
            <Link key={r.id} href={`/repos/${r.id}`} className="card card-hover p-5 block">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--surface-hover)] text-[var(--text-secondary)]"><GitFork className="h-4 w-4" /></span>
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-[13.5px] text-[var(--text)]">{r.name}</div>
                    <div className="truncate text-[11.5px] text-[var(--text-muted)]">{r.tech}</div>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--text-faint)]" />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-y-3 text-[12px]">
                <div><div className="text-[16px] font-bold stat-value">{r.stats.prs}</div><div className="text-[var(--text-muted)]">PRs</div></div>
                <div><div className="text-[16px] font-bold stat-value">{r.stats.commits.toLocaleString()}</div><div className="text-[var(--text-muted)]">Commits</div></div>
                <div><div className="text-[16px] font-bold stat-value">{r.stats.contributors}</div><div className="text-[var(--text-muted)]">Contributors</div></div>
                <div><div className="text-[16px] font-bold stat-value">{r.stats.openIssues}</div><div className="text-[var(--text-muted)]">Open issues</div></div>
              </div>

              <div className="mt-5 space-y-1.5">
                {([
                  ['Architecture', r.health.architecture],
                  ['Documentation', r.health.documentation],
                  ['Code quality', r.health.codeQuality],
                ] as const).map(([label, val]) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="w-24 text-[11px] text-[var(--text-muted)]">{label}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-hover)]">
                      <div className={cn('h-full rounded-full', val >= 80 ? 'bg-[var(--ok)]' : val >= 60 ? 'bg-[var(--warning)]' : 'bg-[var(--danger)]')} style={{ width: `${val}%` }} />
                    </div>
                    <span className="w-7 text-right text-[11px] font-semibold stat-value">{val}</span>
                  </div>
                ))}
              </div>

              <div className={`mt-4 flex items-center gap-1.5 text-[11.5px] font-medium ${r.health.aiReview === 'Healthy' ? 'text-[var(--ok)]' : r.health.aiReview === 'Needs attention' ? 'text-[var(--warning)]' : 'text-[var(--danger)]'}`}>
                <CircleDot className="h-3 w-3" /> AI review: {r.health.aiReview}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}