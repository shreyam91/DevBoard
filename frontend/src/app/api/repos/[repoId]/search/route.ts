import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@devboard/shared/src/prisma';
import { EmbeddingService } from '@/services/embeddingService';

export async function POST(
  req: NextRequest,
  { params }: { params: { repoId: string } }
) {
  try {
    const { query, filters, limit = 20 } = await req.json();
    const { repoId } = params;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Generate query embedding
    const queryEmbedding = await EmbeddingService.generateEmbedding(query);
    const vectorString = `[${queryEmbedding.join(',')}]`;

    // Perform vector search
    // Using raw SQL because prisma doesn't natively support <=> operator in standard query builder yet without typing tricks
    const results: any = await prisma.$queryRawUnsafe(`
      SELECT 
        id, type, title, content, path, url, metadata, created_at,
        1 - (embedding <=> $1::vector) as similarity
      FROM documents
      WHERE repo_id = $2
        ${filters?.type ? `AND type = '${filters.type}'` : ''}
      ORDER BY embedding <=> $1::vector
      LIMIT $3
    `, vectorString, repoId, limit);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
