import { prisma } from '../prisma';
import { generateArchitecture, ArchitectureContext } from './generateArchitecture';

export async function generateArchitectureDraft(
  repoId: string,
  context: ArchitectureContext
) {
  // 1. Generate architecture using LLM
  const llmResult = await generateArchitecture(context);

  // 2. Find existing active initialization job or create one
  let job = await prisma.initializationJob.findFirst({
    where: { 
      repo_id: repoId,
      status: { in: ['queued', 'processing'] }
    },
    orderBy: { created_at: 'desc' }
  });

  if (!job) {
    job = await prisma.initializationJob.create({
      data: {
        repo_id: repoId,
        type: context.source,
        status: 'processing'
      }
    });
  }

  // 3. Save draft to InitializationJob
  await prisma.initializationJob.update({
    where: { id: job.id },
    data: {
      draft_markdown: llmResult.markdownContent,
      draft_decisions: llmResult.decisions as any,
      status: 'review_pending'
    }
  });

  // 4. Update repo initialization status
  await prisma.repo.update({
    where: { id: repoId },
    data: {
      initialization_status: 'review'
    }
  });

  return { success: true, jobId: job.id };
}
