import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@devboard/shared/src/prisma';
import { auth } from '@clerk/nextjs/server';
import { getGithubToken } from '@devboard/shared/src/utils/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
    if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const conflictId = params.id;

  // Check ownership
  const conflict = await prisma.conflict.findUnique({
    where: { id: conflictId },
    include: { decision: { include: { repo: true } } }
  });

  if (!conflict || conflict.decision.repo.user_id !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.conflict.update({
    where: { id: conflictId },
    data: { resolved: true }
  });

  return NextResponse.json({ success: true });
}
