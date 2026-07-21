import { Job } from 'bullmq';
import { prisma } from '../lib/prisma';
import { extractArchaeologyContext } from '../lib/github/extractContext';
import { executeArchitecturePipeline } from '../lib/llm/saveArchitecturePipeline';

export async function processArchaeologyJob(job: Job) {
  const { repoId, full_name } = job.data;

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

    // 2. Extract signals
    const contextData = await extractArchaeologyContext(full_name, token);

    // 3. Execute Pipeline
    await executeArchitecturePipeline(
      repoId,
      full_name,
      token,
      {
        source: 'archaeology',
        data: contextData,
      }
    );

    console.log(`Successfully completed archaeology for repo: ${full_name}`);
  } catch (error) {
    console.error(`Error in archaeology worker for ${full_name}:`, error);

    // If max retries are exhausted, mark as failed
    if (job.attemptsMade >= (job.opts.attempts || 3) - 1) {
      await prisma.repo.update({
        where: { id: repoId },
        data: { archaeology_failed: true },
      });
      console.log(`Marked repo ${full_name} as archaeology_failed`);
    }

    throw error;
  }
}
