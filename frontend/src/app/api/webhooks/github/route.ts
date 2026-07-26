import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@devboard/shared/src/prisma';
import { prAnalysisQueue } from '@devboard/shared/src/queue';

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
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const payload = JSON.parse(bodyText);
    const event = req.headers.get('x-github-event');

    // Create a generic webhook event record
    const webhookEvent = await prisma.webhookEvent.create({
      data: {
        payload,
        processed: false
      }
    });

    if (event === 'pull_request') {
      const { action, pull_request, repository } = payload;
      
      // Update repo_id in webhookEvent if we can
      const repo = await prisma.repo.findUnique({
        where: { github_repo_id: repository.id.toString() }
      });

      if (repo) {
        await prisma.webhookEvent.update({
          where: { id: webhookEvent.id },
          data: { repo_id: repo.id }
        });

        // We only care about merged PRs for architecture evaluation
        if (action === 'closed' && pull_request.merged === true) {
          // Prevent duplicates
          const existingPr = await prisma.pullRequest.findFirst({
            where: { repo_id: repo.id, pr_number: pull_request.number }
          });

          if (!existingPr) {
            // Save PR
            await prisma.pullRequest.create({
              data: {
                repo_id: repo.id,
                pr_number: pull_request.number,
                title: pull_request.title,
                description: pull_request.body || '',
                url: pull_request.html_url,
                author: pull_request.user.login,
                merged_at: new Date(pull_request.merged_at || Date.now())
              }
            });

            // Create an AnalysisJob
            const analysisJob = await prisma.analysisJob.create({
              data: {
                repo_id: repo.id,
                pr_number: pull_request.number,
                status: 'queued'
              }
            });

            // Enqueue job to analyze the PR
            await prAnalysisQueue.add('pr-analysis', {
              repoId: repo.id,
              repoFullName: repository.full_name,
              prNumber: pull_request.number,
              prTitle: pull_request.title,
              prUrl: pull_request.html_url,
              diffUrl: pull_request.diff_url,
              jobId: analysisJob.id
            }, {
              attempts: 3,
              backoff: { type: 'exponential', delay: 1000 }
            });

            await prisma.webhookEvent.update({
              where: { id: webhookEvent.id },
              data: { processed: true }
            });
            
            return NextResponse.json({ success: true, message: 'PR analysis job enqueued' });
          } else {
             return NextResponse.json({ success: true, message: 'PR already processed' });
          }
        }
      }
    }

    if (event === 'push') {
      const { ref, repository, head_commit, commits } = payload;
      
      const repo = await prisma.repo.findUnique({
        where: { github_repo_id: repository.id.toString() }
      });

      if (repo) {
        // Only process pushes to the default branch
        const defaultBranchRef = `refs/heads/${repo.default_branch || 'main'}`;
        
        if (ref === defaultBranchRef && head_commit) {
          await prisma.repo.update({
            where: { id: repo.id },
            data: {
              last_commit_sha: head_commit.id,
              last_commit_message: head_commit.message,
              last_activity_at: new Date(head_commit.timestamp),
              commit_count: { increment: commits ? commits.length : 1 }
            }
          });

          await prisma.webhookEvent.update({
            where: { id: webhookEvent.id },
            data: { repo_id: repo.id, processed: true }
          });
          
          return NextResponse.json({ success: true, message: 'Push event processed and repo updated' });
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Event ignored' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
