import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@devboard/shared/src/prisma';
import { notFound, redirect } from 'next/navigation';
import PendingClient from './PendingClient';

export const metadata = {
  title: 'Pending Decisions | DevBoard',
};

export default async function PendingDecisionsPage({ params }: { params: { repoId: string } }) {
  const { userId } = await auth();
    if (!userId) {
    redirect('/api/auth/signin');
  }

  const { repoId } = params;
  const repo = await prisma.repo.findFirst({
    where: { id: repoId, user_id: userId },
  });

  if (!repo) {
    notFound();
  }

  const pendingDecisionsRaw = await prisma.pendingDecision.findMany({
    where: { repo_id: repoId, status: 'pending' },
    orderBy: { created_at: 'desc' }
  });

  const pendingDecisions = pendingDecisionsRaw.map(pd => ({
    id: pd.id,
    repo_id: pd.repo_id,
    pr_number: pd.pr_number,
    title: pd.title,
    description: pd.description,
    rationale: pd.rationale,
    confidence: pd.confidence,
    affected_files: pd.affected_files as string[] | null,
    suggested_markdown: pd.suggested_markdown,
    status: pd.status,
    created_at: pd.created_at.toISOString()
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Pending Decisions</h1>
            <p className="text-slate-600 mt-2">
              Review architectural changes detected in recent pull requests. Approve them to automatically update your <code className="text-sm bg-slate-100 px-1.5 py-0.5 rounded">ARCHITECTURE.md</code>.
            </p>
          </div>
          <PendingClient repoId={repoId} initialPendingDecisions={pendingDecisions} />
        </div>
      </div>
    </div>
  );
}
