import { prisma } from '@devboard/shared/src/prisma';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import ChatClient from './ChatClient';

export const metadata = { title: 'Ask DevHub' };

/**
 * Ask DevHub — a project-aware chat grounded in the user's connected repos.
 * Auth is enforced by the (product) layout.
 */
export default async function ChatPage({ searchParams }: { searchParams: { q?: string; context?: string; repo?: string } }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  // Real connected repos for the picker (scoped to the current user).
  const repos = await prisma.repo.findMany({
    where: { user_id: userId },
    orderBy: { connected_at: 'desc' },
    take: 200,
    select: {
      id: true,
      full_name: true,
      name: true,
      health_status: true,
    },
  });

  return (
    <ChatClient
      initialRepos={repos}
      initialQuery={searchParams.q ?? undefined}
      initialRepoId={searchParams.repo ?? undefined}
    />
  );
}