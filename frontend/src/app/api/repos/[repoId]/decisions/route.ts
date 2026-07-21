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
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category');

  // Verify access
  const repo = await prisma.repo.findFirst({
    where: { id: repoId, user_id: session.user.id }
  });

  if (!repo) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const whereClause: Record<string, string> = { repo_id: repoId };
  if (category) {
    whereClause.category = category;
  }

  const rawDecisions = await prisma.decision.findMany({
    where: whereClause,
    orderBy: { created_at: 'asc' }, // Chronological order
    include: {
      conflicts: {
        where: { resolved: false },
        select: { id: true, pr_number: true }
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
    confirmed_by_user: d.confirmed_by_user,
    created_at: d.created_at.toISOString(),
    has_conflict: d.conflicts.length > 0,
    conflict_pr_number: d.conflicts[0]?.pr_number || undefined
  }));

  return NextResponse.json(decisions);
}
