import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@devboard/shared/src/prisma';
import { reviewQueue } from '@devboard/shared/src/queue';
import { getGithubToken } from '@devboard/shared/src/utils/auth';

export const runtime = 'nodejs';

// GET latest AI review + findings for the PR.
export async function GET(
  _req: NextRequest,
  { params }: { params: { repoId: string; prNumber: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { repoId, prNumber } = params;
    const prNum = Number(prNumber);

    const repo = await prisma.repo.findUnique({ where: { id: repoId, user_id: userId } });
    if (!repo) return NextResponse.json({ error: 'Repository not found' }, { status: 404 });

    const pullRequest = await prisma.pullRequest.findFirst({
      where: { repo_id: repoId, pr_number: prNum },
    });

    const reviews = await prisma.review.findMany({
      where: { repo_id: repoId, pr_number: prNum },
      include: { findings: { include: { feedback: true }, orderBy: { created_at: 'desc' } } },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ pullRequest, reviews });
  } catch (error: any) {
    console.error('Error fetching review:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// POST enqueue an AI review for this PR.
export async function POST(
  _req: NextRequest,
  { params }: { params: { repoId: string; prNumber: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { repoId, prNumber } = params;
    const prNum = Number(prNumber);

    const repo = await prisma.repo.findUnique({ where: { id: repoId, user_id: userId } });
    if (!repo) return NextResponse.json({ error: 'Repository not found' }, { status: 404 });

    const repoFullName = repo.full_name;

    // Fetch the PR's head sha so we can dedupe and scope the review.
    let headSha: string | null = null;
    let prTitle = `PR #${prNum}`;
    let prUrl = `https://github.com/${repoFullName}/pull/${prNum}`;
    try {
      const git = await getGithubToken(userId);
      if (git) {
        const res = await fetch(`https://api.github.com/repos/${repoFullName}/pulls/${prNum}`, {
          headers: { Authorization: `Bearer ${git}`, Accept: 'application/vnd.github.v3+json' },
        });
        if (res.ok) {
          const data = await res.json();
          headSha = data.head?.sha ?? null;
          prTitle = data.title ?? prTitle;
        }
      }
    } catch { /* best-effort */ }

    // Idempotency guard: reuse an active review for the same head.
    const prRecord = await prisma.pullRequest.findFirst({ where: { repo_id: repoId, pr_number: prNum } });
    if (headSha && prRecord) {
      const existing = await prisma.review.findFirst({
        where: {
          pull_request_id: prRecord.id,
          head_sha: headSha,
          status: { in: ['processing', 'completed'] },
        },
      });
      if (existing) {
        return NextResponse.json({ enqueued: false, reviewId: existing.id, status: 'already_exists' });
      }
    }

    await reviewQueue.add('pr-review', {
      repoId,
      repoFullName,
      prNumber: prNum,
      prTitle,
      prUrl,
      headSha,
    }, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });

    return NextResponse.json({ enqueued: true, prNumber: prNum });
  } catch (error: any) {
    console.error('Error enqueueing review:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

