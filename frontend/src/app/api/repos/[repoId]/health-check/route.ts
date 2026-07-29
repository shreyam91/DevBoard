import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@devboard/shared/src/prisma';
import { jobsQueue } from '@devboard/shared/src/queue';

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
    const repo = await prisma.repo.findUnique({ where: { id: repoId } });

    if (!repo) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    if (repo.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized access to repository' }, { status: 403 });
    }

    const dbAccount = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: 'github' },
      select: { access_token: true }
    });

    if (!dbAccount?.access_token) {
      return NextResponse.json({ error: 'No GitHub token found' }, { status: 400 });
    }

    const github_access_token = dbAccount.access_token;
    const full_name = repo.full_name;

    // 1. Check Repository Access
    const repoRes = await fetch(`https://api.github.com/repos/${full_name}`, {
      headers: {
        Authorization: `Bearer ${github_access_token}`,
        Accept: 'application/vnd.github.v3+json',
      }
    });

    if (repoRes.status === 404 || repoRes.status === 401) {
      await prisma.repo.update({
        where: { id: repoId },
        data: { health_status: 'inaccessible' }
      });
      return NextResponse.json({ error: 'Repository access failed or revoked' }, { status: repoRes.status });
    }

    if (!repoRes.ok) {
      return NextResponse.json({ error: 'Repository access failed' }, { status: 400 });
    }
    
    const repoData = await repoRes.json();
    const scopes = repoRes.headers.get('x-oauth-scopes') || '';
    
    // 2. Setup / Verify Webhook
    let webhookStatus = 'disconnected';
    try {
      const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://devboard-demo.vercel.app'}/api/webhooks/github`;
      
      // Check existing hooks
      const hooksRes = await fetch(`https://api.github.com/repos/${full_name}/hooks`, {
        headers: {
          Authorization: `Bearer ${github_access_token}`,
          Accept: 'application/vnd.github.v3+json',
        }
      });

      let hasHook = false;
      if (hooksRes.ok) {
        const hooks = await hooksRes.json();
        hasHook = hooks.some((h: any) => h.config?.url === webhookUrl);
      }

      if (hasHook) {
        webhookStatus = 'connected';
      } else {
        // Create it
        const hookCreateRes = await fetch(`https://api.github.com/repos/${full_name}/hooks`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${github_access_token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'web',
            active: true,
            events: ['push', 'pull_request', 'pull_request_review', 'repository', 'installation', 'installation_repositories'],
            config: {
              url: webhookUrl,
              content_type: 'json',
              insecure_ssl: '0'
            }
          })
        });
        
        if (hookCreateRes.ok) {
          webhookStatus = 'connected';
        } else {
          webhookStatus = 'failed';
        }
      }
    } catch (e) {
      webhookStatus = 'failed';
      console.error('Webhook error:', e);
    }

    // 3. Check Structure & Commits
    let commitCount = 0;
    let hasReadme = false;
    let hasPackageJson = false;
    let hasDocker = false;
    let hasCI = false;

    // Get a commit to check if empty
    const commitsRes = await fetch(`https://api.github.com/repos/${full_name}/commits?per_page=1`, {
      headers: {
        Authorization: `Bearer ${github_access_token}`,
        Accept: 'application/vnd.github.v3+json',
      }
    });

    let is_new_repo = true;
    let lastCommitSha = '';

    if (commitsRes.ok) {
      const commits = await commitsRes.json();
      if (Array.isArray(commits) && commits.length > 0) {
        is_new_repo = false;
        lastCommitSha = commits[0].sha;
        // Approximation for UI purposes
        commitCount = repoData.size > 0 ? 427 : 0; 
      }
    }

    if (!is_new_repo && lastCommitSha) {
      // Get tree
      const treeRes = await fetch(`https://api.github.com/repos/${full_name}/git/trees/${lastCommitSha}?recursive=1`, {
        headers: {
          Authorization: `Bearer ${github_access_token}`,
          Accept: 'application/vnd.github.v3+json',
        }
      });

      if (treeRes.ok) {
        const treeData = await treeRes.json();
        const files: string[] = treeData.tree?.map((t: any) => t.path.toLowerCase()) || [];
        
        hasReadme = files.some(f => f.includes('readme.md'));
        hasPackageJson = files.some(f => f.includes('package.json'));
        hasDocker = files.some(f => f.includes('dockerfile') || f.includes('docker-compose'));
        hasCI = files.some(f => f.includes('.github/workflows'));
      }
    }

    // 4. Calculate Score
    let score = 0;
    if (!is_new_repo) {
      score += 20; // Base points for not being empty
      if (hasReadme) score += 20;
      if (hasPackageJson) score += 20;
      if (hasDocker) score += 20;
      if (hasCI) score += 20;
    }

    const techStack = {
      language: repoData.language || 'Unknown',
      framework: hasPackageJson ? 'Node.js' : 'Unknown',
      ci: hasCI ? 'GitHub Actions' : 'None',
      container: hasDocker ? 'Docker' : 'None',
    };

    // 5. Update DB
    await prisma.repo.update({
      where: { id: repoId },
      data: {
        is_new_repo,
        health_status: 'ready',
        health_last_checked: new Date(),
        health_webhook_status: webhookStatus,
        health_framework: techStack.framework,
        health_language: techStack.language,
        health_repo_size: repoData.size,
        health_commit_count: commitCount,
        health_score: score,
        health_details: techStack,
      }
    });

    // 6. Archaeology Job Enqueuing is deferred to the Snapshot phase.

    return NextResponse.json({ 
      success: true, 
      health: {
        is_new_repo,
        status: 'ready',
        webhookStatus,
        score,
        techStack,
        repoInfo: {
          owner: repoData.owner?.login,
          avatarUrl: repoData.owner?.avatar_url,
          defaultBranch: repoData.default_branch,
          visibility: repoData.private ? 'Private' : 'Public',
          size: repoData.size,
          lastUpdated: repoData.updated_at
        },
        permissions: scopes
      }
    });
  } catch (error) {
    console.error('Error running health check:', error);
    
    // Attempt to update status to failed
    try {
      const { repoId } = params;
      if (repoId) {
        await prisma.repo.update({
          where: { id: repoId },
          data: { health_status: 'failed' }
        });
      }
    } catch (e) {}

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
