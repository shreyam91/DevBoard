import React from 'react';
import { prisma } from '@devboard/shared/src/prisma';
import { auth } from '@/auth';
import { notFound, redirect } from 'next/navigation';
import ArchitectureClient from './ArchitectureClient';

export const metadata = {
  title: 'Architecture | DevBoard',
};

export default async function ArchitecturePage({ params }: { params: { repoId: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/api/auth/signin');
  }

  const { repoId } = params;

  // Verify access
  const repo = await prisma.repo.findFirst({
    where: { id: repoId, user_id: session.user.id }
  });

  if (!repo) {
    notFound();
  }

  const latestVersion = await prisma.architectureVersion.findFirst({
    where: { repo_id: repoId },
    orderBy: { version: 'desc' }
  });

  return (
    <ArchitectureClient 
      repoId={repoId} 
      initialContent={latestVersion?.content || 'No architecture documentation has been generated for this repository yet.'} 
      lastUpdated={latestVersion?.committed_at?.toISOString() || null}
      version={latestVersion?.version || 0}
    />
  );
}
