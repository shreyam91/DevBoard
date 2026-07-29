import { createWorker, QUEUES } from '@devboard/shared/src/queue';
import { processArchaeologyJob } from './archaeologyWorker';
import { processPrAnalysisJob } from './prAnalysisWorker';
import { processArchitectureUpdateJob } from './architectureWorker';
import { processScoreCalculationJob } from './scoreWorker';
import { processSemanticSearchJob } from './semanticSearchWorker';

console.log('Starting BullMQ workers...');

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

// Semantic Search Worker (Using Embedding Queue)
const semanticSearchWorker = createWorker(QUEUES.EMBEDDING_GENERATION, async (job) => {
  if (job.name === 'semantic-search-index') {
    await processSemanticSearchJob(job);
  }
});

// Common error handling
[jobsWorker, prAnalysisWorker, architectureUpdateWorker, architectureScoreWorker, semanticSearchWorker].forEach(worker => {
  worker.on('completed', (job) => {
    console.log(`Job ${job.id} of type ${job.name} completed successfully.`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} of type ${job?.name} failed:`, err);
  });
});

console.log('Background workers listening on multiple queues');
