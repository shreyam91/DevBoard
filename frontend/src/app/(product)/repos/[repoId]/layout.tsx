import React from 'react';
import { prisma } from '@devboard/shared/src/prisma';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Box, Ghost, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import InaccessibleRepoClient from './InaccessibleRepoClient';
import RepoNavActions from './RepoNavActions';

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

  return (
    <div className="flex flex-col min-w-0 w-full h-full">
      {/* Normal Page Header */}
      <div className="flex items-center gap-3 px-1 mb-2">
        <Link href="/repos" className="flex items-center gap-1 text-[12.5px] font-medium text-[var(--text-muted)] hover:text-[var(--text)]">
          <ChevronLeft className="h-3.5 w-3.5" /> Repositories
        </Link>
        <span className="h-4 w-px bg-[var(--border)]" />
        <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--text)]">
          <Ghost className="h-3.5 w-3.5 text-[var(--text-faint)]" />
          <span className="mono">{repoName}</span>
        </span>

        {/* Repo-scoped actions */}
        <RepoNavActions repoId={repoId} />
      </div>

      {/* Body — real repo feature pages render here, inside the AppShell main */}
      {dbRepo?.health_status === 'inaccessible' ? <InaccessibleRepoClient repoId={repoId} /> : children}
    </div>
  );
}