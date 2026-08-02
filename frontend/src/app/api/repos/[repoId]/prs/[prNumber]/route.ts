import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getGithubToken } from '@devboard/shared/src/utils/auth';
import { prisma } from '@devboard/shared/src/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { repoId: string; prNumber: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { repoId, prNumber } = params;
    
    const repo = await prisma.repo.findUnique({
      where: { id: repoId, user_id: userId }
    });

    if (!repo) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    const github_access_token = await getGithubToken(userId);

    if (!github_access_token) {
      return NextResponse.json({ error: 'No GitHub token found' }, { status: 401 });
    }

    const token = github_access_token;
    const [owner, name] = repo.full_name.split('/');

    // Fetch PR metadata
    const prRes = await fetch(`https://api.github.com/repos/${owner}/${name}/pulls/${prNumber}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    if (!prRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch PR from GitHub' }, { status: prRes.status });
    }

    const prData = await prRes.json();
    return NextResponse.json(prData);
  } catch (error) {
    console.error('Error fetching PR metadata:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
