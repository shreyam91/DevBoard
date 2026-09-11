'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { GitPullRequest } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/ui/primitives';
import { DataTable, Column, FilterBar } from '@/components/ui/DataTable';
import { getPRs, repoOf } from '@/data';
import { PR } from '@/data';

type PRFilter = 'all' | 'needs_review' | 'reviewed' | 'has_findings' | 'conflict' | 'doc_impact';

export default function PRsPage() {
  const prs = getPRs();
  const [filter, setFilter] = useState<PRFilter>('all');

  const filtered = useMemo(() => {
    switch (filter) {
      case 'needs_review': return prs.filter((p) => p.status === 'open' && p.aiScore == null);
      case 'reviewed': return prs.filter((p) => p.aiScore != null);
      case 'has_findings': return prs.filter((p) => p.status === 'open');
      case 'conflict': return prs.filter((p) => p.aiScore != null && p.aiScore < 76);
      case 'doc_impact': return prs.filter((p) => p.status !== 'closed');
      default: return prs;
    }
  }, [prs, filter]);

  const columns: Column<PR>[] = [
    { key: 'pr', header: 'PR', className: 'whitespace-nowrap w-[70px]', render: (p) => <span className="mono text-[var(--text-secondary)]">#{p.number}</span> },
    {
      key: 'title', header: 'Title',
      render: (p) => (
        <div>
          <div className="max-w-[360px] truncate font-medium text-[var(--text)]">{p.title}</div>
          <div className="text-[11.5px] text-[var(--text-muted)]">{p.author} · {repoOf(p.repoId).name}</div>
        </div>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (p) => (
        <span className={`badge ${p.status === 'open' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : p.status === 'merged' ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-100 text-slate-500'}`}>
          {p.status}
        </span>
      ),
    },
    { key: 'score', header: 'AI Score', className: 'whitespace-nowrap', render: (p) => p.aiScore != null ? <span className={`stat-value font-bold ${p.aiScore >= 85 ? 'text-[var(--ok)]' : p.aiScore >= 75 ? 'text-[var(--warning)]' : 'text-[var(--danger)]'}`}>{p.aiScore}</span> : <span className="text-[var(--text-faint)]">—</span> },
    { key: 'changed', header: 'Changed', className: 'whitespace-nowrap', render: (p) => <span className="mono text-[12px] text-[var(--text-secondary)]"><span className="text-emerald-600">+{p.additions}</span> <span className="text-red-600">−{p.deletions}</span></span> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Pull Requests"
        title="Pull requests"
        description="Every PR your AI reviewer has reviewed or is tracking across connected repositories."
      />
      <FilterBar
        active={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: 'All', count: prs.length },
          { value: 'needs_review', label: 'Needs Review' },
          { value: 'reviewed', label: 'Reviewed' },
          { value: 'has_findings', label: 'Has Findings' },
          { value: 'conflict', label: 'Architecture Conflict' },
          { value: 'doc_impact', label: 'Documentation Impact' },
        ]}
      />
      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(p) => String(p.number)}
        onRowClick={(p) => window.open(`/prs/${p.repoId}/${p.number}`, '_self')}
        empty={
          <EmptyState
            title="No pull requests"
            description="Connect a GitHub repository and DevHub will start tracking and reviewing your pull requests."
            action={<Link href="/repos" className="btn btn-primary btn-sm"><GitPullRequest className="h-3.5 w-3.5" /> Connect repository</Link>}
          />
        }
      />
    </div>
  );
}