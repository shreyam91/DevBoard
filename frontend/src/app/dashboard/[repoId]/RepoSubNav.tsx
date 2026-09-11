'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { ChevronLeft, Ghost } from 'lucide-react';

export interface RepoNavItemDef {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
  badge?: number;
}

export interface RepoNavGroup {
  section: string;
  items: RepoNavItemDef[];
}

const SECTION_LABELS: Record<string, string> = {
  overview: 'Overview',
  architecture: 'Architecture',
  dev: 'Development',
  settings: 'Settings',
};

export function RepoSubNav({ repoName, nav }: { repoName: string; nav: RepoNavGroup[] }) {
  return (
    <div className="card p-3">
      <div className="flex items-center gap-3 px-1">
        <Link href="/dashboard" className="flex items-center gap-1 text-[12.5px] font-medium text-[var(--text-muted)] hover:text-[var(--text)]">
          <ChevronLeft className="h-3.5 w-3.5" /> Repositories
        </Link>
        <span className="h-4 w-px bg-[var(--border)]" />
        <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--text)]">
          <Ghost className="h-3.5 w-3.5 text-[var(--text-faint)]" />
          <span className="mono">{repoName}</span>
        </span>
      </div>

      <div className="mt-2 -mx-1 flex items-center gap-1 overflow-x-auto px-1 pb-0.5">
        {nav.map((group) => (
          <React.Fragment key={group.section}>
            <span className="hidden px-1 text-[10px] font-bold uppercase tracking-widest text-[var(--text-faint)] sm:inline">
              {SECTION_LABELS[group.section]}
            </span>
            {group.items.map((item) => (
              <RepoNavItem key={item.href} {...item} />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function RepoNavItem({ href, label, icon, exact, badge }: RepoNavItemDef) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      prefetch={false}
      className={cn(
        'flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium transition-colors',
        active ? 'bg-[var(--surface-hover)] text-[var(--text)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]'
      )}
    >
      <span className={cn('shrink-0', active ? 'text-[var(--accent)]' : 'text-[var(--text-faint)]')}>{icon}</span>
      {label}
      {badge && badge > 0 && (
        <span className="ml-0.5 rounded-full bg-[var(--danger)] px-1.5 text-[10px] font-bold leading-4 text-white">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}