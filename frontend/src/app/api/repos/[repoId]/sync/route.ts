import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@devboard/shared/src/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { repoId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { repoId } = params;

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
      return NextResponse.json({ error: 'No GitHub token found' }, { status: 400 });
    }

    const token = dbAccount.access_token;

    // Fetch repository details to get latest commit from default branch
    const repoRes = await fetch(`https://api.github.com/repositories/${repo.github_repo_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      }
    });

    if (!repoRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch repository from GitHub' }, { status: 400 });
    }

    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch || 'main';

    // Fetch commits for the default branch
    const commitsRes = await fetch(`https://api.github.com/repos/${repoData.full_name}/commits?sha=${defaultBranch}&per_page=1`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      }
    });

    let lastCommitSha = repo.last_commit_sha;
    let lastCommitMessage = repo.last_commit_message;
    let lastActivityAt = repo.last_activity_at;

    if (commitsRes.ok) {
      const commits = await commitsRes.json();
      if (commits.length > 0) {
        lastCommitSha = commits[0].sha;
        lastCommitMessage = commits[0].commit.message;
        lastActivityAt = new Date(commits[0].commit.author.date);
      }
    }

    // Determine if it's new
    let is_new_repo = repo.is_new_repo;
    if (is_new_repo) {
       // Recheck tree if it was marked as new
       const treeRes = await fetch(`https://api.github.com/repos/${repoData.full_name}/git/trees/${defaultBranch}`, {
         headers: {
           Authorization: `Bearer ${token}`,
           Accept: 'application/vnd.github.v3+json',
         }
       });
       if (treeRes.ok) {
         const treeData = await treeRes.json();
         const files = treeData.tree || [];
         if (files.length > 3) {
           const hasOnlyBoilerplate = files.every((f: any) => 
             f.path.toLowerCase() === 'readme.md' || 
             f.path.toLowerCase() === 'license' || 
             f.path.toLowerCase() === '.gitignore'
           );
           if (!hasOnlyBoilerplate) {
             is_new_repo = false;
           }
         }
       }
    }

    // Update in DB
    const updatedRepo = await prisma.repo.update({
      where: { id: repoId },
      data: {
        name: repoData.name,
        full_name: repoData.full_name,
        owner: repoData.owner.login,
        default_branch: defaultBranch,
        last_commit_sha: lastCommitSha,
        last_commit_message: lastCommitMessage,
        last_activity_at: lastActivityAt,
        is_new_repo
      }
    });

    return NextResponse.json({ success: true, repo: updatedRepo });
  } catch (error) {
    console.error('Error syncing repo:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
