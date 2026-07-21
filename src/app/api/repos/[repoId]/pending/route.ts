import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

  const unconfirmed_decisions = await prisma.decision.count({
    where: { 
      repo_id: repoId,
      confirmed_by_user: false,
      source: { in: ['pr', 'archaeology'] }
    }
  });

  const active_conflicts = await prisma.conflict.count({
    where: {
      resolved: false,
      decision: { repo_id: repoId }
    }
  });

  return NextResponse.json({
    unconfirmed_decisions,
    active_conflicts
  });
}
