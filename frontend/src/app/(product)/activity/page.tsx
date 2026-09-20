'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Activity as ActivityIcon, GitPullRequest, ShieldCheck, AlertTriangle } from 'lucide-react';
import { PageHeader, StatCard, EmptyState, ActivityItem } from '@/components/ui/primitives';
import { FilterBar } from '@/components/ui/DataTable';
import { getActivity, getRepos, repoOf, demoMeta } from '@/data';
import { ActivityEvent } from '@/data';

type Type = 'all' | ActivityEvent['type'];

const TYPE_LABEL: Record<ActivityEvent['type'], string> = {
  pr: 'Pull request',
  adr: 'Decision',
  conflict: 'Conflict',
  doc: 'Documentation',
  review: 'Review',
  insight: 'Insight',
};

export default function ActivityPage() {
  const activity = getActivity();
  const [type, setType] = useState<Type>('all');

  const counts: Record<ActivityEvent['type'], number> = useMemo(() => {
    const c: Record<ActivityEvent['type'], number> = { pr: 0, adr: 0, conflict: 0, doc: 0, review: 0, insight: 0 };
    for (const a of activity) c[a.type]++;
    return c;
  }, [activity]);

  const filtered = useMemo(
    () => (type === 'all' ? activity : activity.filter((a) => a.type === type)),
    [activity, type]
  );

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="System"
        title="Activity"
        description="A live, filterable feed of every event DevHub tracks across your workspace."
        actions={<span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-muted)]">{demoMeta.banner}</span>}
      />

      {/* Stat strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Events tracked" value={activity.length} hint="Across all repositories" icon={<ActivityIcon className="h-4 w-4" />} tone="muted" />
        <StatCard label="Reviews" value={counts.review} hint="CI + DevHub AI" icon={<ShieldCheck className="h-4 w-4" />} tone="ok" />
        <StatCard label="Pull requests" value={counts.pr} hint={`${repoOf('devhub-api').fullName} and more`} icon={<GitPullRequest className="h-4 w-4" />} tone="muted" />
        <StatCard label="Conflicts" value={counts.conflict} hint="Detected across PRs" icon={<AlertTriangle className="h-4 w-4" />} tone="warn" />
      </div>

      <FilterBar
        active={type}
        onChange={setType}
        options={[
          { value: 'all', label: 'All', count: activity.length },
          { value: 'review', label: 'Reviews', count: counts.review },
          { value: 'pr', label: 'Pull requests', count: counts.pr },
          { value: 'adr', label: 'Decisions', count: counts.adr },
          { value: 'conflict', label: 'Conflicts', count: counts.conflict },
          { value: 'doc', label: 'Documentation', count: counts.doc },
          { value: 'insight', label: 'Insights', count: counts.insight },
        ]}
      />

      {filtered.length === 0 ? (
        <EmptyState title="No activity here" description="Events matching this filter will appear as they happen." />
      ) : (
        <div className="card divide-y divide-[var(--border)] px-4 py-1">
          {filtered.map((a) => {
            const repo = a.repoId ? getRepos().find((r) => r.id === a.repoId) : undefined;
            return (
              <ActivityItem key={a.id} type={a.type} time={a.time}>
                {repo ? <Link href={`/repos/${repo.id}`} className="text-[var(--accent)] hover:underline">{repo.name}</Link> : <span className="uppercase text-[10px] font-semibold tracking-wider text-[var(--text-faint)]">{TYPE_LABEL[a.type]}</span>}
                {' · '}
                <span className="font-semibold text-[var(--text)]">{a.summary}</span>
                {a.detail && <span className="text-[var(--text-muted)]"> — {a.detail}</span>}
              </ActivityItem>
            );
          })}
        </div>
      )}
    </div>
  );
}