'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CircleDot, ArrowUpRight, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import { PageHeader, StatCard, SeverityBadge, EmptyState } from '@/components/ui/primitives';
import { DataTable, Column, FilterBar } from '@/components/ui/DataTable';
import { getIssues, getIssueGroups, getRepos, demoMeta } from '@/data';
import { Issue, IssueStatus } from '@/data';

const STATUS_META: Record<IssueStatus, { cls: string; dot: string; label: string }> = {
  open: { cls: 'border-blue-200 bg-blue-50 text-blue-700', dot: 'bg-blue-500', label: 'Open' },
  triage: { cls: 'border-amber-200 bg-amber-50 text-amber-700', dot: 'bg-amber-500', label: 'Triage' },
  assigned: { cls: 'border-indigo-200 bg-indigo-50 text-indigo-700', dot: 'bg-indigo-500', label: 'Assigned' },
  resolved: { cls: 'border-emerald-200 bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', label: 'Resolved' },
  closed: { cls: 'border-slate-200 bg-slate-100 text-slate-500', dot: 'bg-slate-400', label: 'Closed' },
};

function StatusBadge({ status }: { status: IssueStatus }) {
  const m = STATUS_META[status];
  return (
    <span className={cn('badge normal-case', m.cls)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', m.dot)} />
      {m.label}
    </span>
  );
}

export default function IssuesPage() {
  const issues = getIssues();
  const groups = getIssueGroups();
  const repos = getRepos();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const openCount = issues.filter((i) => ['open', 'triage', 'assigned'].includes(i.status)).length;
  const triageCount = issues.filter((i) => i.status === 'triage').length;
  const critHigh = issues.filter((i) => ['critical', 'high'].includes(i.priority) && i.status !== 'closed').length;

  const filtered = useMemo(
    () => (statusFilter === 'all' ? issues : issues.filter((i) => i.status === statusFilter)),
    [issues, statusFilter]
  );

  const repoMap = useMemo(() => Object.fromEntries(repos.map((r) => [r.id, r])), [repos]);

  const columns: Column<Issue>[] = [
    {
      key: 'repo', header: 'Repository',
      render: (i) => {
        const r = repoMap[i.repoId];
        return (
          <Link href={`/repos/${i.repoId}`} className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] hover:text-[var(--accent)]">
            <span className="truncate max-w-[120px]">{r?.name ?? i.repoId}</span>
          </Link>
        );
      },
    },
    {
      key: 'title', header: 'Issue',
      render: (i) => (
        <div>
          <span className="font-medium text-[13px] text-[var(--text)]">#{i.number}</span>{' '}
          <span className="text-[13px] text-[var(--text-secondary)]">{i.title}</span>
          <div className="mt-0.5 flex items-center gap-2">
            {i.detectedByAi && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[var(--accent-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--accent)]">
                <Sparkles className="h-2.5 w-2.5" /> AI detected
              </span>
            )}
            {i.aiConfidence != null && (
              <span className="text-[10.5px] text-[var(--text-faint)]">confidence {Math.round(i.aiConfidence * 100)}%</span>
            )}
          </div>
        </div>
      ),
    },
    { key: 'severity', header: 'Priority', render: (i) => <SeverityBadge severity={i.priority} /> },
    { key: 'status', header: 'Status', render: (i) => <StatusBadge status={i.status} /> },
    { key: 'assignee', header: 'Assignee', render: (i) => <span className="text-[12.5px] text-[var(--text-secondary)]">{i.assignee ?? '—'}</span> },
    { key: 'category', header: 'Category', render: (i) => <span className="text-[12px] text-[var(--text-muted)] capitalize">{i.category}</span> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Workspace"
        title="Issues"
        description="Issue tracking, triage, and AI grouping across your repositories."
        actions={<span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-muted)]">{demoMeta.banner}</span>}
      />

      {/* Stat strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open issues" value={openCount} hint="Across all connected repos" icon={<CircleDot className="h-4 w-4" />} tone="muted" />
        <StatCard label="Needs triage" value={triageCount} hint="Awaiting prioritisation" icon={<ArrowUpRight className="h-4 w-4" />} tone="warn" />
        <StatCard label="Critical / High" value={critHigh} hint="Requiring attention" icon={<CircleDot className="h-4 w-4" />} tone="danger" />
        <StatCard label="AI groups" value={groups.length} hint="Patterns detected by DevHub" icon={<Sparkles className="h-4 w-4" />} tone="ok" />
      </div>

      {/* AI grouping */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-[var(--text)]">AI issue grouping</h3>
          <span className="text-[11px] text-[var(--text-faint)]">{groups.length} groups detected</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {groups.map((g) => (
            <div key={g.id} className="card card-hover p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Sparkles className="h-4 w-4" />
                </span>
                <span className="rounded-full border border-[var(--border)] px-1.5 py-0.5 text-[10.5px] font-semibold text-[var(--text-muted)]">
                  {Math.round(g.confidence * 100)}% conf
                </span>
              </div>
              <div className="mt-2 text-[13px] font-semibold text-[var(--text)]">{g.title}</div>
              <p className="mt-1 text-[11.5px] leading-snug text-[var(--text-muted)]">{g.description}</p>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[var(--text-faint)]">
                {g.memberNumbers.length} issues · {g.repoIds.length} {g.repoIds.length === 1 ? 'repo' : 'repos'}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {g.memberNumbers.map((n) => (
                  <span key={n} className="rounded-md bg-[var(--surface-hover)] px-1.5 py-0.5 text-[10.5px] font-medium text-[var(--text-muted)]">#{n}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Issue table */}
      <section>
        <FilterBar
          active={statusFilter as 'all'}
          onChange={setStatusFilter as (v: string) => void}
          options={[
            { value: 'all', label: 'All', count: issues.length },
            { value: 'open', label: 'Open' },
            { value: 'triage', label: 'Triage' },
            { value: 'assigned', label: 'Assigned' },
            { value: 'resolved', label: 'Resolved' },
            { value: 'closed', label: 'Closed' },
          ]}
        />
        <div className="mt-2">
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(i) => i.id}
            empty={<EmptyState title="No issues here" description="Issues will appear when your repositories are analyzed." />}
          />
        </div>
      </section>
    </div>
  );
}