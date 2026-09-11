import Link from 'next/link';
import { BookOpen, FileText, GitPullRequest, Scale, History } from 'lucide-react';
import { cn } from '@/utils/cn';
import { PageHeader, EmptyState } from '@/components/ui/primitives';
import { DataTable, Column } from '@/components/ui/DataTable';
import { getDocs, findPR, demoMeta } from '@/data';
import { DocItem, DocStatus } from '@/data';

function DocStatusBadge({ status }: { status: DocStatus }) {
  const map: Record<DocStatus, { cls: string; label: string }> = {
    up_to_date: { cls: 'border-emerald-200 bg-emerald-50 text-emerald-700', label: 'Up to date' },
    needs_update: { cls: 'border-amber-200 bg-amber-50 text-amber-700', label: 'Needs update' },
    outdated: { cls: 'border-red-200 bg-red-50 text-red-700', label: 'Outdated' },
    missing: { cls: 'border-slate-200 bg-slate-100 text-slate-500', label: 'Missing' },
  };
  const m = map[status];
  return (
    <span className={cn('badge', m.cls)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', status === 'up_to_date' ? 'bg-emerald-500' : status === 'needs_update' ? 'bg-amber-500' : status === 'outdated' ? 'bg-red-500' : 'bg-slate-400')} />
      {m.label}
    </span>
  );
}

export default function DocsPage() {
  const docs = getDocs();

  const columns: Column<DocItem>[] = [
    {
      key: 'type', header: 'Document',
      render: (d) => (
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--surface-hover)] text-[var(--text-secondary)]"><FileText className="h-4 w-4" /></span>
          <div>
            <div className="font-medium text-[13px] text-[var(--text)]">{d.type}</div>
            <div className="text-[11.5px] text-[var(--text-muted)]">{d.source} · <span className="mono">{d.version}</span></div>
          </div>
        </div>
      ),
    },
    { key: 'status', header: 'Status', className: 'whitespace-nowrap', render: (d) => <DocStatusBadge status={d.status} /> },
    { key: 'updated', header: 'Last updated', render: (d) => d.lastUpdated ? <span className="text-[12.5px] text-[var(--text-secondary)]">{new Date(d.lastUpdated).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span> : <span className="text-[var(--text-faint)]">—</span> },
    {
      key: 'related', header: 'Related',
      render: (d) => {
        const pr = d.relatedPr != null ? findPR(d.relatedPr) : undefined;
        const prHref = pr ? `/prs/${pr.repoId}/${pr.number}` : '/prs';
        return (
          <div className="flex items-center gap-2 text-[12px]">
            <Link href={prHref} className="flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--accent)]">
              <GitPullRequest className="h-3 w-3" />#{d.relatedPr ?? '—'}
            </Link>
            <Link href="/decisions" className="flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--accent)]">
              <Scale className="h-3 w-3" />{(d.relatedAdr ?? '—').replace('ADR-', '')}
            </Link>
          </div>
        );
      },
    },
  ];

  const needsUpdate = docs.find((d) => d.status === 'needs_update')!;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Engineering"
        title="Project documentation"
        description="The foundation for Living Documentation — docs tracked alongside the code that changes them."
        actions={<span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-muted)]">{demoMeta.banner}</span>}
      />

      <DataTable
        columns={columns}
        rows={docs}
        rowKey={(d) => d.id}
        empty={<EmptyState title="No documents yet" description="DevHub will track PRDs, specs, and architecture docs as living documents." />}
      />

      {/* Changes detected panel */}
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold">{needsUpdate.type}</h3>
          <DocStatusBadge status={needsUpdate.status} />
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-amber-50/50 p-4 text-[13px]">
          <div className="font-medium text-[var(--text)]">Changes detected</div>
          <p className="mt-1 text-[12.5px] text-[var(--text-secondary)]">
            PR #{needsUpdate.relatedPr ?? '—'} introduced Redis caching and background-job behaviour not yet reflected in {needsUpdate.source}.
          </p>
        </div>
        <div className="mt-4 flex items-center gap-4 text-[12px] text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5"><History className="h-3.5 w-3.5" />Last updated {needsUpdate.lastUpdated ? new Date(needsUpdate.lastUpdated).toLocaleDateString() : ''}</span>
          <span className="flex items-center gap-1.5"><GitPullRequest className="h-3.5 w-3.5" />Related PR #{needsUpdate.relatedPr ?? '—'}</span>
        </div>
        <div className="mt-4 flex gap-2">
          <button className="btn btn-primary btn-sm"><BookOpen className="h-3.5 w-3.5" /> Review changes</button>
          <button className="btn btn-secondary btn-sm">Generate update draft</button>
        </div>
      </div>
    </div>
  );
}