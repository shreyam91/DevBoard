'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GitPullRequest, FileText, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { PageHeader } from '@/components/ui/primitives';
import { getADRs, getDocs, findPR, demoMeta } from '@/data';
import { ADR } from '@/data';
import AskDevHubButton from '@/components/AskDevHubButton';

function AdrStatusBadge({ status }: { status: ADR['status'] }) {
  const map: Record<ADR['status'], { cls: string; dot: string; label: string }> = {
    accepted: { cls: 'border-emerald-200 bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', label: 'Accepted' },
    proposed: { cls: 'border-blue-200 bg-blue-50 text-blue-700', dot: 'bg-blue-500', label: 'Proposed' },
    superseded: { cls: 'border-slate-200 bg-slate-100 text-slate-500', dot: 'bg-slate-400', label: 'Superseded' },
  };
  const m = map[status];
  return <span className={cn('badge', m.cls)}><span className={cn('h-1.5 w-1.5 rounded-full', m.dot)} />{m.label}</span>;
}

export default function DecisionsPage() {
  const adrs = getADRs();
  const docs = getDocs();
  const [selected, setSelected] = useState<ADR>(adrs[0]);

  const docName = (id: string) => (docs.find((d) => d.id === id)?.type ?? id);
  const prRepo = (num: number) => {
    const pr = findPR(num);
    return pr ? { pr, href: `/prs/${pr.repoId}/${pr.number}` } : undefined;
  };

  const rel = selected;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Engineering"
        title="Architecture decisions"
        description="Accepted, proposed, and superseded ADRs — the record of how this system got to where it is."
        actions={<span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-muted)]">{adrs.length} ADRs · {demoMeta.source}</span>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* List */}
        <div className="lg:col-span-2">
          <div className="card divide-y divide-[var(--border)]">
            {adrs.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelected(a)}
                className={cn(
                  'flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors',
                  selected.id === a.id ? 'bg-[var(--surface-hover)]' : 'hover:bg-[var(--surface-subtle)]'
                )}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="mono text-[11.5px] font-semibold text-[var(--text-faint)]">{a.adrNumber}</span>
                    <AdrStatusBadge status={a.status} />
                  </div>
                  <div className="mt-1 truncate text-[13px] font-medium text-[var(--text)]">{a.title}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">{new Date(a.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>
                <ArrowRight className={cn('mt-1 h-4 w-4 shrink-0', selected.id === a.id ? 'text-[var(--accent)]' : 'text-[var(--text-faint)]')} />
              </button>
            ))}
          </div>
        </div>

        {/* Detail */}
        <div className="lg:col-span-3">
          <div className="card p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mono text-[13px] font-semibold text-[var(--text-faint)]">{rel.adrNumber}</span>
              <AdrStatusBadge status={rel.status} />
              <AskDevHubButton
                className="ml-auto"
                question={`Explain ${rel.adrNumber} (${rel.title}): what it decides and why`}
                context={{ adr: rel.adrNumber }}
                label="Ask about this ADR"
                variant="secondary"
              />
            </div>
            <h2 className="mt-2 text-[18px] font-bold tracking-tight text-[var(--text)]">{rel.title}</h2>

            <div className="mt-5 space-y-5 text-[13px] leading-relaxed">
              <section>
                <div className="label">Context</div>
                <p className="mt-1 text-[var(--text-secondary)]">{rel.context}</p>
              </section>
              <section>
                <div className="label">Decision</div>
                <p className="mt-1 text-[var(--text)]">{rel.decision}</p>
              </section>
              <section>
                <div className="label">Alternatives considered</div>
                <ul className="mt-1 list-inside list-disc space-y-1 text-[var(--text-secondary)]">
                  {rel.alternatives.map((alt) => <li key={alt}>{alt}</li>)}
                </ul>
              </section>
              <section>
                <div className="label">Consequences</div>
                <ul className="mt-1 space-y-1 text-[var(--text-secondary)]">
                  {rel.consequences.map((c) => (
                    <li key={c} className="flex items-start gap-2">
                      <span className={cn('mt-0.5 text-[11px]', c.startsWith('+') ? 'text-[var(--ok)]' : 'text-[var(--danger)]')}>{c.startsWith('+') ? '▲' : '▼'}</span>
                      <span>{c.replace(/^[+-]\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <div className="label">Related</div>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {rel.relatedPrs.map((num) => {
                    const r = prRepo(num);
                    if (!r) return null;
                    return (
                      <Link key={num} href={r.href} className="flex items-center gap-1.5 rounded-md border border-[var(--border)] px-2.5 py-1.5 text-[12px] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]">
                        <GitPullRequest className="h-3.5 w-3.5" />PR #{num}
                      </Link>
                    );
                  })}
                  {rel.relatedDocs.map((id) => (
                    <Link key={id} href="/docs" className="flex items-center gap-1.5 rounded-md border border-[var(--border)] px-2.5 py-1.5 text-[12px] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]">
                      <FileText className="h-3.5 w-3.5" />{docName(id)}
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}