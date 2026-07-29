import { NextResponse } from 'next/server';
import { prisma } from '@devboard/shared/src/prisma';
import crypto from 'crypto';

export async function GET() {
  try {
    const repoId = 'cms4a11gt0002kpxxto13pu1a'; // Existing repo
    
    // find a repo to test
    const repo = await prisma.repo.findFirst();
    if (!repo) return NextResponse.json({ error: 'No repo' });
    
    await prisma.$transaction(async (tx) => {
      const decision = await tx.decision.create({
        data: {
          repo_id: repo.id,
          title: "Test",
          rationale: "Test",
          category: "architecture",
          source: "manual",
          confirmed_by_user: false,
        }
      });
      const embeddingId = crypto.randomUUID();
      // fake vector of length 1536
      const vector = Array.from({length: 1536}, () => 0.1);
      const embeddingString = `[${vector.join(',')}]`;
      await tx.$executeRaw`
        INSERT INTO decision_embeddings (id, decision_id, vector)
        VALUES (
          ${embeddingId},
          ${decision.id},
          ${embeddingString}::vector
        )
      `;
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, meta: error.meta, cause: error.cause }, { status: 500 });
  }
}
