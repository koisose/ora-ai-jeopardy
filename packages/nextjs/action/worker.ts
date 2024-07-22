// src/workers/sample.worker.ts

import {  Queue } from 'bullmq';

import Redis from 'ioredis';
export const connection = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null
});

export const sampleQueue = new Queue('sampleQueue', {
    connection,
    defaultJobOptions: {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    },
  });



