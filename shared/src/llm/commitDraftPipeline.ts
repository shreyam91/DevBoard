import { prisma } from '../prisma';
import { commitFile } from '../github/commitFile';
import OpenAI from 'openai';

export async function commitDraftPipeline(
  repoId: string,
  jobId: string,
  githubAccessToken: string,
  editedMarkdown: string,
  editedDecisions: any[]
) {
  const openai = new OpenAI({ 
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPEN_AI_API || process.env.OPENAI_API_KEY 
  });

  // 1. Fetch repo
  const repo = await prisma.repo.findUnique({
    where: { id: repoId }
  });
  if (!repo) throw new Error('Repository not found');

  // 2. Generate embeddings for edited decisions
  const decisionsWithEmbeddings = await Promise.all(
    editedDecisions.map(async (decision) => {
      const textToEmbed = `Title: ${decision.title}\nRationale: ${decision.rationale}`;
      const embeddingRes = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: textToEmbed,
        encoding_format: 'float',
      });
      return {
        ...decision,
        embedding: embeddingRes.data[0].embedding,
      };
    })
  );

  // 3. Commit file to GitHub
  await commitFile(
    repo.full_name,
    'ARCHITECTURE.md',
    editedMarkdown,
    'docs: Add generated ARCHITECTURE.md via DevBoard',
    githubAccessToken
  );

  // 4. Determine version
  const lastFile = await prisma.architectureVersion.findFirst({
    where: { repo_id: repoId },
    orderBy: { version: 'desc' },
  });
  const nextVersion = (lastFile?.version || 0) + 1;

  // 5. Save to DB transactionally
  await prisma.$transaction(async (tx) => {
    // Insert ArchitectureVersion
    await tx.architectureVersion.create({
      data: {
        repo_id: repoId,
        content: editedMarkdown,
        committed_at: new Date(),
        version: nextVersion,
      }
    });

    // Insert Decisions and Embeddings
    for (const dec of decisionsWithEmbeddings) {
      const decision = await tx.decision.create({
        data: {
          repo_id: repoId,
          title: dec.title,
          rationale: dec.rationale,
          category: dec.category,
          source: dec.source || 'archaeology',
          confirmed_by_user: true,
        }
      });
      
      // pgvector raw query for embedding
      await tx.$executeRaw`
        INSERT INTO decision_embeddings (id, decision_id, vector)
        VALUES (
          ${crypto.randomUUID()},
          ${decision.id},
          ${dec.embedding}::vector
        )
      `;
    }
    
    // Update repo status
    await tx.repo.update({
      where: { id: repoId },
      data: { 
        initialization_status: 'completed',
        archaeology_done: true
      },
    });

    // Update job status
    await tx.initializationJob.update({
      where: { id: jobId },
      data: { status: 'completed' }
    });
  });

  return { success: true };
}
