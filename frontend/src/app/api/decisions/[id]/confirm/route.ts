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

  const decisionId = params.id;

  // Check ownership
  const decision = await prisma.decision.findUnique({
    where: { id: decisionId },
    include: { repo: true }
  });

  if (!decision || decision.repo.user_id !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.decision.update({
    where: { id: decisionId },
    data: { confirmed_by_user: true }
  });

  return NextResponse.json({ success: true });
}
