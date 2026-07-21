import { createWorker } from '../lib/queue';
import { processArchaeologyJob } from './archaeologyWorker';
import { processPrAnalysisJob } from './prAnalysisWorker';

console.log('Starting BullMQ workers...');

const backgroundWorker = createWorker(async (job) => {
  if (job.name === 'archaeology') {
    await processArchaeologyJob(job);
  } else if (job.name === 'pr-analysis') {
    await processPrAnalysisJob(job);
  }
});

// Configure retries/backoff directly on the worker creation if needed, 
// though typically it's configured when adding the job. 
// We rely on the enqueue side to specify { attempts: 3, backoff: { type: 'exponential', delay: 1000 } }

backgroundWorker.on('completed', (job) => {
  console.log(`Job ${job.id} of type ${job.name} completed successfully.`);
});

backgroundWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} of type ${job?.name} failed:`, err);
});

console.log('Background worker listening on queue: devboard-jobs');
