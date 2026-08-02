import { getGithubToken } from '@devboard/shared/src/utils/auth';
import { Job } from 'bullmq';
import { prisma } from '@devboard/shared/src/prisma';

export async function processRepoSyncJob(job: Job) {
  console.log(`Starting scheduled repository sync (Job ID: ${job.id})`);

  try {
    // Find all repositories that are not already inaccessible
    const activeRepos = await prisma.repo.findMany({
      where: {
        health_status: { not: 'inaccessible' }
      }
    });

    console.log(`Found ${activeRepos.length} active repositories to sync.`);

    let inaccessibleCount = 0;

    for (const repo of activeRepos) {
      try {
        // Find the owner's github token
        const github_access_token = await getGithubToken(repo.user_id);

        if (!github_access_token) {
          console.warn(`No GitHub token found for user ${repo.user_id} (Repo: ${repo.full_name})`);
          continue;
        }

        // Fetch repository from GitHub API
        const repoRes = await fetch(`https://api.github.com/repos/${repo.full_name}`, {
          headers: {
            Authorization: `Bearer ${dbAccount.access_token}`,
            Accept: 'application/vnd.github.v3+json',
          }
        });

        if (repoRes.status === 404 || repoRes.status === 401) {
          console.log(`Repo ${repo.full_name} is inaccessible (Status: ${repoRes.status}). Updating status...`);
          
          await prisma.repo.update({
            where: { id: repo.id },
            data: { health_status: 'inaccessible' }
          });
          
          inaccessibleCount++;
        } else if (repoRes.ok) {
          // Optional: Update last checked time or other basic stats if needed
          await prisma.repo.update({
            where: { id: repo.id },
            data: { health_last_checked: new Date() }
          });
        }
      } catch (innerError) {
        console.error(`Failed to sync repo ${repo.full_name}:`, innerError);
      }
    }

    console.log(`Repository sync completed. Marked ${inaccessibleCount} repos as inaccessible.`);
  } catch (error) {
    console.error('Error during repository sync:', error);
    throw error;
  }
}
