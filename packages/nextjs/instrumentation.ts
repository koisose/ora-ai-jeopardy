
export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        //@ts-ignore
        const { Worker} = await import('bullmq');
        const { generateImage } = await import('./action/create-image');
        const {  decodeString } = await import('./action/encode');
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
            
                const where = job?.data.data.where;
              
                const imageBuffer=await generateImage(where);
                const id=job?.data.data.id;               
                const imageUrl=await saveBufferToMinio("image",id,imageBuffer);
                await findAndUpdateData({url:id},{url:imageUrl},"image")
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
