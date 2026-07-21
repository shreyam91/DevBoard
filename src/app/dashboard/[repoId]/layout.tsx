import React from 'react';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import NavLink from './NavLink';

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { repoId: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/api/auth/signin');

  const { repoId } = params;

  // Verify access and get active repo
  const activeRepo = await prisma.repo.findFirst({
    where: { id: repoId, user_id: session.user.id }
  });

  if (!activeRepo) redirect('/onboarding');

  // Fetch unresolved conflict count
  const unresolvedConflictsCount = await prisma.conflict.count({
    where: {
      resolved: false,
      decision: { repo_id: repoId }
    }
  });

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden text-[13px] text-neutral-900">
      
      {/* Sidebar - strictly 220px fixed width, #0c0c0c bg */}
      <aside className="w-[220px] bg-[#0c0c0c] flex flex-col shrink-0 border-r border-[rgba(0,0,0,0.1)]">
        
        {/* Logo block */}
        <div className="pt-6 pb-5 px-4 border-b border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-3">
            <div className="w-[28px] h-[28px] bg-[#5551ff] rounded flex items-center justify-center shrink-0">
              <i className="ti ti-topology-star-3 text-white text-[16px]"></i>
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-medium text-white leading-tight">DevBoard</span>
              <span className="text-[10px] text-[rgba(255,255,255,0.25)] leading-tight mt-0.5">Architecture intelligence</span>
            </div>
          </div>
          
          {/* Repo pill */}
          <div className="mt-5 rounded-lg bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] p-2 flex items-center justify-between cursor-pointer hover:bg-[rgba(255,255,255,0.08)] transition-colors">
            <div className="flex items-center gap-2 overflow-hidden">
              <i className="ti ti-brand-github text-[rgba(255,255,255,0.45)] text-[14px]"></i>
              <span className="text-white font-medium text-[12.5px] truncate">{activeRepo.name}</span>
            </div>
            <i className="ti ti-chevron-down text-[rgba(255,255,255,0.45)] text-[14px] shrink-0"></i>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          <NavLink href={`/dashboard/${repoId}`} icon="ti-layout-dashboard" exact>
            Overview
          </NavLink>
          <NavLink href={`/dashboard/${repoId}/timeline`} icon="ti-timeline">
            Decision timeline
          </NavLink>
          <NavLink href={`/dashboard/${repoId}/conflicts`} icon="ti-alert-triangle" badgeCount={unresolvedConflictsCount}>
            Conflicts
          </NavLink>
          <NavLink href={`/dashboard/${repoId}/architecture`} icon="ti-file-code">
            ARCHITECTURE.md
          </NavLink>

          <div className="mt-6 mb-2 px-3">
            <span className="text-[10px] uppercase text-[rgba(255,255,255,0.25)] font-medium tracking-wider">Integrations</span>
          </div>
          
          <NavLink href={`/dashboard/${repoId}/webhooks`} icon="ti-git-pull-request">
            Webhook
          </NavLink>
          <NavLink href={`/dashboard/${repoId}/settings`} icon="ti-settings">
            Settings
          </NavLink>
        </nav>
        
        {/* User profile snippet */}
        <div className="p-4 border-t border-[rgba(255,255,255,0.08)] flex items-center justify-between cursor-pointer hover:bg-[rgba(255,255,255,0.03)] transition-colors">
          <div className="flex items-center gap-2 overflow-hidden">
            {session.user.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={session.user.image} alt="avatar" className="w-[26px] h-[26px] rounded-full shrink-0" />
            ) : (
              <div className="w-[26px] h-[26px] rounded-full bg-[#5551ff] text-white flex items-center justify-center text-[10px] font-medium shrink-0">
                {getInitials(session.user.name || session.user.email)}
              </div>
            )}
            <span className="text-[12.5px] text-[rgba(255,255,255,0.45)] truncate">{session.user.name || session.user.email}</span>
          </div>
          <i className="ti ti-dots text-[rgba(255,255,255,0.45)] text-[14px]"></i>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-neutral-50">
        {children}
      </main>
      
    </div>
  );
}
