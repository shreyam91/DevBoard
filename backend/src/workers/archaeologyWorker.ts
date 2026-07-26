import { Job } from 'bullmq';
import { prisma } from '@devboard/shared/src/prisma';
import { extractArchaeologyContext } from '@devboard/shared/src/github/extractContext';
import { generateArchitectureDraft } from '@devboard/shared/src/llm/draftArchitecturePipeline';

export async function processArchaeologyJob(job: Job) {
  const { repoId, full_name, jobId } = job.data;

  try {
    // 1. Fetch repo and token
    const repo = await prisma.repo.findUnique({
      where: { id: repoId },
      include: { user: true },
    });

    if (!repo || !repo.user.github_access_token) {
      throw new Error('Repository or GitHub token not found');
    }

    const token = repo.user.github_access_token;

    // Update job status to processing if we have a tracking DB record
    if (jobId) {
      await prisma.initializationJob.update({
        where: { id: jobId },
        data: { status: 'processing' }
      });
      await prisma.repo.update({
        where: { id: repoId },
        data: { initialization_status: 'in_progress' }
      });
    }

    // 2. Extract signals
    const contextData = await extractArchaeologyContext(full_name, token);

    // Save Repository Metadata
    await prisma.repositoryMetadata.upsert({
      where: { repo_id: repoId },
      update: {
        detected_languages: contextData.detected_languages as any,
        detected_frameworks: contextData.detected_frameworks as any,
        detected_infra: contextData.detected_infra as any,
        first_commit_date: contextData.commit_history_summary.first_commit_date ? new Date(contextData.commit_history_summary.first_commit_date) : null,
        last_commit_date: contextData.commit_history_summary.last_commit_date ? new Date(contextData.commit_history_summary.last_commit_date) : null,
        total_commits: contextData.commit_history_summary.total_commits_sample,
        readme_summary: contextData.readme_summary
      },
      create: {
        repo_id: repoId,
        detected_languages: contextData.detected_languages as any,
        detected_frameworks: contextData.detected_frameworks as any,
        detected_infra: contextData.detected_infra as any,
        first_commit_date: contextData.commit_history_summary.first_commit_date ? new Date(contextData.commit_history_summary.first_commit_date) : null,
        last_commit_date: contextData.commit_history_summary.last_commit_date ? new Date(contextData.commit_history_summary.last_commit_date) : null,
        total_commits: contextData.commit_history_summary.total_commits_sample,
        readme_summary: contextData.readme_summary
      }
    });

    // 3. Execute Draft Pipeline (instead of committing directly)
    await generateArchitectureDraft(
      repoId,
      {
        source: 'archaeology',
        data: contextData,
      }
    );

    console.log(`Successfully generated architecture draft for repo: ${full_name}`);
  } catch (error) {
    console.error(`Error in archaeology worker for ${full_name}:`, error);

    // If max retries are exhausted, mark as failed
    if (job.attemptsMade >= (job.opts.attempts || 3) - 1) {
      if (jobId) {
        await prisma.initializationJob.update({
          where: { id: jobId },
          data: { status: 'failed' }
        });
      }
      
      await prisma.repo.update({
        where: { id: repoId },
        data: { 
          archaeology_failed: true,
          initialization_status: 'failed'
        },
      });
      console.log(`Marked repo ${full_name} as archaeology_failed`);
    }

    throw error;
  }
}
