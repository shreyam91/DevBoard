import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { jobsQueue } from '@/lib/queue';

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-hub-signature-256');
    const secret = process.env.GITHUB_WEBHOOK_SECRET;

    if (!secret) {
      console.error('GITHUB_WEBHOOK_SECRET is not configured');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const bodyText = await req.text();

    if (signature) {
      const hmac = crypto.createHmac('sha256', secret);
      const digest = 'sha256=' + hmac.update(bodyText).digest('hex');
      if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest)) === false) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    } else {
      // In a strict production environment you would reject requests without a signature.
      // But for local testing, we might allow it if we want. For security, we reject here.
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const payload = JSON.parse(bodyText);
    const event = req.headers.get('x-github-event');

    if (event === 'pull_request') {
      const { action, pull_request, repository } = payload;
      
      // We only care about merged PRs for architecture evaluation
      if (action === 'closed' && pull_request.merged === true) {
        
        // Ensure this is a repo we know about
        const repo = await prisma.repo.findUnique({
          where: { github_repo_id: repository.id.toString() }
        });

        if (repo) {
          // Enqueue job to analyze the PR
          await jobsQueue.add('pr-analysis', {
            repoId: repo.id,
            repoFullName: repository.full_name,
            prNumber: pull_request.number,
            prTitle: pull_request.title,
            prUrl: pull_request.html_url,
            diffUrl: pull_request.diff_url,
          }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 }
          });
          
          return NextResponse.json({ success: true, message: 'PR analysis job enqueued' });
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Event ignored' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
