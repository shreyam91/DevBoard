import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { executeArchitecturePipeline } from '@/lib/llm/saveArchitecturePipeline';

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

    // Verify ownership and get github token & repo full_name
    const repo = await prisma.repo.findFirst({
      where: {
        id: repoId,
        user_id: session.user.id
      },
      include: {
        user: {
          select: { github_access_token: true }
        }
      }
    });

    if (!repo || !repo.user.github_access_token) {
      return NextResponse.json({ error: 'Repository not found or unauthorized' }, { status: 403 });
    }

    await executeArchitecturePipeline(
      repo.id,
      repo.full_name,
      repo.user.github_access_token,
      {
        source: 'questionnaire',
        data: answers,
      }
    );

    return NextResponse.json({ success: true, redirect: `/dashboard/${repoId}` });
  } catch (error) {
    console.error('Error generating architecture:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
