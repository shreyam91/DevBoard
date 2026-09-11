'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Network, AlertTriangle, FileText, ArrowUpRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { PageHeader, EmptyState, SeverityBadge } from '@/components/ui/primitives';
import { FilterBar } from '@/components/ui/DataTable';
import { getInsights, getRepos, demoMeta } from '@/data';
import { Insight } from '@/data';

type Kind = 'all' | 'drift' | 'issue' | 'docsDrift';

const KIND_META: Record<Insight['kind'], { icon: React.ReactNode; label: string; cls: string }> = {
  drift: { icon: <Network className="h-4 w-4" />, label: 'Architecture drift', cls: 'bg-[var(--accent-soft)] text-[var(--accent)]' },
  issue: { icon: <AlertTriangle className="h-4 w-4" />, label: 'Repeated issue', cls: 'bg-amber-50 text-amber-600' },
  docsDrift: { icon: <FileText className="h-4 w-4" />, label: 'Documentation drift', cls: 'bg-emerald-50 text-emerald-600' },
};

export default function InsightsPage() {
  const insights = getInsights();
  const [kind, setKind] = useState<Kind>('all');

  const filtered = useMemo(
    () => (kind === 'all' ? insights : insights.filter((i) => i.kind === kind)),
    [insights, kind]
  );

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="AI"
        title="Project intelligence"
        description="Cross-repository insights the AI reader surfaces automatically — patterns, drift, and doc debt worth acting on."
        actions={<span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-muted)]">{demoMeta.banner}</span>}
      />

      <FilterBar
        active={kind}
        onChange={setKind}
        options={[
          { value: 'all', label: 'All', count: insights.length },
          { value: 'drift', label: 'Architecture drift' },
          { value: 'issue', label: 'Repeated issues' },
          { value: 'docsDrift', label: 'Documentation drift' },
        ]}
      />

      {filtered.length === 0 ? (
        <EmptyState title="No insights right now" description="When DevHub detects drift or repeated issues across your repositories, they'll appear here." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((i) => {
            const meta = KIND_META[i.kind];
            const repos = i.repoIds.map((id) => getRepos().find((r) => r.id === id)).filter(Boolean);
            return (
              <div key={i.id} className="card card-hover p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <span className={cn('flex h-8 w-8 items-center justify-center rounded-md', meta.cls)}>{meta.icon}</span>
                    <span className="text-[11.5px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">{meta.label}</span>
                  </div>
                  <SeverityBadge severity={i.severity} />
                </div>
                <h3 className="mt-3 text-[14px] font-semibold text-[var(--text)]">{i.title}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--text-secondary)]">{i.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {repos.map((r) => r && (
                    <Link key={r.id} href={`/repos/${r.id}`} className="flex items-center gap-1 text-[12px] text-[var(--text-muted)] hover:text-[var(--accent)]">
                      {r.name}<ArrowUpRight className="h-3 w-3" />
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}