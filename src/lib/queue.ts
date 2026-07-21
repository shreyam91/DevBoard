import { Queue, Worker, QueueEvents, type Processor } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Create a shared Redis connection
export const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

export const queueName = 'devboard-jobs';

// Instantiate the queue
// @ts-expect-error ioredis version mismatch with bullmq
export const jobsQueue = new Queue(queueName, { connection });

// Helper to create a worker
export function createWorker(processor: Processor) {
  // @ts-expect-error ioredis version mismatch with bullmq
  return new Worker(queueName, processor, { connection });
}

// Queue events for monitoring
// @ts-expect-error ioredis version mismatch with bullmq
export const queueEvents = new QueueEvents(queueName, { connection });
