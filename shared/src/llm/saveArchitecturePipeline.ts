import { prisma } from '../prisma';
import { generateArchitecture, ArchitectureContext } from './generateArchitecture';
import { commitFile } from '../github/commitFile';
import { GoogleGenAI } from '@google/genai';

export async function executeArchitecturePipeline(
  repoId: string,
  repoFullName: string,
  githubAccessToken: string,
  context: ArchitectureContext
) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // 1. Generate architecture using LLM
  const llmResult = await generateArchitecture(context);

  // 2. Generate embeddings for decisions
  const decisionsWithEmbeddings = await Promise.all(
    llmResult.decisions.map(async (decision) => {
      const textToEmbed = `Title: ${decision.title}\nRationale: ${decision.rationale}`;
      const embeddingRes = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: textToEmbed,
      });
      return {
        ...decision,
        embedding: embeddingRes.embeddings[0].values,
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
  const lastFile = await prisma.architectureVersion.findFirst({
    where: { repo_id: repoId },
    orderBy: { version: 'desc' },
  });
  const nextVersion = (lastFile?.version || 0) + 1;

  await prisma.$transaction(async (tx) => {
    // Insert ArchitectureVersion
    await tx.architectureVersion.create({
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
