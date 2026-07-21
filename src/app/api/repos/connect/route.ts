import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { jobsQueue } from '@/lib/queue';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { github_repo_id, name, full_name } = body;

    if (!github_repo_id || !name || !full_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { github_access_token: true }
    });

    if (!dbUser?.github_access_token) {
      return NextResponse.json({ error: 'No GitHub token found' }, { status: 400 });
    }

    // Check for commits
    const commitsRes = await fetch(`https://api.github.com/repos/${full_name}/commits?per_page=1`, {
      headers: {
        Authorization: `Bearer ${dbUser.github_access_token}`,
        Accept: 'application/vnd.github.v3+json',
      }
    });
    
    let hasCommits = false;
    if (commitsRes.ok) {
      const commits = await commitsRes.json();
      if (Array.isArray(commits) && commits.length > 0) {
        hasCommits = true;
      }
    }

    const is_new_repo = !hasCommits;

    // Save Repo to DB
    const repo = await prisma.repo.upsert({
      where: { github_repo_id },
      update: {
        name,
        full_name,
        is_new_repo,
      },
      create: {
        user_id: session.user.id,
        github_repo_id,
        name,
        full_name,
        is_new_repo,
      }
    });

    // Enqueue archaeology job if it's not a new repo
    if (hasCommits) {
      await jobsQueue.add('archaeology', { repoId: repo.id, full_name });
    }

    // Try to setup webhook
    try {
      const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://devboard-demo.vercel.app'}/api/webhooks/github`;
      const hookRes = await fetch(`https://api.github.com/repos/${full_name}/hooks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${dbUser.github_access_token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'web',
          active: true,
          events: ['pull_request'],
          config: {
            url: webhookUrl,
            content_type: 'json',
            insecure_ssl: '0'
          }
        })
      });
      if (!hookRes.ok) {
        console.warn('Failed to set up webhook. Status:', hookRes.status, await hookRes.text());
      }
    } catch (e) {
      console.error('Error setting up webhook:', e);
    }

    // Determine redirect logic
    const redirectUrl = is_new_repo ? `/onboarding/questionnaire?repoId=${repo.id}` : '/dashboard';

    return NextResponse.json({ success: true, repo, redirect: redirectUrl });
  } catch (error) {
    console.error('Error connecting repo:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
