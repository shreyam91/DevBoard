import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@devboard/shared/src/prisma';
import { jobsQueue } from '@devboard/shared/src/queue';

export async function POST(
  request: NextRequest,
  { params }: { params: { repoId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { repoId } = params;
    if (!repoId) {
      return NextResponse.json({ error: 'Repository ID is required' }, { status: 400 });
    }

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

    // 1. Fetch Contributors (up to 100)
    const contribRes = await fetch(`https://api.github.com/repos/${owner}/${name}/contributors?per_page=100`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });
    
    let contributorsCount = 1;
    if (contribRes.ok && contribRes.status !== 204) {
      const contribs = await contribRes.json();
      contributorsCount = contribs.length || 1;
    }

    // 2. Fetch Tree
    let filesCount = 0;
    let dirsCount = 0;
    let packagesCount = 0;
    let workflowsCount = 0;

    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${name}/git/trees/${repo.default_branch}?recursive=1`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    const detectedTech = new Set<string>();
    const insights: string[] = [];

    if (treeRes.ok && treeRes.status !== 204) {
      const treeData = await treeRes.json();
      const tree = treeData.tree || [];

      for (const item of tree) {
        if (item.type === 'blob') filesCount++;
        if (item.type === 'tree') dirsCount++;
        
        const path = item.path || '';
        
        if (path.includes('package.json') || path.includes('requirements.txt') || path.includes('pom.xml') || path.includes('Cargo.toml')) {
          packagesCount++;
        }
        if (path.startsWith('.github/workflows/') && path.endsWith('.yml')) {
          workflowsCount++;
        }

        // Tech detection
        if (path.includes('next.config')) detectedTech.add('Next.js');
        if (path.includes('tailwind.config')) detectedTech.add('Tailwind CSS');
        if (path.includes('prisma/schema.prisma')) detectedTech.add('Prisma');
        if (path.includes('Dockerfile') || path.includes('docker-compose')) detectedTech.add('Docker');
        if (path.includes('tsconfig.json')) detectedTech.add('TypeScript');
        if (path.includes('vite.config')) detectedTech.add('Vite');
        if (path.includes('nuxt.config')) detectedTech.add('Nuxt');
        if (path.includes('svelte.config')) detectedTech.add('SvelteKit');
        if (path.includes('redis')) detectedTech.add('Redis');
        if (path.includes('postgres') || path.includes('pg')) detectedTech.add('PostgreSQL');
      }
    }

    if (detectedTech.size === 0) {
      detectedTech.add(repo.health_language || 'Unknown');
      detectedTech.add(repo.health_framework || 'Unknown');
    }

    // Convert Set to Array
    const techArray = Array.from(detectedTech).filter(t => t !== 'Unknown' && t !== 'None');

    // Rule-based insights
    if (techArray.includes('Next.js')) insights.push('Next.js application detected.');
    if (techArray.includes('Docker')) insights.push('Containerized Docker environment found.');
    if (techArray.includes('Prisma')) insights.push('Prisma ORM identified for database access.');
    if (workflowsCount > 0) insights.push('GitHub Actions CI/CD pipeline configured.');
    if (dirsCount > 10) insights.push('Repository follows a modular folder structure.');
    
    if (insights.length === 0) insights.push('Standard repository structure detected.');

    // Complexity
    let complexity = 'Simple';
    if (filesCount > 1000 || dirsCount > 100) complexity = 'Enterprise';
    else if (filesCount > 300) complexity = 'Advanced';
    else if (filesCount > 50) complexity = 'Moderate';

    const complexityExplanation = {
      'Simple': 'Straightforward codebase, ideal for rapid onboarding.',
      'Moderate': 'Moderate complexity with a well-defined project structure.',
      'Advanced': 'Large-scale application with substantial domain logic.',
      'Enterprise': 'Massive repository requiring significant architectural understanding.'
    }[complexity];

    // Upsert RepositoryMetadata
    await prisma.repositoryMetadata.upsert({
      where: { repo_id: repoId },
      update: {
        detected_frameworks: techArray,
        total_commits: repo.health_commit_count || 0
      },
      create: {
        repo_id: repoId,
        detected_frameworks: techArray,
        total_commits: repo.health_commit_count || 0
      }
    });

    // We can also trigger the archaeology job here if it's not a new repo.
    if (!repo.is_new_repo) {
      await jobsQueue.add('archaeology', {
        repoId: repo.id,
        full_name: repo.github_full_name
      });
    }

    return NextResponse.json({
      success: true,
      repoInfo: {
        owner,
        name,
        visibility: repo.is_private ? 'Private' : 'Public',
        defaultBranch: repo.default_branch,
        createdDate: new Date(repo.created_at).toLocaleDateString(),
        lastUpdated: new Date(repo.updated_at).toLocaleDateString(),
        size: repo.health_repo_size || 0,
        age: 'Active',
        language: repo.health_language || 'Unknown'
      },
      stats: {
        commits: repo.health_commit_count || 0,
        contributors: contributorsCount,
        files: filesCount,
        directories: dirsCount,
        packages: packagesCount,
        workflows: workflowsCount,
      },
      techStack: techArray,
      insights,
      complexity,
      complexityExplanation,
      score: repo.health_score || 0,
      is_new_repo: repo.is_new_repo
    });

  } catch (error: any) {
    console.error('Snapshot error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
