import { redirect } from 'next/navigation';
import { prisma } from '@devboard/shared/src/prisma';
import SetupClient from './SetupClient';

export default async function SetupPage({ params }: { params: { repoId: string } }) {
  const { repoId } = params;

  // 1. Fetch repo
  const repo = await prisma.repo.findUnique({
    where: { id: repoId },
    include: { 
      user: true,
      initialization_jobs: {
        orderBy: { created_at: 'desc' },
        take: 1
      },
      questionnaire: true
    }
  });

  if (!repo || !repo.user.github_access_token) {
    return redirect('/dashboard');
  }

  if (repo.initialization_status === 'completed') {
    return redirect(`/dashboard/${repoId}`);
  }

  // 2. Check commits to determine if New or Existing repo
  // Only do this if we haven't already decided
  let isNewRepo = repo.is_new_repo;
  let detected = false;
  
  if (repo.initialization_status === 'pending') {
    try {
      const res = await fetch(`https://api.github.com/repos/${repo.full_name}/commits?per_page=10`, {
        headers: {
          Authorization: `Bearer ${repo.user.github_access_token}`,
          Accept: 'application/vnd.github.v3+json',
        }
      });
      const commits = await res.json();
      
      // Treat as new if less than 5 commits
      isNewRepo = Array.isArray(commits) && commits.length < 5;
      detected = true;

      // Update in DB
      await prisma.repo.update({
        where: { id: repoId },
        data: { is_new_repo: isNewRepo }
      });
    } catch (e) {
      console.error('Failed to fetch commits for detection', e);
    }
  }

  const latestJob = repo.initialization_jobs[0];

  return (
    <div className="flex flex-col h-full bg-white relative">
      <SetupClient 
        repoId={repo.id}
        repoFullName={repo.full_name}
        isNewRepo={isNewRepo}
        initializationStatus={repo.initialization_status}
        latestJob={latestJob}
        initialQuestionnaire={repo.questionnaire?.answers || {}}
      />
    </div>
  );
}
