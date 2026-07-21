import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@devboard/shared/src/prisma';
import { auth } from '@/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const decisionId = params.id;

  // Check ownership
  const decision = await prisma.decision.findUnique({
    where: { id: decisionId },
    include: { repo: true }
  });

  if (!decision || decision.repo.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.decision.update({
    where: { id: decisionId },
    data: { confirmed_by_user: true }
  });

  return NextResponse.json({ success: true });
}
