import React from 'react';
import { prisma } from '@devboard/shared/src/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';
import OverviewClient from './OverviewClient';

export default async function DashboardOverview({ params }: { params: { repoId: string } }) {
  const { repoId } = params;

  const { userId } = await auth();
  const user = await currentUser();
  
  const rawDecisions = await prisma.decision.findMany({
    where: { repo_id: repoId },
    orderBy: { created_at: 'desc' },
    take: 10
  });

  const decisions = rawDecisions.map(d => ({
    ...d,
    created_at: d.created_at.toISOString(),
    has_conflict: false
  }));

  const rawConflicts = await prisma.conflict.findMany({
    where: { repo_id: repoId, resolved: false },
    orderBy: { created_at: 'desc' }
  });

  const conflicts = rawConflicts.map(c => ({
    ...c,
    pr_url: c.pr_url || '',
    pr_title: c.pr_title || '',
    created_at: c.created_at.toISOString(),
    decision_title: 'Conflicting Decision'
  }));

  const total_decisions = await prisma.decision.count({ where: { repo_id: repoId } });
  
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const decisions_this_month = await prisma.decision.count({
    where: { repo_id: repoId, created_at: { gte: firstDayOfMonth } }
  });
  
  const pending_decisions = await prisma.pendingDecision.count({
    where: { repo_id: repoId, status: 'pending' }
  });

  const stats = {
    total_decisions,
    unresolved_conflicts: conflicts.length,
    prs_analyzed: 0,
    decisions_this_month,
    pending_decisions
  };

  return (
    <OverviewClient
      initialDecisions={decisions}
      initialConflicts={conflicts}
      initialStats={stats}
      repoId={repoId}
    />
  );
}
