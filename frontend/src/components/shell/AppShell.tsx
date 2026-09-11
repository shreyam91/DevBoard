'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { Box, ChevronsLeft, ChevronsRight, LayoutDashboard, FolderKanban, GitFork, GitPullRequest, ShieldCheck, CircleDot, Boxes, Scale, BookOpen, FileText, Rocket, Sparkles, BrainCircuit, Lightbulb, Activity, Settings, Plug, Search, Bell, Command } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';

/** Icons-only views are used for marker/placeholder leaf items; keep small. */
type Icon = ReactNode;

interface NavItem { href: string; label: string; icon: Icon; badge?: number; soon?: boolean }

const NAV: { section: string; items: NavItem[] }[] = [
  { section: 'Workspace', items: [
    { href: '/projects', label: 'Projects', icon: <FolderKanban className="h-4 w-4" /> },
    { href: '/repos', label: 'Repositories', icon: <GitFork className="h-4 w-4" /> },
    { href: '/prs', label: 'Pull Requests', icon: <GitPullRequest className="h-4 w-4" /> },
    { href: '/reviewer', label: 'Code Reviews', icon: <ShieldCheck className="h-4 w-4" /> },
    { href: '/issues', label: 'Issues', icon: <CircleDot className="h-4 w-4" />, soon: true },
  ] },
  { section: 'Engineering', items: [
    { href: '/architecture', label: 'Architecture', icon: <Boxes className="h-4 w-4" /> },
    { href: '/decisions', label: 'Decisions / ADRs', icon: <Scale className="h-4 w-4" /> },
    { href: '/docs', label: 'Documentation', icon: <BookOpen className="h-4 w-4" /> },
    { href: '/tech-specs', label: 'Tech Specs', icon: <FileText className="h-4 w-4" />, soon: true },
    { href: '/deployment', label: 'Deployment', icon: <Rocket className="h-4 w-4" />, soon: true },
  ] },
  { section: 'AI', items: [
    { href: '/reviewer', label: 'AI Reviewer', icon: <Sparkles className="h-4 w-4" /> },
    { href: '/insights', label: 'Project Intelligence', icon: <BrainCircuit className="h-4 w-4" /> },
    { href: '/insights', label: 'Insights', icon: <Lightbulb className="h-4 w-4" /> },
  ] },
  { section: 'System', items: [
    { href: '/activity', label: 'Activity', icon: <Activity className="h-4 w-4" />, soon: true },
    { href: '/settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
    { href: '/integrations', label: 'Integrations', icon: <Plug className="h-4 w-4" />, soon: true },
  ] },
];

function SidebarLink({ item, collapsed, onNavigate }: { item: NavItem; collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = item.href !== '/' && (pathname === item.href || (item.href !== '/overview' && pathname.startsWith(item.href)));
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={item.label}
      className={cn(
        'group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors',
        active ? 'bg-[var(--surface-hover)] text-[var(--text)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]',
        collapsed && 'justify-center px-0'
      )}
    >
      <span className={cn('shrink-0', active ? 'text-[var(--accent)]' : 'text-[var(--text-faint)] group-hover:text-[var(--text-secondary)]')}>{item.icon}</span>
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      {!collapsed && item.badge != null && (
        <span className="rounded-full bg-[var(--accent-soft)] text-[var(--accent)] px-1.5 text-[10.5px] font-bold leading-4">{item.badge}</span>
      )}
      {!collapsed && item.soon && <span className="text-[10px] uppercase text-[var(--text-faint)]">Soon</span>}
    </Link>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
      <div className="flex h-screen w-full bg-[var(--background)] text-[var(--text)] overflow-hidden">
        {/* Sidebar */}
        <aside
          style={{ width: collapsed ? 56 : 'var(--sidebar-w)' }}
          className="shrink-0 border-r border-[var(--border)] bg-[var(--surface-subtle)] flex flex-col transition-[width] duration-150"
        >
          {/* Brand */}
          <div className={cn('flex h-[var(--topbar-h)] items-center gap-2.5 border-b border-[var(--border)] px-3', collapsed && 'justify-center px-1')}>
            {!collapsed && (
              <>
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-white">
                  <Box className="h-4 w-4" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-[14px] font-bold tracking-tight">DevHub</span>
                  <span className="text-[10px] font-medium text-[var(--text-faint)]">Engineering intelligence</span>
                </div>
              </>
            )}
            {collapsed && (
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-white">
                <Box className="h-4 w-4" />
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-2 py-3">
            <Link
              href="/overview"
              className={cn('mb-2 flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium', pathname === '/overview' ? 'bg-[var(--surface-hover)] text-[var(--text)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-hover)]', collapsed && 'justify-center px-0')}
              title="Overview"
            >
              <LayoutDashboard className="h-4 w-4" />
              {!collapsed && <span>Overview</span>}
            </Link>

            {NAV.map((group) => (
              <div key={group.section} className="mb-3">
                {!collapsed && <div className="px-2.5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-[var(--text-faint)]">{group.section}</div>}
                <div className="space-y-0.5">
                  {group.items.map((item) => <SidebarLink key={item.label} item={item} collapsed={collapsed} />)}
                </div>
              </div>
            ))}
          </nav>

          {/* Collapse toggle */}
          <div className="border-t border-[var(--border)] p-2">
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="flex w-full items-center justify-center gap-2 rounded-md px-2 py-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
              {!collapsed && <span className="text-[12px] font-medium">Collapse</span>}
            </button>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <header className="flex h-[var(--topbar-h)] shrink-0 items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-4">
            <Link
              href="/overview"
              className="hidden items-center gap-2 rounded-md border border-[var(--border)] px-2.5 py-1.5 text-[12.5px] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)] md:flex"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search projects, PRs, issues, architecture…</span>
              <span className="ml-2 flex items-center gap-0.5 rounded border border-[var(--border)] px-1 text-[10px] text-[var(--text-faint)]"><Command className="h-2.5 w-2.5" />K</span>
            </Link>
            <div className="flex-1" />
            <button className="relative rounded-md p-2 text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]" title="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--danger)]" />
            </button>
            <div className="flex items-center gap-1.5 rounded-full border border-[var(--border)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-secondary)]" title="AI status">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--ok)] animate-pulse" />
              AI Online
            </div>
            <span className="mx-1 h-5 w-px bg-[var(--border)]" />
            <UserButton afterSignOutUrl="/" />
          </header>

          {/* Content */}
          <main className="min-h-0 flex-1 overflow-y-auto p-6 lg:p-8">
            <div className="mx-auto max-w-[1200px] pb-10">{children}</div>
          </main>
        </div>
      </div>
  );
}