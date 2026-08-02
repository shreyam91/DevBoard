import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@devboard/shared/src/prisma';
import { getGithubToken } from '@devboard/shared/src/utils/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { repoId: string } }
) {
  try {
    const { repoId } = params;
    const url = new URL(req.url);
    const query = url.searchParams.get('q');

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    const searchTerm = `%${query}%`;

    const repo = await prisma.repo.findUnique({
      where: { id: repoId }
    });

    // Search Pull Requests
    const prs = await prisma.pullRequest.findMany({
      where: {
        repo_id: repoId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 10
    });

    // Search Decisions
    const decisions = await prisma.decision.findMany({
      where: {
        repo_id: repoId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { rationale: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 10
    });

    // Search Conflicts
    const conflicts = await prisma.conflict.findMany({
      where: {
        repo_id: repoId,
        OR: [
          { pr_title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 10
    });

    // Search Pending Decisions
    const pendingDecisions = await prisma.pendingDecision.findMany({
      where: {
        repo_id: repoId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 10
    });

    // Search Commits directly from GitHub if we have the token
    let githubCommits: any[] = [];
    if (repo && repo.full_name) {
      try {
        const github_access_token = await getGithubToken(repo.user_id);
        if (github_access_token) {
          const ghUrl = `https://api.github.com/search/commits?q=repo:${repo.full_name}+${encodeURIComponent(query)}`;
          const ghRes = await fetch(ghUrl, {
            headers: {
              Authorization: `Bearer ${github_access_token}`,
            Accept: 'application/vnd.github.v3+json'
          }
        });
        if (ghRes.ok) {
          const ghData = await ghRes.json();
          githubCommits = (ghData.items || []).slice(0, 10).map((c: any) => ({
            id: c.sha,
            type: 'commit',
            title: c.commit.message.split('\n')[0],
            description: c.commit.message,
            url: c.html_url,
            date: c.commit.author.date
          }));
        }
        }
      } catch (err) {
        console.error('Github search error:', err);
      }
    }

    // Format all results into a unified structure
    const results = [
      ...prs.map(pr => ({
        id: pr.id,
        type: 'pull_request',
        title: pr.title,
        description: pr.description || '',
        url: pr.url,
        date: pr.merged_at
      })),
      ...decisions.map(d => ({
        id: d.id,
        type: 'decision',
        title: d.title,
        description: d.rationale,
        url: d.pr_url || '',
        date: d.created_at
      })),
      ...conflicts.map(c => ({
        id: c.id,
        type: 'conflict',
        title: c.pr_title || 'Conflict',
        description: c.description,
        url: c.pr_url || '',
        date: c.created_at
      })),
      ...pendingDecisions.map(p => ({
        id: p.id,
        type: 'pending_decision',
        title: p.title,
        description: p.description,
        url: '',
        date: p.created_at
      })),
      ...githubCommits
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
