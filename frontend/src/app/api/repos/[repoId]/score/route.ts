import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@devboard/shared/src/prisma';
import { auth } from '@clerk/nextjs/server';
import { getGithubToken } from '@devboard/shared/src/utils/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { repoId: string } }
) {
  const { userId } = await auth();
    if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { repoId } = params;
  const repo = await prisma.repo.findFirst({
    where: { id: repoId, user_id: userId }
  });

  if (!repo) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  const days = searchParams.get('days') ? parseInt(searchParams.get('days')!) : 30;
  
  let dateFilter = {};
  if (days > 0) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    dateFilter = { calculated_at: { gte: d } };
  }

  // Get current (latest) score
  const currentScore = await prisma.architectureScore.findFirst({
    where: { repo_id: repoId },
    orderBy: { calculated_at: 'desc' }
  });

  // Get historical scores for the timeline
  const history = await prisma.architectureScore.findMany({
    where: { 
      repo_id: repoId,
      ...dateFilter
    },
    orderBy: { calculated_at: 'asc' },
    select: {
      score: true,
      calculated_at: true
    }
  });

  // Calculate trend (+/- since last week)
  let trend = 0;
  if (currentScore && history.length > 0) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // Find closest score to exactly one week ago, or the oldest one available within a week
    const lastWeekScore = await prisma.architectureScore.findFirst({
      where: {
        repo_id: repoId,
        calculated_at: { lte: oneWeekAgo }
      },
      orderBy: { calculated_at: 'desc' }
    });

    if (lastWeekScore) {
      trend = currentScore.score - lastWeekScore.score;
    } else if (history.length > 1) {
      // If we don't have data from exactly a week ago, just use the oldest data point available
      trend = currentScore.score - history[0].score;
    }
  }

  return NextResponse.json({
    current: currentScore,
    history,
    trend
  });
}
