import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getGithubToken } from '@devboard/shared/src/utils/auth';
import { prisma } from '@devboard/shared/src/prisma';
import { jobsQueue } from '@devboard/shared/src/queue';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { github_repo_id, name, full_name } = body;

    if (!github_repo_id || !name || !full_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const github_access_token = await getGithubToken(userId);

    if (!github_access_token) {
      return NextResponse.json({ error: 'No GitHub token found' }, { status: 400 });
    }
    
    

    // 1. Fetch Exact Repo Details from GitHub
    const repoRes = await fetch(`https://api.github.com/repositories/${github_repo_id}`, {
      headers: {
        Authorization: `Bearer ${github_access_token}`,
        Accept: 'application/vnd.github.v3+json',
      }
    });

    if (!repoRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch repository from GitHub' }, { status: 400 });
    }

    const repoData = await repoRes.json();
    const exactName = repoData.name;
    const exactFullName = repoData.full_name;
    const ownerLogin = repoData.owner.login;
    const defaultBranch = repoData.default_branch || 'main';

    // 2. Advanced New Repo Detection
    let is_new_repo = false;
    
    // Check tree of default branch
    const treeRes = await fetch(`https://api.github.com/repos/${exactFullName}/git/trees/${defaultBranch}`, {
      headers: {
        Authorization: `Bearer ${github_access_token}`,
        Accept: 'application/vnd.github.v3+json',
      }
    });

    if (treeRes.ok) {
      const treeData = await treeRes.json();
      const files = treeData.tree || [];
      
      // A new repo usually has very few files (e.g. just README, LICENSE, .gitignore)
      // or no files at all.
      if (files.length === 0) {
        is_new_repo = true;
      } else if (files.length <= 3) {
        const hasOnlyBoilerplate = files.every((f: any) => 
          f.path.toLowerCase() === 'readme.md' || 
          f.path.toLowerCase() === 'license' || 
          f.path.toLowerCase() === '.gitignore'
        );
        if (hasOnlyBoilerplate) {
          is_new_repo = true;
        }
      }
    } else {
      // If we can't fetch the tree (e.g., branch doesn't exist yet because it's completely empty)
      is_new_repo = true;
    }

    // 3. Save Repo to DB
    const repo = await prisma.repo.upsert({
      where: { github_repo_id },
      update: {
        name: exactName,
        full_name: exactFullName,
        owner: ownerLogin,
        default_branch: defaultBranch,
        is_new_repo,
        health_status: 'checking'
      },
      create: {
        user_id: userId,
        github_repo_id,
        name: exactName,
        full_name: exactFullName,
        owner: ownerLogin,
        default_branch: defaultBranch,
        is_new_repo,
        health_status: 'checking'
      }
    });

    // Determine redirect logic
    const redirectUrl = `/repository/${repo.id}/health-check`;

    return NextResponse.json({ success: true, repo, redirect: redirectUrl });
  } catch (error) {
    console.error('Error connecting repo:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
