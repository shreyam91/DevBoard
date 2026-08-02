import React from 'react';
import { prisma } from '@devboard/shared/src/prisma';
import { getGithubToken } from '@devboard/shared/src/utils/auth';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { GitPullRequest, GitMerge, GitCommit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default async function PRsPage({ params }: { params: { repoId: string } }) {
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId) redirect('/sign-in');

  const repo = await prisma.repo.findUnique({
    where: { id: params.repoId, user_id: userId }
  });

  if (!repo) redirect('/dashboard');

  const token = await getGithubToken(userId);
  if (!token) return <div>No GitHub token found</div>;

  const [owner, name] = repo.full_name.split('/');

  // Fetch PRs from GitHub directly
  const prsRes = await fetch(`https://api.github.com/repos/${owner}/${name}/pulls?state=all&per_page=30`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json'
    },
    next: { revalidate: 60 } // Cache for 60 seconds
  });

  let prs: any[] = [];
  if (prsRes.ok) {
    prs = await prsRes.json();
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-3">
          <GitPullRequest className="text-accent-blue" />
          Pull Requests
        </h1>
        <p className="text-sm text-slate-500">Select a PR to explore its commit history</p>
      </div>

      <div className="flex-1 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-sm">
        {prs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No pull requests found.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {prs.map(pr => {
              const isMerged = pr.pull_request?.merged_at || pr.merged_at;
              const isClosed = pr.state === 'closed' && !isMerged;
              const isOpen = pr.state === 'open';

              return (
                <Link
                  key={pr.id}
                  href={`/dashboard/${params.repoId}/pr/${pr.number}`}
                  className="block p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {isOpen && <GitPullRequest className="text-green-600" size={18} />}
                      {isMerged && <GitMerge className="text-purple-600" size={18} />}
                      {isClosed && <GitPullRequest className="text-red-600" size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-medium text-slate-900 truncate">{pr.title}</h3>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="font-mono text-slate-400">#{pr.number}</span>
                        <span>
                          {isOpen ? 'opened' : isMerged ? 'merged' : 'closed'} {formatDistanceToNow(new Date(pr.created_at), { addSuffix: true })} by <strong className="text-slate-700">{pr.user.login}</strong>
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <GitCommit size={14} /> View History
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
