import Link from 'next/link';
import { Server, Layers, Zap, Boxes, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { PageHeader, ScoreRing, StatCard } from '@/components/ui/primitives';
import { getRepos, getADRs, demoMeta } from '@/data';

/* Lightweight inference of the stack from the repo set + the shared infra it runs on */
const STACK = [
  { name: 'Next.js', role: 'Frontend · App Router', on: 'devhub-frontend', iconColor: 'text-slate-700' },
  { name: 'React', role: 'UI', on: 'devhub-frontend', iconColor: 'text-cyan-600' },
  { name: 'Node.js', role: 'API · Fastify', on: 'devhub-api', iconColor: 'text-emerald-600' },
  { name: 'BullMQ', role: 'Background jobs', on: 'devhub-worker', iconColor: 'text-orange-600' },
  { name: 'PostgreSQL', role: 'Primary store · pgvector', on: 'All services', iconColor: 'text-blue-600' },
  { name: 'Redis', role: 'Cache · rate limiting', on: 'devhub-api', iconColor: 'text-red-600' },
];

/* Static service → dependency map (minimal, labeled as parsed from the repo set) */
const MAP_LAYERS: { label: string; nodes: { name: string; sub: string; accent?: boolean }[] }[] = [
  { label: 'Presentation', nodes: [{ name: 'Next.js', sub: 'devhub-frontend' }] },
  { label: 'API', nodes: [{ name: 'Fastify', sub: 'devhub-api' }, { name: 'Spring Boot', sub: 'jobpulse-api' }] },
  { label: 'Workers', nodes: [{ name: 'BullMQ', sub: 'devhub-worker', accent: true }] },
  { label: 'Data', nodes: [{ name: 'PostgreSQL', sub: 'relational + vector' }, { name: 'Redis', sub: 'cache / queues' }] },
];

export default function ArchitecturePage() {
  const repos = getRepos().filter((r) => r.connected);
  const adrs = getADRs();
  const avg = Math.round(repos.reduce((s, r) => s + r.health.architecture, 0) / Math.max(1, repos.length));

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Engineering"
        title="Architecture"
        description="How your repositories fit together — inferred from code, kept honest by your ADRs."
        actions={<span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-muted)]">{demoMeta.source} · parsed from repo set</span>}
      />

      {/* Overview stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Architecture health" value={`${avg}%`} hint="weighted across connected repos" />
        <StatCard label="Connected services" value={String(repos.length)} hint="repositories contributing" />
        <StatCard label="Decisions (ADRs)" value={String(adrs.length)} hint={`${adrs.filter((a) => a.status === 'accepted').length} accepted`} />
        <StatCard label="Baseline drifts" value="2" hint="PRs diverging from ADR-019/027" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Per-repo architecture health */}
        <div className="card p-5 lg:col-span-2">
          <div className="label mb-4">Repository architecture</div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {repos.map((r) => (
              <Link key={r.id} href={`/repos/${r.id}`} className="rounded-lg border border-[var(--border)] p-4 hover:border-[var(--border-strong)] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded bg-[var(--surface-hover)] text-[var(--text-secondary)]"><Boxes className="h-3.5 w-3.5" /></span>
                    <span className="mono text-[13px] font-semibold text-[var(--text)]">{r.name}</span>
                  </div>
                  <ScoreRing score={r.health.architecture} size={40} />
                </div>
                <div className="mt-2 text-[11.5px] text-[var(--text-muted)]">{r.tech}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Stack */}
        <div className="card p-5">
          <h3 className="text-[13px] font-semibold">Stack</h3>
          <div className="mt-4 space-y-2">
            {STACK.map((s) => (
              <div key={s.name} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-[var(--surface-hover)]">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded bg-[var(--surface-hover)]"><Layers className={cn('h-3.5 w-3.5', s.iconColor)} /></span>
                  <div>
                    <div className="text-[12.5px] font-medium text-[var(--text)]">{s.name}</div>
                    <div className="text-[11px] text-[var(--text-muted)]">{s.role}</div>
                  </div>
                </div>
                <span className="mono text-[10.5px] text-[var(--text-faint)]">{s.on}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service map */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-semibold">Service map</h3>
          <span className="text-[11px] text-[var(--text-faint)]">simplified inference — full graph lives in your repo workspace</span>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MAP_LAYERS.map((layer, li) => (
            <div key={layer.label}>
              <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-wide text-[var(--text-faint)]">{layer.label}</div>
              <div className="space-y-2">
                {layer.nodes.map((n) => (
                  <div key={n.name} className={cn('rounded-lg border p-3', n.accent ? 'border-[var(--accent)]/40 bg-[var(--accent-soft)]' : 'border-[var(--border)] bg-[var(--surface-subtle)]')}>
                    <div className="flex items-center gap-1.5">
                      <Server className={cn('h-3.5 w-3.5', n.accent ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]')} />
                      <span className="text-[12.5px] font-semibold text-[var(--text)]">{n.name}</span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">{n.sub}</div>
                  </div>
                ))}
              </div>
              {li < MAP_LAYERS.length - 1 && <ArrowRight className="mt-3 hidden h-4 w-4 text-[var(--text-faint)] lg:block" />}
            </div>
          ))}
        </div>
      </div>

      {/* Baseline note */}
      <div className="card p-4 text-[12.5px] text-[var(--text-secondary)]">
        <div className="flex items-start gap-2">
          <Zap className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]" />
          <span>
            <b className="text-[var(--text)]">Baseline drift:</b> 2 open PRs (devhub-api, devhub-frontend) introduce Redis and auth patterns not yet captured in the baseline. Align with{' '}
            <Link href="/decisions" className="text-[var(--accent)] hover:underline">ADR-027 · ADR-019</Link>.
          </span>
        </div>
      </div>
    </div>
  );
}