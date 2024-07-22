// src/workers/sample.worker.ts

import { Worker, Queue } from 'bullmq';
import {generateImage,decodeString} from './create-image'
import {saveBufferToMinio} from './minio'
import {findAndUpdateData} from './mongo'
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
    if(job?.data.type==="create-image"){
      const decoded = decodeString(job?.data.encode);
      const imageBuffer=await generateImage(decoded);
      const imageUrl=await saveBufferToMinio("image",job?.data.encode,imageBuffer);
      await findAndUpdateData({urlHash:job?.data.encode},{urlHash:job?.data.encode,url:imageUrl},"image")
      console.log('Task executed successfully');
    }
    
  },
  {
    connection,
    concurrency: 1,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  }
);

export default worker;