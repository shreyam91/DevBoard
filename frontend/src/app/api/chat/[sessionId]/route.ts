import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@devboard/shared/src/prisma';
import { deleteSession, getMessages } from '@devboard/shared/src/chat/chatService';

/**
 * GET    /api/chat/[sessionId]  -> messages for this session
 * DELETE /api/chat/[sessionId]  -> delete the session and its messages
 */
export async function GET(_req: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session = await prisma.chatSession.findFirst({
      where: { id: params.sessionId, user_id: userId },
    });
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    const messages = await getMessages(session.id);
    return NextResponse.json({ messages });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session = await prisma.chatSession.findFirst({
      where: { id: params.sessionId, user_id: userId },
    });
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    await deleteSession(session.id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}