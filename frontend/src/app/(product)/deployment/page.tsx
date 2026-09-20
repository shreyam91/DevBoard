import Link from 'next/link';
import { Rocket, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { PageHeader, StatCard, EmptyState } from '@/components/ui/primitives';
import { DataTable, Column } from '@/components/ui/DataTable';
import { getEnvironments, getDeployments, getRepos, demoMeta } from '@/data';
import { Deployment, DeployStatus, EnvStatus } from '@/data';

function DeployStatusBadge({ status }: { status: DeployStatus }) {
  const m: Record<DeployStatus, { cls: string; dot: string; label: string }> = {
    success: { cls: 'border-emerald-200 bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', label: 'Success' },
    failed: { cls: 'border-red-200 bg-red-50 text-red-700', dot: 'bg-red-500', label: 'Failed' },
    in_progress: { cls: 'border-blue-200 bg-blue-50 text-blue-700', dot: 'bg-blue-500', label: 'In progress' },
    rolling: { cls: 'border-amber-200 bg-amber-50 text-amber-700', dot: 'bg-amber-500', label: 'Rolling out' },
  };
  const d = m[status];
  return <span className={cn('badge normal-case', d.cls)}><span className={cn('h-1.5 w-1.5 rounded-full', d.dot)} />{d.label}</span>;
}

function EnvStatusBadge({ status }: { status: EnvStatus }) {
  const m: Record<EnvStatus, { cls: string; dot: string; label: string; icon: React.ReactNode }> = {
    healthy: { cls: 'border-emerald-200 bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', label: 'Healthy', icon: <CheckCircle2 className="h-3 w-3 text-emerald-500" /> },
    degraded: { cls: 'border-amber-200 bg-amber-50 text-amber-700', dot: 'bg-amber-500', label: 'Degraded', icon: <AlertTriangle className="h-3 w-3 text-amber-500" /> },
    outage: { cls: 'border-red-200 bg-red-50 text-red-700', dot: 'bg-red-500', label: 'Outage', icon: <XCircle className="h-3 w-3 text-red-500" /> },
  };
  const d = m[status];
  return <span className={cn('badge normal-case', d.cls)}>{d.icon}{d.label}</span>;
}

function ago(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.max(1, Math.floor(diff / 60000))}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function duration(secs: number) {
  if (secs === 0) return '—';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function DeploymentPage() {
  const envs = getEnvironments();
  const deployments = getDeployments();
  const repos = getRepos();
  const repoMap = Object.fromEntries(repos.map((r) => [r.id, r]));

  const healthyEnvCount = envs.filter((e) => e.status === 'healthy').length;
  const failedCount = deployments.filter((d) => d.status === 'failed').length;
  const recentDeploy = deployments.find((d) => d.status === 'success');
  const lastDeployAgo = recentDeploy ? ago(recentDeploy.startedAt) : '—';

  const columns: Column<Deployment>[] = [
    {
      key: 'service', header: 'Service',
      render: (d) => {
        const r = repoMap[d.serviceRepositoryId];
        return (
          <Link href={`/repos/${d.serviceRepositoryId}`} className="flex items-center gap-2 hover:text-[var(--accent)]">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--surface-hover)] text-[var(--text-secondary)]">
              <Rocket className="h-3.5 w-3.5" />
            </span>
            <div>
              <div className="font-medium text-[13px] text-[var(--text)]">{r?.name ?? d.serviceRepositoryId}</div>
              <div className="text-[11px] text-[var(--text-muted)]">{r?.tech ?? '—'}</div>
            </div>
          </Link>
        );
      },
    },
    { key: 'env', header: 'Env', render: (d) => <span className="text-[12.5px] text-[var(--text-secondary)]">{d.env}</span> },
    { key: 'version', header: 'Version', render: (d) => <span className="mono text-[12.5px] font-semibold text-[var(--text)]">{d.version}</span> },
    { key: 'status', header: 'Status', className: 'whitespace-nowrap', render: (d) => <DeployStatusBadge status={d.status} /> },
    { key: 'openedBy', header: 'By', render: (d) => <span className="text-[12px] text-[var(--text-secondary)]">{d.openedBy}</span> },
    { key: 'duration', header: 'Duration', render: (d) => <span className="text-[12px] text-[var(--text-muted)]">{duration(d.duration)}</span> },
    { key: 'started', header: 'When', render: (d) => <span className="text-[12px] text-[var(--text-muted)]">{ago(d.startedAt)}</span> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="System"
        title="Deployment"
        description="Environment tracking, release notes, and deployment health."
        actions={<span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-muted)]">{demoMeta.banner}</span>}
      />

      {/* Stat strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Environments" value={`${healthyEnvCount}/${envs.length}`} hint="Healthy / total" icon={<CheckCircle2 className="h-4 w-4" />} tone={healthyEnvCount === envs.length ? 'ok' : 'warn'} />
        <StatCard label="Recent deploy" value={lastDeployAgo} hint="Last successful production deploy" icon={<Rocket className="h-4 w-4" />} tone="ok" />
        <StatCard label="Failed deploys" value={failedCount} hint="Requiring attention" icon={<XCircle className="h-4 w-4" />} tone={failedCount > 0 ? 'danger' : 'muted'} />
        <StatCard label="Deployments" value={deployments.length} hint="Across all environments" icon={<Rocket className="h-4 w-4" />} tone="muted" />
      </div>

      {/* Environments health */}
      <section>
        <div className="mb-2">
          <h3 className="text-[13px] font-semibold text-[var(--text)]">Environments</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {envs.map((e) => (
            <div key={e.id} className="card p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-semibold text-[var(--text)]">{e.name}</span>
                <EnvStatusBadge status={e.status} />
              </div>
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-hover)]">
                    <div
                      className={cn('h-full rounded-full', e.health >= 99.5 ? 'bg-[var(--ok)]' : e.health >= 97 ? 'bg-[var(--warning)]' : 'bg-[var(--danger)]')}
                      style={{ width: `${Math.min(100, e.health)}%` }}
                    />
                  </div>
                  <span className="text-[12px] font-semibold stat-value w-12 text-right">{e.health}%</span>
                </div>
                <div className="mt-2 text-[11px] text-[var(--text-muted)]">Last deploy {ago(e.lastDeploy)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Deployments table */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-[var(--text)]">Recent deployments</h3>
        </div>
        <DataTable
          columns={columns}
          rows={deployments}
          rowKey={(d) => d.id}
          empty={<EmptyState title="No deployments recorded" description="Deployment events will appear here once connected." />}
        />
      </section>
    </div>
  );
}