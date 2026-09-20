import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@devboard/shared/src/prisma';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all repos for the user to ensure we only count their data
    const repos = await prisma.repo.findMany({
      where: { user_id: userId },
      select: { id: true },
    });

    const repoIds = repos.map(r => r.id);

    if (repoIds.length === 0) {
      return NextResponse.json({
        activeConflicts: 0,
        pendingDecisions: 0,
        decisionsLogged: 0,
      });
    }

    const [activeConflicts, pendingDecisions, decisionsLogged] = await Promise.all([
      prisma.conflict.count({
        where: {
          repo_id: { in: repoIds },
          resolved: false,
        },
      }),
      prisma.pendingDecision.count({
        where: {
          repo_id: { in: repoIds },
          status: 'pending',
        },
      }),
      prisma.decision.count({
        where: {
          repo_id: { in: repoIds },
          confirmed_by_user: true,
        },
      }),
    ]);

    return NextResponse.json({
      activeConflicts,
      pendingDecisions,
      decisionsLogged,
    });
  } catch (error) {
    console.error('Error fetching decision stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
