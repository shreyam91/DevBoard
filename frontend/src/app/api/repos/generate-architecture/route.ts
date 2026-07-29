import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@devboard/shared/src/prisma';
import { executeArchitecturePipeline } from '@devboard/shared/src/llm/saveArchitecturePipeline';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { repoId, answers } = await req.json();

    if (!repoId || !answers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify ownership and get repo full_name
    const repo = await prisma.repo.findFirst({
      where: {
        id: repoId,
        user_id: session.user.id
      }
    });

    if (!repo) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    const dbAccount = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: 'github' },
      select: { access_token: true }
    });

    if (!dbAccount?.access_token) {
      return NextResponse.json({ error: 'No GitHub token found' }, { status: 403 });
    }

    await executeArchitecturePipeline(
      repo.id,
      repo.full_name,
      dbAccount.access_token,
      {
        source: 'questionnaire',
        data: answers,
      }
    );

    return NextResponse.json({ success: true, redirect: `/dashboard/${repoId}` });
  } catch (error: any) {
    console.error('Error generating architecture:', error);
    const errorMessage = error?.message || 'Unknown error';
    const errorMeta = error?.meta || {};
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage, meta: errorMeta }, { status: 500 });
  }
}
