import { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/utils/cn';

/** Small primitives shared across DevHub screens. */
export function SeverityBadge({ severity }: { severity: string }) {
  const meta: Record<string, { cls: string; dot: string; label: string }> = {
    critical: { cls: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30', dot: 'bg-red-600', label: 'Critical' },
    high: { cls: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30', dot: 'bg-orange-500', label: 'High' },
    medium: { cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30', dot: 'bg-amber-500', label: 'Medium' },
    low: { cls: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/30', dot: 'bg-slate-400', label: 'Low' },
  };
  const m = meta[severity?.toLowerCase()] ?? meta.low;
  return (
    <span className={cn('badge', m.cls)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', m.dot)} />
      {m.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30',
    resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
    dismissed: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/30',
  };
  return (
    <span className={cn('badge normal-case', map[status?.toLowerCase()] ?? map.open)}>
      {status ?? 'open'}
    </span>
  );
}

export function ScoreRing({ score, size = 44, label }: { score: number; size?: number; label?: string }) {
  const clamp = Math.max(0, Math.min(100, score));
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const filled = (clamp / 100) * c;
  const color = clamp >= 80 ? 'var(--ok)' : clamp >= 60 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} role="img" aria-label={`${label ?? 'Score'}: ${clamp} out of 100`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={4} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={4} strokeLinecap="round"
          strokeDasharray={`${filled} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="text-[15px] font-bold stat-value">{clamp}</span>
    </div>
  );
}

export function StatCard({ label, value, hint, icon, tone }: {
  label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode; tone?: 'ok' | 'warn' | 'danger' | 'muted';
}) {
  const toneCls = {
    ok: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    warn: 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300',
    danger: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300',
    muted: 'bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300',
  }[tone ?? 'muted'];
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className="label">{label}</span>
        {icon && <span className={cn('h-7 w-7 rounded-md flex items-center justify-center', toneCls)}>{icon}</span>}
      </div>
      <div className="mt-2 text-[24px] font-bold leading-none stat-value">{value}</div>
      {hint && <div className="mt-1.5 text-[12px] text-[var(--text-muted)]">{hint}</div>}
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, actions }: {
  eyebrow?: ReactNode; title: ReactNode; description?: ReactNode; actions?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        {eyebrow && <div className="label mb-1">{eyebrow}</div>}
        <h1 className="text-[22px] font-bold tracking-tight text-[var(--text)]">{title}</h1>
        {description && <p className="mt-1 text-[13.5px] text-[var(--text-secondary)] max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: {
  icon?: ReactNode; title: string; description: string; action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 p-12 text-center">
      {icon && (
        <div className="h-12 w-12 rounded-xl bg-[var(--surface-hover)] flex items-center justify-center text-[var(--text-faint)]">
          {icon}
        </div>
      )}
      <div className="text-[15px] font-semibold text-[var(--text)]">{title}</div>
      <p className="max-w-sm text-[13px] text-[var(--text-muted)]">{description}</p>
      {action}
    </div>
  );
}

export function Skeleton({ className, rows = 1 }: { className?: string; rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={cn('skeleton h-4', className)} />
      ))}
    </div>
  );
}

export function ComingSoon({ title, description, icon, action }: {
  title: string; description: string; icon?: ReactNode; action?: ReactNode;
}) {
  return (
    <EmptyState
      icon={icon}
      title={`${title} is coming soon`}
      description={description}
      action={
        action ?? <Link href="/overview" className="btn btn-secondary btn-sm">Back to overview</Link>
      }
    />
  );
}

export function ActivityItem({ type, children, time }: {
  type: 'pr' | 'adr' | 'conflict' | 'doc' | 'review' | 'insight'; children: ReactNode; time?: string;
}) {
  const dot: Record<string, string> = {
    pr: 'bg-emerald-500', adr: 'bg-accent', conflict: 'bg-orange-500', doc: 'bg-slate-400', review: 'bg-blue-500', insight: 'bg-purple-500',
  };
  return (
    <div className="flex items-start gap-3 px-1 py-2">
      <span className={cn('mt-1.5 h-2 w-2 rounded-full shrink-0', dot[type])} />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] text-[var(--text-secondary)] leading-snug">{children}</div>
        {time && <div className="mt-0.5 text-[11.5px] text-[var(--text-faint)]">{time}</div>}
      </div>
    </div>
  );
}