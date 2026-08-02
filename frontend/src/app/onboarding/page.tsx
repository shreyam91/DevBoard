import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@devboard/shared/src/prisma';
import { getGithubToken } from '@devboard/shared/src/utils/auth';
import RepoList, { GitHubRepo } from './RepoList';

export default async function OnboardingPage() {
  const { userId } = await auth();
    if (!userId) {
    redirect('/sign-in');
  }

  const token = await getGithubToken(userId);

  if (!token) {
    // Edge case: if token is missing, they need to log in again
    redirect('/sign-in');
  }

  // Fetch repos from GitHub
  const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
    next: { revalidate: 0 } // don't cache
  });

  if (!res.ok) {
    console.error('Failed to fetch GitHub repos:', await res.text());
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Failed to load repositories. Your GitHub token might have expired. Please log out and log in again.
        </div>
      </div>
    );
  }

  const repos: GitHubRepo[] = await res.json();

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
          Welcome to DevBoard!
        </h2>
        <p className="mt-4 text-lg text-gray-500">
          Let&apos;s get started by connecting the repository you want to analyze and manage.
        </p>
      </div>
      
      <RepoList repos={repos} />
    </main>
  );
}
