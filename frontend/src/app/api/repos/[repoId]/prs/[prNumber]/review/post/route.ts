import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@devboard/shared/src/prisma';
import { getGithubToken } from '@devboard/shared/src/utils/auth';
import { postPullRequestReview, findingsToReviewComments } from '@devboard/shared/src/review/github';
import type { Finding } from '@devboard/shared/src/review/types';

export const runtime = 'nodejs';

// POST push the latest completed review as an inline GitHub PR review.
// This is the *explicit opt-in* posting path — the worker never posts automatically.
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

    const latest = await prisma.review.findFirst({
      where: { repo_id: repoId, pr_number: prNum, status: 'completed' },
      include: { findings: true },
      orderBy: { created_at: 'desc' },
    });
    if (!latest || latest.findings.length === 0) {
      return NextResponse.json({ error: 'No completed review with findings to post' }, { status: 400 });
    }

    const token = await getGithubToken(userId);
    if (!token) return NextResponse.json({ error: 'No GitHub token found' }, { status: 401 });

    const findings: Finding[] = latest.findings.map((f) => ({
      severity: f.severity as Finding['severity'],
      category: f.category as Finding['category'],
      title: f.title,
      description: f.description,
      file: f.file ?? undefined,
      line: f.line ?? undefined,
      line_end: f.line_end ?? undefined,
      suggestion: f.suggestion ?? undefined,
      confidence: f.confidence,
    }));

    const counts = findings.reduce((acc, f) => {
      acc[f.severity] = (acc[f.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const body = [
      `## 🤖 DevHub AI Review`,
      ``,
      `### Summary`,
      latest.summary || '',
      ``,
      `### Findings`,
      ...Object.entries(counts)
        .map(([sev, n]) => `${sev === 'critical' || sev === 'high' ? '🔴' : sev === 'medium' ? '🟡' : '🟢'} ${sev} ${n}`),
      ``,
      `_Posted from DevHub on demand._`,
    ].join('\n');

    const result = await postPullRequestReview(
      repo.full_name,
      prNum,
      {
        event: 'COMMENT',
        body,
        comments: findingsToReviewComments(findings),
      },
      token
    );

    return NextResponse.json({ ok: true, id: result.id, url: result.html_url });
  } catch (error: any) {
    console.error('Error posting review to GitHub:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}