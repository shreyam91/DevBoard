import Link from 'next/link';
import { ArrowRight, Activity as ActivityIcon, GitPullRequest, Scale, ArrowUpRight } from 'lucide-react';
import { StatCard, PageHeader, ActivityItem } from '@/components/ui/primitives';
import { getProjects, getRepos, getActivity, getFindingCounts, getADRs, getDocs, demoMeta } from '@/data';

function HealthPill({ healthy, needs, critical }: { healthy: number; needs: number; critical: number }) {
  return (
    <div className="flex items-center gap-3 text-[12.5px]">
      <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--ok)]" />{healthy} Healthy</span>
      <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--warning)]" />{needs} Needs Attention</span>
      <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--danger)]" />{critical} Critical</span>
    </div>
  );
}

export default function OverviewPage() {
  const projects = getProjects();
  const repos = getRepos();
  const activity = getActivity().slice(0, 8);
  const counts = getFindingCounts();
  const adrs = getADRs();
  const docs = getDocs();

  const healthy = projects.filter((p) => p.health.health >= 80).length;
  const needs = projects.filter((p) => p.health.health >= 60 && p.health.health < 80).length;
  const critical = projects.length - healthy - needs;
  const reviewed = getRepos().reduce((s, r) => s + r.stats.prs, 0);
  const falsePosRate = 8;
  const avgReviewTime = 38;

  const openFindings = counts.open;
  const highTotal = counts.high + counts.critical;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Engineering overview"
        description="What is happening in your projects, reviews, and documentation at a glance."
        actions={
          <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-muted)]">{demoMeta.banner}</span>
        }
      />

      {/* Row 1 — Project Health */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-[var(--text)]">Project Health</h3>
          <span className="text-[12px] text-[var(--text-faint)]">{projects.length} projects</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Projects" value={projects.length} hint={<HealthPill healthy={healthy} needs={needs} critical={critical} />} />
          <StatCard label="PRs reviewed" value={reviewed} hint={`${openFindings} findings currently open`} icon={<GitPullRequest className="h-4 w-4" />} tone="ok" />
          <StatCard label="High severity" value={highTotal} hint={`${counts.critical} critical · ${counts.high} high`} icon={<ArrowUpRight className="h-4 w-4" />} tone="warn" />
          <StatCard label="Avg review time" value={`${avgReviewTime}s`} hint={`False-positive rate ${falsePosRate}%`} icon={<ActivityIcon className="h-4 w-4" />} tone="muted" />
        </div>
      </section>

      {/* Row 2 — Architecture + Docs health */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">Architecture Health</h3>
            <Scale className="h-4 w-4 text-[var(--text-faint)]" />
          </div>
          <div className="mt-3 flex items-end gap-3">
            <span className="text-[32px] font-bold leading-none stat-value">84</span>
            <span className="text-[13px] font-medium text-[var(--text-muted)]">/ 100</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-[12px]">
            <div className="rounded-lg bg-[var(--surface-subtle)] p-3"><div className="text-[20px] font-bold">{adrs.length}</div><div className="text-[var(--text-muted)]">Decisions</div></div>
            <div className="rounded-lg bg-[var(--surface-subtle)] p-3"><div className="text-[20px] font-bold">4</div><div className="text-[var(--text-muted)]">Potential conflicts</div></div>
            <div className="rounded-lg bg-[var(--surface-subtle)] p-3"><div className="text-[20px] font-bold">3</div><div className="text-[var(--text-muted)]">Outdated decisions</div></div>
          </div>
          <Link href="/architecture" className="btn btn-ghost mt-4 h-8 w-full justify-between group"><span>Open architecture</span><ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" /></Link>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">Documentation Health</h3>
            <span className="badge normal-case border-emerald-200 bg-emerald-50 text-emerald-700">78% covered</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-[12px]">
            {[{ label: 'Up to date', n: docs.filter((d) => d.status === 'up_to_date').length, cls: 'bg-[var(--ok)]' },
              { label: 'Needs update', n: docs.filter((d) => d.status === 'needs_update').length, cls: 'bg-[var(--warning)]' },
              { label: 'Outdated', n: docs.filter((d) => d.status === 'outdated' || d.status === 'missing').length, cls: 'bg-[var(--danger)]' }].map(({ label, n, cls }) => (
              <div key={label} className="rounded-lg bg-[var(--surface-subtle)] p-3">
                <div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${cls}`} /><span className="text-[20px] font-bold">{n}</span></div>
                <div className="text-[var(--text-muted)]">{label}</div>
              </div>
            ))}
          </div>
          <Link href="/docs" className="btn btn-ghost mt-4 h-8 w-full justify-between group"><span>Open documentation</span><ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" /></Link>
        </div>
      </section>

      {/* Row 3 — Recent activity */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-[var(--text)]">Recent Activity</h3>
          <Link href="/activity" className="text-[12px] font-medium text-[var(--accent)] hover:underline">View all</Link>
        </div>
        <div className="card divide-y divide-[var(--border)] px-4 py-1">
          {activity.map((a) => (
            <ActivityItem key={a.id} type={a.type} time={a.time}>
              <span className="font-semibold text-[var(--text)]">{a.summary}</span>
              {a.detail && <span className="text-[var(--text-muted)]"> — {a.detail}</span>}
            </ActivityItem>
          ))}
        </div>
      </section>

      {/* Row 4 — Repositories quick list */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-[var(--text)]">Repositories</h3>
          <Link href="/repos" className="text-[12px] font-medium text-[var(--accent)] hover:underline">View all</Link>
        </div>
        <div className="card divide-y divide-[var(--border)]">
          {repos.map((r) => (
            <Link key={r.id} href={`/repos/${r.id}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-[var(--surface-hover)] transition-colors">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[13px] text-[var(--text)]">{r.name}</span>
                  <span className="text-[11px] text-[var(--text-faint)]">{r.tech}</span>
                </div>
                <div className="mt-0.5 text-[12px] text-[var(--text-muted)]">{r.stats.prs} PRs · {r.stats.commits.toLocaleString()} commits · {r.fullName}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[12px] text-[var(--text-muted)]">AI review</div>
                  <div className={`text-[13px] font-semibold ${r.health.aiReview === 'Healthy' ? 'text-[var(--ok)]' : r.health.aiReview === 'Needs attention' ? 'text-[var(--warning)]' : 'text-[var(--danger)]'}`}>{r.health.aiReview}</div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-[var(--text-faint)]" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}