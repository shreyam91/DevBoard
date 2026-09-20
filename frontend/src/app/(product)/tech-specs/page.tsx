import Link from 'next/link';
import { FileText, GitPullRequest, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { PageHeader, EmptyState } from '@/components/ui/primitives';
import { DataTable, Column } from '@/components/ui/DataTable';
import { getTechSpecs, getRepos, findPR, demoMeta } from '@/data';
import { TechSpec, SpecStatus, SpecKind, SpecSyncStatus } from '@/data';

function SpecKindBadge({ kind }: { kind: SpecKind }) {
  const cls: Record<SpecKind, string> = {
    rfc: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    api: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    implementation: 'border-amber-200 bg-amber-50 text-amber-700',
    migration: 'border-purple-200 bg-purple-50 text-purple-700',
  };
  return <span className={cn('badge normal-case', cls[kind])}>{kind === 'rfc' ? 'RFC' : kind.charAt(0).toUpperCase() + kind.slice(1)}</span>;
}

function SpecStatusBadge({ status }: { status: SpecStatus }) {
  const cls: Record<SpecStatus, { outer: string; dot: string; label: string }> = {
    proposed: { outer: 'border-blue-200 bg-blue-50 text-blue-700', dot: 'bg-blue-500', label: 'Proposed' },
    in_review: { outer: 'border-amber-200 bg-amber-50 text-amber-700', dot: 'bg-amber-500', label: 'In review' },
    approved: { outer: 'border-emerald-200 bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', label: 'Approved' },
    superseded: { outer: 'border-slate-200 bg-slate-100 text-slate-500', dot: 'bg-slate-400', label: 'Superseded' },
  };
  const m = cls[status];
  return <span className={cn('badge normal-case', m.outer)}><span className={cn('h-1.5 w-1.5 rounded-full', m.dot)} />{m.label}</span>;
}

function SyncBadge({ sync }: { sync: SpecSyncStatus }) {
  const m: Record<SpecSyncStatus, { cls: string; label: string; icon: React.ReactNode }> = {
    in_sync: { cls: 'border-emerald-200 bg-emerald-50 text-emerald-700', label: 'In sync', icon: <CheckCircle2 className="h-3 w-3 text-emerald-500" /> },
    needs_update: { cls: 'border-amber-200 bg-amber-50 text-amber-700', label: 'Needs update', icon: <AlertTriangle className="h-3 w-3 text-amber-500" /> },
    unknown: { cls: 'border-slate-200 bg-slate-100 text-slate-500', label: 'Unknown', icon: null },
  };
  const ms = m[sync];
  return <span className={cn('badge normal-case', ms.cls)}>{ms.icon}{ms.label}</span>;
}

export default function TechSpecsPage() {
  const specs = getTechSpecs();
  const repos = getRepos();
  const repoMap = Object.fromEntries(repos.map((r) => [r.id, r]));

  const needUpdate = specs.filter((s) => s.syncStatus === 'needs_update');

  const columns: Column<TechSpec>[] = [
    {
      key: 'spec', header: 'Spec',
      render: (s) => (
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--surface-hover)] text-[var(--text-secondary)]">
            <FileText className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="mono text-[11.5px] font-semibold text-[var(--text-faint)]">{s.specNumber}</span>
              <SpecKindBadge kind={s.kind} />
            </div>
            <div className="mt-0.5 truncate text-[13px] font-medium text-[var(--text)]">{s.title}</div>
            <div className="text-[11.5px] text-[var(--text-muted)]">{repoMap[s.repositoryId]?.name ?? s.repositoryId} · {s.author} · <span className="mono">{s.version}</span></div>
          </div>
        </div>
      ),
    },
    { key: 'status', header: 'Status', className: 'whitespace-nowrap', render: (s) => <SpecStatusBadge status={s.status} /> },
    { key: 'sync', header: 'Code sync', className: 'whitespace-nowrap', render: (s) => <SyncBadge sync={s.syncStatus} /> },
    { key: 'updated', header: 'Date', render: (s) => <span className="text-[12.5px] text-[var(--text-secondary)]">{new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span> },
    {
      key: 'related', header: 'Related PRs',
      render: (s) => (
        <div className="flex flex-wrap items-center gap-1.5">
          {s.relatedPrs.map((num) => {
            const pr = findPR(num);
            const href = pr ? `/prs/${pr.repoId}/${pr.number}` : '/prs';
            return (
              <Link key={num} href={href} className="flex items-center gap-1 text-[11.5px] text-[var(--text-muted)] hover:text-[var(--accent)]">
                <GitPullRequest className="h-3 w-3" />#{num}
              </Link>
            );
          })}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Engineering"
        title="Tech specs"
        description="RFCs and implementation specs, kept in sync with the code that implements them."
        actions={<span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-muted)]">{demoMeta.banner}</span>}
      />

      {/* Code-sync health panel */}
      {needUpdate.length > 0 && (
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">Code sync health</h3>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10.5px] font-semibold text-amber-700">{needUpdate.length} {needUpdate.length === 1 ? 'spec' : 'specs'} out of sync</span>
          </div>
          <div className="space-y-2">
            {needUpdate.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-amber-50/30 px-4 py-3">
                <div className="min-w-0">
                  <span className="mono text-[11.5px] font-semibold text-[var(--text-faint)]">{s.specNumber}</span>
                  <span className="ml-2 text-[13px] font-medium text-[var(--text)]">{s.title}</span>
                  {s.relatedPrs.length > 0 && (
                    <span className="ml-2 text-[11.5px] text-[var(--text-muted)]">
                      (PR {s.relatedPrs.map((n) => `#${n}`).join(', ')} changed)
                    </span>
                  )}
                </div>
                <button className="btn btn-secondary btn-sm whitespace-nowrap">
                  <AlertTriangle className="h-3.5 w-3.5" /> Review spec
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={specs}
        rowKey={(s) => s.id}
        empty={<EmptyState title="No tech specs yet" description="RFCs and implementation specs will appear here as they are authored." />}
      />
    </div>
  );
}