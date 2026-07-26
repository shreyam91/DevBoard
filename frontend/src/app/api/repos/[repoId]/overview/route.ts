import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@devboard/shared/src/prisma';
import { auth } from '@/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { repoId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { repoId } = params;

  // Verify access
  const repo = await prisma.repo.findFirst({
    where: { id: repoId, user_id: session.user.id }
  });

  if (!repo) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const rawDecisions = await prisma.decision.findMany({
    where: { repo_id: repoId },
    orderBy: { created_at: 'desc' },
    take: 5,
    include: {
      conflicts: {
        where: { resolved: false }
      }
    }
  });

  const decisions = rawDecisions.map(d => ({
    id: d.id,
    title: d.title,
    rationale: d.rationale,
    category: d.category,
    source: d.source,
    pr_url: d.pr_url,
    pr_number: d.pr_number,
    confirmed_by_user: d.confirmed_by_user,
    created_at: d.created_at.toISOString(),
    has_conflict: d.conflicts.length > 0
  }));

  const conflictsRaw = await prisma.conflict.findMany({
    where: { resolved: false, decision: { repo_id: repoId } },
    include: { decision: true },
    orderBy: { created_at: 'desc' }
  });

  const conflicts = conflictsRaw.map(c => ({
    id: c.id,
    decision_id: c.decision_id,
    decision_title: c.decision.title,
    pr_url: c.pr_url || '',
    pr_title: c.pr_title || 'Unknown PR',
    pr_number: c.pr_number || 0,
    description: c.description,
    resolved: c.resolved,
    created_at: c.created_at.toISOString()
  }));

  const total_decisions = await prisma.decision.count({ where: { repo_id: repoId } });
  
  // Calculate decisions this month
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);
  const decisions_this_month = await prisma.decision.count({
    where: {
      repo_id: repoId,
      created_at: { gte: firstDayOfMonth }
    }
  });

  const pending_decisions = await prisma.pendingDecision.count({
    where: { repo_id: repoId, status: 'pending' }
  });

  return NextResponse.json({
    decisions,
    conflicts,
    stats: {
      total_decisions,
      unresolved_conflicts: conflicts.length,
      pending_decisions,
      decisions_this_month
    }
  });
}
