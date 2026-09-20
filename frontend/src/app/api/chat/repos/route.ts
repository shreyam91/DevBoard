import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@devboard/shared/src/prisma';

/**
 * GET /api/chat/repos
 *
 * Lists the user's connected repositories from the DB (scoped to the current
 * user) so the Ask DevHub repo picker can ground answers in a real repo —
 * matching the RAG backend's repo_id scope.
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const repos = await prisma.repo.findMany({
      where: { user_id: userId },
      orderBy: { connected_at: 'desc' },
      take: 200,
      select: {
        id: true,
        full_name: true,
        name: true,
        owner: true,
        health_status: true,
        initialization_status: true,
      },
    });

    return NextResponse.json({ repos });
  } catch (e: any) {
    console.error('[chat/repos] failed:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}