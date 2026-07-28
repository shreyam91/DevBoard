import { NextResponse } from 'next/server';
import { prisma } from '@devboard/shared/src/prisma';
import { auth } from '@/auth';
import parseDiff from 'parse-diff';

export async function GET(
  request: Request,
  { params }: { params: { repoId: string, sha: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const repo = await prisma.repo.findUnique({
      where: { id: params.repoId, user_id: session.user.id }
    });

    if (!repo) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    const dbAccount = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: 'github' },
      select: { access_token: true }
    });

    const token = dbAccount?.access_token;
    if (!token) {
      return NextResponse.json({ error: 'No GitHub token found' }, { status: 401 });
    }

    const [owner, name] = repo.full_name.split('/');
    
    // Fetch the diff for the specific commit
    const githubRes = await fetch(
      `https://api.github.com/repos/${owner}/${name}/commits/${params.sha}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3.diff'
        }
      }
    );

    if (!githubRes.ok) {
      const errorText = await githubRes.text();
      return NextResponse.json({ error: `GitHub API error: ${errorText}` }, { status: githubRes.status });
    }

    const diffText = await githubRes.text();
    const files = parseDiff(diffText);
    
    return NextResponse.json(files);
  } catch (error: any) {
    console.error('Error fetching commit diff:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
