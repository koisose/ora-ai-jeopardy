// src/workers/sample.worker.ts

import { Worker, Queue } from 'bullmq';
import Redis from 'ioredis';
const connection = new Redis(process.env.REDIS_URL!);

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

const worker = new Worker(
  'sampleQueue', // this is the queue name, the first string parameter we provided for Queue()
   async (job:any) => {
    const data = job?.data;
    console.log(data);
    console.log('Task executed successfully');
  },
  {
    connection,
    concurrency: 5,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  }
);

export default worker;