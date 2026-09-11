'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { MonitorDot, ShieldCheck, GitPullRequest, AlertOctagon, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { PageHeader, StatCard, SeverityBadge, StatusBadge } from '@/components/ui/primitives';
import { DataTable, FilterBar, Column } from '@/components/ui/DataTable';
import { getFindings, getReviewsOverTime, getFindingCounts, repoNameOf, demoMeta, getRepos } from '@/data';
import { Finding, Severity } from '@/data';

const SEVERITY_ORDER: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };

export default function ReviewerPage() {
  const findings = getFindings();
  const counts = getFindingCounts();
  const series = getReviewsOverTime();
  const [status, setStatus] = useState<'all' | 'open' | 'resolved' | 'dismissed'>('all');
  const [severity, setSeverity] = useState<'all' | Severity>('all');

  const filtered = useMemo(
    () =>
      findings
        .filter((f) => (severity === 'all' ? true : f.severity === severity))
        .filter((f) => (status === 'all' ? true : f.status === status))
        .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
        .slice(0, 14),
    [findings, severity, status]
  );

  const maxCount = Math.max(...series.map((s) => s.count), 1);

  const columns: Column<Finding>[] = [
    { key: 'severity', header: 'Severity', render: (f) => <SeverityBadge severity={f.severity} /> },
    {
      key: 'finding', header: 'Finding',
      render: (f) => (
        <div>
          <div className="max-w-[320px] truncate font-medium text-[var(--text)]">{f.title}</div>
          <div className="text-[11px] uppercase tracking-wide text-[var(--text-faint)]">{f.category}</div>
        </div>
      ),
    },
    {
      key: 'repo', header: 'Repository', className: 'whitespace-nowrap',
      render: (f) => <Link href={`/repos/${f.repoId}`} className="font-medium text-[var(--accent)] hover:underline">{repoNameOf(f.repoId)}</Link>,
    },
    {
      key: 'pr', header: 'PR', className: 'whitespace-nowrap',
      render: (f) => <Link href={`/prs/${f.repoId}/${f.prNumber}`} className="mono text-[var(--text-secondary)] hover:text-[var(--accent)]">#{f.prNumber}</Link>,
    },
    { key: 'file', header: 'File', className: 'max-w-[240px]', render: (f) => <div className="mono truncate text-[12px] text-[var(--text-secondary)]">{f.file}{f.line != null ? <span className="text-[var(--text-faint)]">:{f.line}</span> : ''}</div> },
    { key: 'confidence', header: 'Confidence', className: 'whitespace-nowrap', render: (f) => <span className="stat-value font-medium">{Math.round(f.confidence * 100)}%</span> },
    { key: 'status', header: 'Status', render: (f) => <StatusBadge status={f.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI Reviewer"
        title="Your automated engineering reviewer"
        description="DevHub AI reviews your pull requests, surfaces findings, and detects architecture drift before it becomes tech debt."
        actions={
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] font-medium text-[var(--text)] md:flex"><MonitorDot className="h-3.5 w-3.5 text-[var(--ok)]" /> Monitoring {getRepos().length} repositories</span>
            <Link href="/repos" className="btn btn-primary btn-sm"><ShieldCheck className="h-3.5 w-3.5" /> Review a PR</Link>
          </div>
        }
      />

      {/* Stat band */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <StatCard label="PRs reviewed" value={counts.total} icon={<GitPullRequest className="h-4 w-4" />} tone="ok" />
        <StatCard label="Findings" value={findings.length} hint="across all repos" icon={<AlertOctagon className="h-4 w-4" />} tone="muted" />
        <StatCard label="Critical" value={counts.critical} hint="fix soon" icon={<AlertOctagon className="h-4 w-4" />} tone="danger" />
        <StatCard label="High" value={counts.high} icon={<AlertTriangle className="h-4 w-4" />} tone="warn" />
        <StatCard label="Medium" value={counts.medium} icon={<ArrowDown className="h-4 w-4" />} tone="muted" />
        <StatCard label="Low" value={counts.low} icon={<ArrowUp className="h-4 w-4" />} tone="muted" />
      </div>

      {/* Reviews over time */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">Review activity</h3>
            <span className="text-[11px] font-medium text-[var(--text-faint)]">Reviews over the last 2 weeks · {demoMeta.banner}</span>
          </div>
          <div className="mt-5 h-[180px] flex items-end gap-2">
            {series.map((p, i) => (
              <div key={i} className="group relative flex-1 flex flex-col items-center gap-1.5" title={`${p.count} reviews`}>
                <span className="text-[10px] font-medium text-[var(--text-faint)] opacity-0 group-hover:opacity-100 transition-opacity">{p.count}</span>
                <div
                  className="w-full rounded-t-sm bg-[var(--accent)]/85 group-hover:bg-accent transition-colors"
                  style={{ height: `${(p.count / maxCount) * 100}%` }}
                />
                <span className="text-[10px] text-[var(--text-faint)]">{p.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-[13px] font-semibold">Summary</h3>
          <div className="mt-4 space-y-3 text-[13px]">
            <div className="flex items-center justify-between"><span className="text-[var(--text-muted)]">False positive rate</span><span className="font-semibold stat-value">8%</span></div>
            <div className="flex items-center justify-between"><span className="text-[var(--text-muted)]">Avg review time</span><span className="font-semibold stat-value">38s</span></div>
            <div className="flex items-center justify-between"><span className="text-[var(--text-muted)]">High-severity density</span><span className="font-semibold stat-value">{Math.round(((counts.high + counts.critical) / findings.length) * 100)}%</span></div>
            <div className="h-px bg-[var(--border)]" />
            <div className="text-[12.5px] leading-relaxed text-[var(--text-secondary)]">Conservative by design: DevHub prefers 3 useful findings over 20 noisy ones, so you can act with confidence.</div>
          </div>
        </div>
      </div>

      {/* Findings table */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterBar
            active={status}
            onChange={setStatus}
            options={[
              { value: 'all', label: 'All', count: findings.length },
              { value: 'open', label: 'Open', count: counts.open },
              { value: 'resolved', label: 'Resolved', count: counts.resolved },
              { value: 'dismissed', label: 'Dismissed', count: counts.dismissed },
            ]}
          />
          <FilterBar
            active={severity}
            onChange={setSeverity}
            options={[
              { value: 'all', label: 'All severities' },
              { value: 'critical', label: 'Critical' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ]}
          />
        </div>
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(f) => f.id}
          onRowClick={(f) => window.open(`/prs/${f.repoId}/${f.prNumber}`, '_self')}
          empty={
            <div className={cn('p-8 text-center')}>
              <div className="text-[13px] font-medium text-[var(--text)]">No findings match these filters.</div>
              <div className="mt-1 text-[12.5px] text-[var(--text-muted)]">Try clearing a filter, or connect a repository to start reviewing.</div>
            </div>
          }
        />
      </div>
    </div>
  );
}