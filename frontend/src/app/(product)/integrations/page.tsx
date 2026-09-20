import { Plug, GitFork, Zap, MessageSquare, Database, BrainCircuit, Link2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { PageHeader } from '@/components/ui/primitives';
import { getIntegrations, demoMeta } from '@/data';
import { IntegrationCategory } from '@/data';

const CATEGORY_META: Record<IntegrationCategory, { label: string; icon: React.ReactNode; cls: string }> = {
  source: { label: 'Source control', icon: <GitFork className="h-4 w-4" />, cls: 'bg-indigo-50 text-indigo-600' },
  ci: { label: 'CI/CD', icon: <Zap className="h-4 w-4" />, cls: 'bg-amber-50 text-amber-600' },
  messaging: { label: 'Messaging', icon: <MessageSquare className="h-4 w-4" />, cls: 'bg-emerald-50 text-emerald-600' },
  database: { label: 'Database', icon: <Database className="h-4 w-4" />, cls: 'bg-blue-50 text-blue-600' },
  ai: { label: 'AI', icon: <BrainCircuit className="h-4 w-4" />, cls: 'bg-purple-50 text-purple-600' },
};

export default function IntegrationsPage() {
  const integrations = getIntegrations();
  const connectedCount = integrations.filter((i) => i.connected).length;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="System"
        title="Integrations"
        description="Connect GitHub, CI, Slack, and more so DevHub can read and act across your whole workflow."
        actions={
          <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-muted)]">
            {connectedCount}/{integrations.length} connected · {demoMeta.source}
          </span>
        }
      />

      {/* Summary strip */}
      <div className="card p-4">
        <div className="flex items-center gap-4 text-[12.5px] text-[var(--text-secondary)]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--ok)]" />
            {connectedCount} active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--border-strong)]" />
            {integrations.length - connectedCount} available
          </span>
          <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
            <Link2 className="h-3.5 w-3.5" /> Webhook endpoint registered
          </span>
        </div>
      </div>

      {/* Integration cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map((i) => {
          const cat = CATEGORY_META[i.category];
          return (
            <div key={i.id} className="card card-hover p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-md', cat.cls)}>
                    {cat.icon}
                  </span>
                  <div>
                    <div className="text-[13.5px] font-semibold text-[var(--text)]">{i.name}</div>
                    <div className="text-[11px] text-[var(--text-muted)]">{cat.label}</div>
                  </div>
                </div>
                <span className={cn(
                  'rounded-full border px-2 py-0.5 text-[10.5px] font-semibold',
                  i.connected
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--text-muted)]'
                )}>
                  {i.connected ? 'Connected' : 'Available'}
                </span>
              </div>

              <p className="mt-3 text-[12.5px] leading-relaxed text-[var(--text-secondary)] flex-1">{i.description}</p>

              {/* Settings / info */}
              <div className="mt-4 space-y-1.5">
                {i.settings.map((s) => (
                  <div key={s.label} className="flex items-center justify-between text-[11.5px]">
                    <span className="text-[var(--text-muted)]">{s.label}</span>
                    <span className="font-medium text-[var(--text-secondary)]">{s.value}</span>
                  </div>
                ))}
              </div>

              {/* Action */}
              <div className="mt-4 border-t border-[var(--border)] pt-3">
                {i.connected ? (
                  <button className="btn btn-secondary btn-sm w-full justify-center">
                    Manage
                  </button>
                ) : (
                  <button className="btn btn-primary btn-sm w-full justify-center">
                    <Plug className="h-3.5 w-3.5" /> Connect
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}