import { Queue, Worker, QueueEvents, type Processor, type WorkerOptions } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Create a shared Redis connection
export const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

// Define queue names
export const QUEUES = {
  DEVBOARD_JOBS: 'devboard-jobs', // Legacy
  WEBHOOK_PROCESSING: 'webhook-processing',
  PR_ANALYSIS: 'pr-analysis',
  EMBEDDING_GENERATION: 'embedding-generation',
  ARCHITECTURE_UPDATE: 'architecture-update',
  GITHUB_COMMIT: 'github-commit',
  CONFLICT_ANALYSIS: 'conflict-analysis',
  ARCHITECTURE_SCORE: 'architecture-score',
};

// Instantiate queues
// @ts-expect-error ioredis version mismatch with bullmq
export const jobsQueue = new Queue(QUEUES.DEVBOARD_JOBS, { connection });
// @ts-expect-error
export const webhookQueue = new Queue(QUEUES.WEBHOOK_PROCESSING, { connection });
// @ts-expect-error
export const prAnalysisQueue = new Queue(QUEUES.PR_ANALYSIS, { connection });
// @ts-expect-error
export const embeddingQueue = new Queue(QUEUES.EMBEDDING_GENERATION, { connection });
// @ts-expect-error
export const architectureUpdateQueue = new Queue(QUEUES.ARCHITECTURE_UPDATE, { connection });
// @ts-expect-error
export const githubCommitQueue = new Queue(QUEUES.GITHUB_COMMIT, { connection });
// @ts-expect-error
export const conflictAnalysisQueue = new Queue(QUEUES.CONFLICT_ANALYSIS, { connection });
// @ts-expect-error
export const architectureScoreQueue = new Queue(QUEUES.ARCHITECTURE_SCORE, { connection });

// Helper to create a worker
export function createWorker(queueName: string, processor: Processor, options?: Omit<WorkerOptions, 'connection'>) {
  // @ts-expect-error ioredis version mismatch with bullmq
  return new Worker(queueName, processor, { connection, ...options });
}

// Queue events for monitoring
// @ts-expect-error
export const jobsQueueEvents = new QueueEvents(QUEUES.DEVBOARD_JOBS, { connection });
// @ts-expect-error
export const webhookQueueEvents = new QueueEvents(QUEUES.WEBHOOK_PROCESSING, { connection });
// @ts-expect-error
export const prAnalysisQueueEvents = new QueueEvents(QUEUES.PR_ANALYSIS, { connection });

