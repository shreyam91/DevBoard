export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@devboard/shared/src/prisma';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  const userId = session.user.id;

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  // Write headers for SSE
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache, no-transform',
  };

  // We keep a simple polling interval in the background to check for DB changes.
  // Real SSE with Prisma would require Prisma Pulse, so we simulate it by checking last_activity_at.
  let isClosed = false;

  req.signal.addEventListener('abort', () => {
    isClosed = true;
    writer.close();
  });

  const run = async () => {
    let lastCheck = new Date();
    
    // Send initial connection event
    await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`));

    while (!isClosed) {
      try {
        // Find if any repo has been updated since our last check
        const updatedRepos = await prisma.repo.findMany({
          where: {
            user_id: userId,
            last_activity_at: { gt: lastCheck }
          }
        });

        if (updatedRepos.length > 0) {
          lastCheck = new Date(); // update high watermark
          for (const repo of updatedRepos) {
            const data = JSON.stringify({ type: 'repo_updated', repo });
            await writer.write(encoder.encode(`data: ${data}\n\n`));
          }
        }
      } catch (err) {
        console.error('SSE Error:', err);
      }

      // Wait 3 seconds before polling DB again
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  };

  run();

  return new NextResponse(responseStream.readable, { headers });
}
