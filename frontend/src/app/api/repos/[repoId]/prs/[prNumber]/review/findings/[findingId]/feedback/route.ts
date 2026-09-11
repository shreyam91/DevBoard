import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@devboard/shared/src/prisma';

export const runtime = 'nodejs';

// POST mark a finding as useful / false_positive, or dismiss it.
export async function POST(
  req: NextRequest,
  { params }: { params: { repoId: string; prNumber: string; findingId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { repoId, prNumber, findingId } = params;
    const body = await req.json().catch(() => ({}));
    const reaction = body.reaction as string;

    if (!['useful', 'false_positive', 'dismiss'].includes(reaction)) {
      return NextResponse.json({ error: 'Invalid reaction' }, { status: 400 });
    }

    const repo = await prisma.repo.findUnique({ where: { id: repoId, user_id: userId } });
    if (!repo) return NextResponse.json({ error: 'Repository not found' }, { status: 404 });

    const finding = await prisma.reviewFinding.findFirst({
      where: {
        id: findingId,
        review: { repo_id: repoId, pr_number: Number(prNumber) },
      },
    });
    if (!finding) return NextResponse.json({ error: 'Finding not found' }, { status: 404 });

    if (reaction === 'dismiss') {
      const updated = await prisma.reviewFinding.update({
        where: { id: findingId },
        data: { status: 'dismissed' },
      });
      return NextResponse.json({ ok: true, status: updated.status });
    }

    // Upsert this user's reaction to the finding.
    const existing = await prisma.findingFeedback.findFirst({
      where: { finding_id: findingId, user_id: userId },
    });

    if (existing) {
      if (existing.reaction === reaction) {
        // Toggle off on repeat click.
        await prisma.findingFeedback.delete({ where: { id: existing.id } });
        return NextResponse.json({ ok: true, removed: true });
      }
      await prisma.findingFeedback.update({ where: { id: existing.id }, data: { reaction } });
      return NextResponse.json({ ok: true, reaction });
    }

    await prisma.findingFeedback.create({ data: { finding_id: findingId, user_id: userId, reaction } });
    return NextResponse.json({ ok: true, reaction });
  } catch (error: any) {
    console.error('Error recording feedback:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}