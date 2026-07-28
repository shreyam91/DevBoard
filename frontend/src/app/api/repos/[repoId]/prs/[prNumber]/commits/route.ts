import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@devboard/shared/src/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { repoId: string; prNumber: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { repoId, prNumber } = params;
    
    const repo = await prisma.repo.findUnique({
      where: { id: repoId, user_id: session.user.id }
    });

    if (!repo) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    const dbAccount = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: 'github' },
      select: { access_token: true }
    });

    if (!dbAccount?.access_token) {
      return NextResponse.json({ error: 'No GitHub token found' }, { status: 401 });
    }

    const token = dbAccount.access_token;
    const [owner, name] = repo.full_name.split('/');

    // Fetch PR commits
    const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${name}/pulls/${prNumber}/commits?per_page=100`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    if (!commitsRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch PR commits from GitHub' }, { status: commitsRes.status });
    }

    const commitsData = await commitsRes.json();
    return NextResponse.json(commitsData);
  } catch (error) {
    console.error('Error fetching PR commits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
