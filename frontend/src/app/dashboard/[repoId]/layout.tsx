import React from 'react';
import { prisma } from '@devboard/shared/src/prisma';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { LayoutDashboard, Activity, GitMerge, AlertTriangle, Box, Sparkles, FileCode, GitPullRequest, GitCommit, Settings, Webhook } from 'lucide-react';
import InaccessibleRepoClient from './InaccessibleRepoClient';
import { RepoSubNav, RepoNavGroup } from './RepoSubNav';

export async function generateMetadata({ params }: { params: { repoId: string } }) {
  const repo = await prisma.repo.findUnique({ where: { id: params.repoId } });
  return {
    title: repo ? `${repo.name} | DevHub` : 'DevHub',
  };
}

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { repoId: string };
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }
  const { repoId } = params;

  const dbRepo = await prisma.repo.findUnique({ where: { id: repoId } });
  const repoName = dbRepo?.full_name ?? repoId;

  const unresolvedConflictsCount = await prisma.conflict.count({
    where: { repo_id: repoId, resolved: false },
  });
  const pendingDecisionsCount = await prisma.pendingDecision.count({
    where: { repo_id: repoId, status: 'pending' },
  });

  const nav: RepoNavGroup[] = [
    { section: 'overview', items: [
      { href: `/dashboard/${repoId}`, label: 'Overview', icon: <LayoutDashboard className="h-3.5 w-3.5" />, exact: true },
      { href: `/dashboard/${repoId}/timeline`, label: 'Timeline', icon: <Activity className="h-3.5 w-3.5" /> },
      { href: `/dashboard/${repoId}/pending`, label: 'Pending', icon: <GitMerge className="h-3.5 w-3.5" />, badge: pendingDecisionsCount },
      { href: `/dashboard/${repoId}/conflicts`, label: 'Conflicts', icon: <AlertTriangle className="h-3.5 w-3.5" />, badge: unresolvedConflictsCount },
    ] },
    { section: 'architecture', items: [
      { href: `/dashboard/${repoId}/architecture`, label: 'Graph', icon: <Box className="h-3.5 w-3.5" />, exact: true },
      { href: `/dashboard/${repoId}/architecture-review`, label: 'AI Review', icon: <Sparkles className="h-3.5 w-3.5" /> },
      { href: `/dashboard/${repoId}/architecture-legacy`, label: 'ARCHITECTURE.md', icon: <FileCode className="h-3.5 w-3.5" /> },
    ] },
    { section: 'dev', items: [
      { href: `/dashboard/${repoId}/prs`, label: 'Pull Requests', icon: <GitPullRequest className="h-3.5 w-3.5" /> },
      { href: `/dashboard/${repoId}/commits`, label: 'Commits', icon: <GitCommit className="h-3.5 w-3.5" /> },
    ] },
    { section: 'settings', items: [
      { href: `/dashboard/${repoId}/webhooks`, label: 'Webhooks', icon: <Webhook className="h-3.5 w-3.5" /> },
      { href: `/dashboard/${repoId}/settings`, label: 'Settings', icon: <Settings className="h-3.5 w-3.5" /> },
    ] },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Repo sub-nav: breadcrumb + horizontal sections */}
      <RepoSubNav repoName={repoName} nav={nav} />

      {/* Body — real repo feature pages render here, inside the AppShell main */}
      {dbRepo?.health_status === 'inaccessible' ? <InaccessibleRepoClient repoId={repoId} /> : children}
    </div>
  );
}