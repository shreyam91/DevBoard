'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function confirmDecision(decisionId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const decision = await prisma.decision.findUnique({
    where: { id: decisionId },
    include: { repo: true }
  });

  if (!decision || decision.repo.user_id !== session.user.id) {
    throw new Error('Not found or unauthorized');
  }

  await prisma.decision.update({
    where: { id: decisionId },
    data: { confirmed_by_user: true }
  });

  revalidatePath(`/dashboard/${decision.repo_id}`);
}

export async function deleteDecision(decisionId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const decision = await prisma.decision.findUnique({
    where: { id: decisionId },
    include: { repo: true }
  });

  if (!decision || decision.repo.user_id !== session.user.id) {
    throw new Error('Not found or unauthorized');
  }

  // Also delete associated conflicts
  await prisma.conflict.deleteMany({
    where: { decision_id: decisionId }
  });

  await prisma.decision.delete({
    where: { id: decisionId }
  });

  revalidatePath(`/dashboard/${decision.repo_id}`);
}

export async function resolveConflict(conflictId: string, repoId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const conflict = await prisma.conflict.findUnique({
    where: { id: conflictId },
    include: { decision: { include: { repo: true } } }
  });

  if (!conflict || conflict.decision.repo.user_id !== session.user.id) {
    throw new Error('Not found or unauthorized');
  }

  await prisma.conflict.update({
    where: { id: conflictId },
    data: { resolved: true }
  });

  revalidatePath(`/dashboard/${repoId}`);
  revalidatePath(`/dashboard/${repoId}/conflicts`);
}
