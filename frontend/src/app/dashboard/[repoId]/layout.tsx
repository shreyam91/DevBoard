import React from 'react';
import { prisma } from '@devboard/shared/src/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import NavLink from './NavLink';
import UserDropdown from './UserDropdown';
import { Background } from '@/components/landing/Background';
import { LayoutDashboard, Activity, AlertTriangle, FileCode, GitPullRequest, Settings, Box, ChevronsUpDown, GitMerge, GitCommit, Sparkles, Search } from 'lucide-react';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: { repoId: string } }) {
  const repo = await prisma.repo.findUnique({ where: { id: params.repoId } });
  return {
    title: repo ? `${repo.name} | DevBoard` : 'DevBoard',
  };
}

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { repoId: string };
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  const { repoId } = params;
  
  const dbRepo = await prisma.repo.findUnique({
    where: { id: repoId }
  });
  const activeRepo = { 
    id: repoId, 
    name: dbRepo ? dbRepo.full_name : repoId, 
    user_id: session.user.id 
  };
  
  const unresolvedConflictsCount = await prisma.conflict.count({
    where: { repo_id: repoId, resolved: false }
  });

  const pendingDecisionsCount = await prisma.pendingDecision.count({
    where: { repo_id: repoId, status: 'pending' }
  });

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden text-[13px] text-slate-900 font-sans selection:bg-accent-blue/20 relative">
      <Background />
      
      {/* Sidebar - 240px fixed width, semi-transparent light mode */}
      <aside className="w-[240px] bg-slate-50/80 backdrop-blur-md flex flex-col shrink-0 border-r border-slate-200 z-20 relative shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        
        {/* Logo block */}
        <div className="pt-8 pb-6 px-5 border-b border-slate-200/60">
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-[32px] h-[32px] bg-accent-blue rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-accent-blue/20">
              <Box className="text-white w-[18px] h-[18px]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-slate-900 tracking-tight leading-tight">DevBoard</span>
              <span className="text-[11px] font-medium text-slate-500 leading-tight mt-0.5">Architecture Engine</span>
            </div>
          </Link>
          
          {/* Repo pill */}
          <Link href="/dashboard" className="mt-6 rounded-lg bg-white border border-slate-200 shadow-sm p-2 flex items-center justify-between cursor-pointer hover:border-slate-300 hover:shadow transition-all group block">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 overflow-hidden">
                <i className="ti ti-brand-github text-slate-400 group-hover:text-slate-600 text-[16px] transition-colors shrink-0"></i>
                <span className="text-slate-700 font-semibold text-[13px] truncate">{activeRepo.name}</span>
              </div>
              <ChevronsUpDown className="text-slate-400 w-[14px] h-[14px] shrink-0" />
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 flex flex-col gap-1.5">
          <NavLink href={`/dashboard/${repoId}`} icon={<LayoutDashboard />} exact>
            Overview
          </NavLink>
          <NavLink href={`/dashboard/${repoId}/timeline`} icon={<Activity />}>
            Decision Timeline
          </NavLink>
          <NavLink href={`/dashboard/${repoId}/pending`} icon={<GitMerge />} badgeCount={pendingDecisionsCount}>
            Pending Decisions
          </NavLink>
          <NavLink href={`/dashboard/${repoId}/conflicts`} icon={<AlertTriangle />} badgeCount={unresolvedConflictsCount}>
            Conflicts
          </NavLink>
          
          <div className="mt-6 mb-2 px-3 flex items-center gap-2">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Architecture</span>
          </div>
          <NavLink href={`/dashboard/${repoId}/architecture`} icon={<Box />}>
            Interactive Graph
          </NavLink>
          <NavLink href={`/dashboard/${repoId}/architecture-review`} icon={<Sparkles />}>
            AI Review
          </NavLink>
          <NavLink href={`/dashboard/${repoId}/architecture-legacy`} icon={<FileCode />}>
            ARCHITECTURE.md
          </NavLink>
          
          <div className="mt-6 mb-2 px-3 flex items-center gap-2">
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Development</span>
          </div>
          <NavLink href={`/dashboard/${repoId}/search`} icon={<Search />}>
            Semantic Search
          </NavLink>
          <NavLink href={`/dashboard/${repoId}/prs`} icon={<GitPullRequest />}>
            Pull Requests
          </NavLink>
          <NavLink href={`/dashboard/${repoId}/commits`} icon={<GitCommit />}>
            Commits
          </NavLink>

          <div className="mt-8 mb-3 px-3 flex items-center gap-2">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Settings</span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>
          
          <NavLink href={`/dashboard/${repoId}/webhooks`} icon={<GitPullRequest />}>
            Webhooks
          </NavLink>
          <NavLink href={`/dashboard/${repoId}/settings`} icon={<Settings />}>
            Repository Settings
          </NavLink>
        </nav>
        
        {/* User profile snippet */}
        <UserDropdown user={session.user} />
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        {children}
      </main>
      
    </div>
  );
}
