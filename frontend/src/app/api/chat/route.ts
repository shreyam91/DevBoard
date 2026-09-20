import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@devboard/shared/src/prisma';
import { askDevHub, listSessions } from '@devboard/shared/src/chat/chatService';

/**
 * GET /api/chat?repoId=...  -> list sessions for a repo (newest first)
 * POST /api/chat           -> ask DevHub a question (creates/loads session, streams answer)
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const repoId = req.nextUrl.searchParams.get('repoId');
    if (!repoId) return NextResponse.json({ error: 'repoId required' }, { status: 400 });

    // Guard: user must own this repo.
    const repo = await prisma.repo.findFirst({ where: { id: repoId, user_id: userId } });
    if (!repo) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const sessions = await listSessions(repoId);
    return NextResponse.json({ sessions });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { repoId, question, sessionId, context } = body;

    if (!repoId || !question) return NextResponse.json({ error: 'repoId and question required' }, { status: 400 });

    // Guard: user must own this repo.
    const repo = await prisma.repo.findFirst({ where: { id: repoId, user_id: userId } });
    if (!repo) return NextResponse.json({ error: 'Repo not found' }, { status: 404 });

    const result = await askDevHub({
      repoId,
      question: String(question).slice(0, 4000),
      sessionId: sessionId ? String(sessionId) : undefined,
      context,
    });

    return NextResponse.json(result);
  } catch (e: any) {
    console.error('[chat] POST failed:', e);
    return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
  }
}