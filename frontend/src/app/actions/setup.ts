'use server';

import { getGithubToken } from '@devboard/shared/src/utils/auth';

import { prisma } from '@devboard/shared/src/prisma';
import { revalidatePath } from 'next/cache';
import { generateArchitectureDraft } from '@devboard/shared/src/llm/draftArchitecturePipeline';
import { commitDraftPipeline } from '@devboard/shared/src/llm/commitDraftPipeline';

export async function checkInitializationStatus(repoId: string) {
  const repo = await prisma.repo.findUnique({
    where: { id: repoId },
    include: {
      initialization_jobs: {
        orderBy: { created_at: 'desc' },
        take: 1
      }
    }
  });
  
  return {
    initialization_status: repo?.initialization_status,
    latestJob: repo?.initialization_jobs[0] || null
  };
}

export async function saveQuestionnaireDraft(repoId: string, answers: any) {
  await prisma.questionnaire.upsert({
    where: { repo_id: repoId },
    update: { answers },
    create: { repo_id: repoId, answers }
  });
  return { success: true };
}

export async function submitQuestionnaire(repoId: string) {
  // Update repo status
  await prisma.repo.update({
    where: { id: repoId },
    data: { initialization_status: 'in_progress' }
  });

  const repo = await prisma.repo.findUnique({ where: { id: repoId } });
  const q = await prisma.questionnaire.findUnique({ where: { repo_id: repoId } });
  
  if (q && repo) {
    if (repo.is_new_repo) {
      // Generate draft inline using LLM since no cloning is needed
      await generateArchitectureDraft(repoId, {
        source: 'questionnaire',
        data: q.answers
      });
    } else {
      // Push to BullMQ archaeology worker to analyze the codebase
      // The worker will now be able to fetch the questionnaire from DB
      const { devboardQueue } = require('@devboard/shared/src/queue');
      await devboardQueue.add('archaeology', { 
        repoId, 
        full_name: repo.full_name 
      });
    }
  }

  revalidatePath(`/dashboard/${repoId}/setup`);
  return { success: true };
}

export async function startArchaeologyJob(repoId: string, full_name: string) {
  // We should push to BullMQ here.
  // Since we are mocking the UI for now, we could either push to actual BullMQ
  // or simulate it if the worker isn't running.
  // For production, import the queue and add job:
  // import { devboardQueue } from '@devboard/shared/src/queue';
  // await devboardQueue.add('archaeology', { repoId, full_name });
  
  // Update status
  await prisma.repo.update({
    where: { id: repoId },
    data: { initialization_status: 'in_progress' }
  });
  
  revalidatePath(`/dashboard/${repoId}/setup`);
  return { success: true };
}

export async function approveAndCommitArchitecture(
  repoId: string,
  jobId: string,
  markdown: string,
  decisions: any[]
) {
  const repo = await prisma.repo.findUnique({ where: { id: repoId } });
  if (!repo) throw new Error("Repository not found");

  const github_access_token = await getGithubToken(repo.user_id);

  if (!github_access_token) throw new Error("Unauthorized: GitHub token missing");

  await commitDraftPipeline(
    repoId,
    jobId,
    github_access_token,
    markdown,
    decisions
  );

  revalidatePath(`/dashboard/${repoId}`);
  return { success: true };
}
