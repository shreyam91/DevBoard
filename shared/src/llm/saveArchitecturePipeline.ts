import { prisma } from '../prisma';
import { generateArchitecture, ArchitectureContext } from './generateArchitecture';
import { commitFile } from '../github/commitFile';
import OpenAI from 'openai';

export async function executeArchitecturePipeline(
  repoId: string,
  repoFullName: string,
  githubAccessToken: string,
  context: ArchitectureContext
) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // 1. Generate architecture using LLM
  const llmResult = await generateArchitecture(context);

  // 2. Generate embeddings for decisions
  const decisionsWithEmbeddings = await Promise.all(
    llmResult.decisions.map(async (decision) => {
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
    repoFullName,
    'ARCHITECTURE.md',
    llmResult.markdownContent,
    'docs: Add generated ARCHITECTURE.md via DevBoard',
    githubAccessToken
  );

  // 4. Determine version and save to DB
  const lastFile = await prisma.architectureFile.findFirst({
    where: { repo_id: repoId },
    orderBy: { version: 'desc' },
  });
  const nextVersion = (lastFile?.version || 0) + 1;

  await prisma.$transaction(async (tx) => {
    // Insert ArchitectureFile
    await tx.architectureFile.create({
      data: {
        repo_id: repoId,
        content: llmResult.markdownContent,
        committed_at: new Date(),
        version: nextVersion,
      }
    });

    // Insert Decisions with pgvector
    for (const dec of decisionsWithEmbeddings) {
      const id = crypto.randomUUID();
      await tx.$executeRaw`
        INSERT INTO decisions (id, repo_id, title, rationale, category, source, embedding, created_at, confirmed_by_user)
        VALUES (
          ${id},
          ${repoId},
          ${dec.title},
          ${dec.rationale},
          ${dec.category}::"Category",
          ${dec.source}::"Source",
          ${dec.embedding}::vector,
          NOW(),
          false
        )
      `;
    }
    
    // Update repo to mark archaeology_done
    await tx.repo.update({
      where: { id: repoId },
      data: { archaeology_done: true },
    });
  });

  return { success: true };
}
