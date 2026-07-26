import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@devboard/shared/src/prisma';
import { auth } from '@/auth';
import { architectureUpdateQueue } from '@devboard/shared/src/queue';

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

  const unconfirmed_decisions = await prisma.pendingDecision.count({
    where: { 
      repo_id: repoId,
      status: 'pending'
    }
  });

  const active_conflicts = await prisma.conflict.count({
    where: {
      resolved: false,
      repo_id: repoId
    }
  });

  const pendingDecisions = await prisma.pendingDecision.findMany({
    where: { repo_id: repoId, status: 'pending' },
    orderBy: { created_at: 'desc' }
  });

  return NextResponse.json({
    unconfirmed_decisions,
    active_conflicts,
    pendingDecisions
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { repoId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { repoId } = params;
  const repo = await prisma.repo.findFirst({
    where: { id: repoId, user_id: session.user.id }
  });

  if (!repo) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await request.json();
  const { pendingDecisionId, action } = body;

  if (!pendingDecisionId || !['approve', 'discard'].includes(action)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const pending = await prisma.pendingDecision.findUnique({
    where: { id: pendingDecisionId }
  });

  if (!pending || pending.repo_id !== repoId) {
    return NextResponse.json({ error: 'Pending decision not found' }, { status: 404 });
  }

  if (action === 'discard') {
    await prisma.pendingDecision.update({
      where: { id: pendingDecisionId },
      data: { status: 'discarded' }
    });
    
    // Recalculate score after discarding a pending decision
    const { architectureScoreQueue } = await import('@devboard/shared/src/queue');
    await architectureScoreQueue.add('architecture-score', { repoId });
    
    return NextResponse.json({ success: true, message: 'Decision discarded' });
  }

  if (action === 'approve') {
    await architectureUpdateQueue.add('architecture-update', {
      pendingDecisionId
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 }
    });
    return NextResponse.json({ success: true, message: 'Architecture update queued' });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
