
export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        //@ts-ignore
        const { Worker} = await import('bullmq');
        const { generateImage, decodeString } = await import('./action/create-image');
        const { saveBufferToMinio } = await import('./action/minio');
        const { findAndUpdateData } = await import('./action/mongo');
        const { connection } = await import('./action/worker');
        let i=0;
        new Worker(
            'sampleQueue', // this is the queue name, the first string parameter we provided for Queue()
             async (job:any) => {
                // console.log("dassad",job)
                i++
                console.log(i)
              if(job?.data.data.type==="create-image"){
                
          
                const decoded = decodeString(job?.data.data.encode);
                
                // console.log(decoded)
                const imageBuffer=await generateImage(decoded);
                // deleteFileFromMinio
                
                
                const imageUrl=await saveBufferToMinio("image",job?.data.data.encode,imageBuffer);
                await findAndUpdateData({urlHash:job?.data.data.encode},{urlHash:job?.data.encode,url:imageUrl},"image")
                console.log('Task executed successfully');
              }
              
            },
            {
              connection,
              concurrency: 1,
              removeOnComplete: { count: 1000 },
              removeOnFail: { count: 1000 },
            }
          );
    }
    
  }
