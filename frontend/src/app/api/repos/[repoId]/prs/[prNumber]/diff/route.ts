import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@devboard/shared/src/prisma';
import parseDiff from 'parse-diff';

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
    const { searchParams } = new URL(request.url);
    const commitSha = searchParams.get('commit_sha');
    
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

    let fetchUrl = `https://api.github.com/repos/${owner}/${name}/pulls/${prNumber}`;
    if (commitSha) {
      fetchUrl = `https://api.github.com/repos/${owner}/${name}/commits/${commitSha}`;
    }

    // Fetch diff
    const diffRes = await fetch(fetchUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        // Important: GitHub returns the unified diff if you ask for application/vnd.github.v3.diff
        Accept: 'application/vnd.github.v3.diff'
      }
    });

    if (!diffRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch diff from GitHub' }, { status: diffRes.status });
    }

    const diffText = await diffRes.text();
    // Parse the unified diff string into a structured JSON array
    const files = parseDiff(diffText);
    
    return NextResponse.json(files);
  } catch (error) {
    console.error('Error fetching diff:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
