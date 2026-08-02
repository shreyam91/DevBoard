import { getGithubToken } from '@devboard/shared/src/utils/auth';
import { createWorker, QUEUES } from '@devboard/shared/src/queue';
import { processArchaeologyJob } from './archaeologyWorker';
import { processPrAnalysisJob } from './prAnalysisWorker';
import { processArchitectureUpdateJob } from './architectureWorker';
import { processScoreCalculationJob } from './scoreWorker';
import { processRepoSyncJob } from './repoSyncWorker';

// console.log('Starting BullMQ workers...');

// Legacy Jobs Worker
const jobsWorker = createWorker(QUEUES.DEVBOARD_JOBS, async (job) => {
  if (job.name === 'archaeology') {
    await processArchaeologyJob(job);
  }
});

// PR Analysis Worker
const prAnalysisWorker = createWorker(QUEUES.PR_ANALYSIS, async (job) => {
  if (job.name === 'pr-analysis') {
    await processPrAnalysisJob(job);
  }
});

// Architecture Update Worker
const architectureUpdateWorker = createWorker(QUEUES.ARCHITECTURE_UPDATE, async (job) => {
  if (job.name === 'architecture-update') {
    await processArchitectureUpdateJob(job);
  }
});

// Architecture Score Worker
const architectureScoreWorker = createWorker(QUEUES.ARCHITECTURE_SCORE, async (job) => {
  if (job.name === 'architecture-score') {
    await processScoreCalculationJob(job);
  }
});

// Repo Sync Worker
const repoSyncWorker = createWorker(QUEUES.REPO_SYNC, async (job) => {
  if (job.name === 'repo-sync') {
    await processRepoSyncJob(job);
  }
});

// Schedule the recurring repo sync job (daily at midnight)
import { repoSyncQueue } from '@devboard/shared/src/queue';
(async () => {
  try {
    await repoSyncQueue.add('repo-sync', {}, {
      repeat: { pattern: '0 0 * * *' },
      jobId: 'daily-repo-sync' // Ensure only one recurring job exists
    });
    // console.log('Scheduled daily repo sync job.');
  } catch (err) {
    // console.error('Failed to schedule daily repo sync job:', err);
  }
})();

// Common error handling
[jobsWorker, prAnalysisWorker, architectureUpdateWorker, architectureScoreWorker, repoSyncWorker].forEach(worker => {
  worker.on('completed', (job) => {
    // console.log(`Job ${job.id} of type ${job.name} completed successfully.`);
  });

  worker.on('failed', (job, err) => {
    // console.error(`Job ${job?.id} of type ${job?.name} failed:`, err);
  });
});

// console.log('Background workers listening on multiple queues');
