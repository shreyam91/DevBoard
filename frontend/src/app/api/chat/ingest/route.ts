import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@devboard/shared/src/prisma';
import { ragIngestQueue } from '@devboard/shared/src/queue';

/**
 * POST /api/chat/ingest { repoId }
 *
 * Enqueues a RAG ingestion job for the given repo. Returns immediately;
 * the actual work runs in the backend BullMQ worker. If no repos are
 * ingested yet the chat will gracefully return the refusal phrase
 * (sufficient for the initial UX — the ingestion fills in context
 * asynchronously).
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { repoId } = body;

    if (!repoId) return NextResponse.json({ error: 'repoId required' }, { status: 400 });

    const repo = await prisma.repo.findFirst({ where: { id: repoId, user_id: userId } });
    if (!repo) return NextResponse.json({ error: 'Repo not found' }, { status: 404 });

    // Create a tracking record so the UI can show ingestion status.
    const job = await prisma.ragIngestionJob.create({
      data: { repo_id: repoId, status: 'queued' },
    });

    await ragIngestQueue.add('rag-ingest', {
      repoId,
      repoFullName: repo.full_name,
      jobId: job.id,
    });

    return NextResponse.json({ ok: true, jobId: job.id });
  } catch (e: any) {
    console.error('[chat/ingest] failed:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}