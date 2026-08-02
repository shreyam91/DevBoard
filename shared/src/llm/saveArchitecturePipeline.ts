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
  const ai = new OpenAI({ 
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPEN_AI_API || process.env.GEMINI_API_KEY 
  });

  // 1. Generate architecture using LLM
  const llmResult = await generateArchitecture(context);

  // 2. Generate embeddings for decisions
  const decisionsWithEmbeddings = await Promise.all(
    llmResult.decisions.map(async (decision) => {
      const textToEmbed = `Title: ${decision.title}\nRationale: ${decision.rationale}`;
      const embeddingRes = await ai.embeddings.create({
        model: 'openai/text-embedding-3-small',
        input: textToEmbed,
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
    const validCategories = ['database', 'infra', 'api', 'architecture', 'tooling'];

    for (const dec of decisionsWithEmbeddings) {
      const normalizedCat = String(dec.category || '').toLowerCase();
      const finalCategory = validCategories.includes(normalizedCat) ? normalizedCat : 'architecture';

      const decision = await tx.decision.create({
        data: {
          repo_id: repoId,
          title: dec.title,
          rationale: dec.rationale,
          category: finalCategory as any,
          source: dec.source,
          confirmed_by_user: false,
        }
      });
      const embeddingId = crypto.randomUUID();
      const embeddingString = `[${dec.embedding.join(',')}]`;
      try {
        await tx.$executeRaw`
          INSERT INTO decision_embeddings (id, decision_id, vector)
          VALUES (
            ${embeddingId},
            ${decision.id},
            ${embeddingString}::vector
          )
        `;
      } catch (err: any) {
        console.error("FAILED TO INSERT EMBEDDING:", err);
        if (err.meta) console.error("Error meta:", err.meta);
        if (err.cause) console.error("Error cause:", err.cause);
        throw err;
      }
    }
    
    // Update repo to mark archaeology_done
    await tx.repo.update({
      where: { id: repoId },
      data: { archaeology_done: true },
    });
  });

  return { success: true };
}
