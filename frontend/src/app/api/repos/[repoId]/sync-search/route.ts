import { NextRequest, NextResponse } from 'next/server';
import { embeddingQueue } from '@devboard/shared/src/queue';

export async function POST(
  req: NextRequest,
  { params }: { params: { repoId: string } }
) {
  try {
    const { repoId } = params;

    // Add job to queue
    await embeddingQueue.add('semantic-search-index', {
      repoId,
    });

    return NextResponse.json({ success: true, message: 'Semantic Search sync started in background' });
  } catch (error) {
    console.error('Failed to trigger semantic search sync:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
