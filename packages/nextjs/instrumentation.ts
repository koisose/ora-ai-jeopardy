
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    //@ts-ignore
    const { Worker } = await import('bullmq');
    const { generateImage } = await import('./action/create-image');
    const { encodeString } = await import('./action/encode');
    const { saveBufferToMinio } = await import('./action/minio');
    const { findAndUpdateData, saveData } = await import('./action/mongo');
    const { getAnswerNow, getAddress, getQuestion, calculateSimilarityPost } = await import('./action/eth');
    const { connection } = await import('./action/worker');
    let i = 0;
    new Worker(
      'sampleQueue', // this is the queue name, the first string parameter we provided for Queue()
      async (job: any) => {
        // console.log("dassad",job)

        if (job?.data.data.type === "create-image") {

          const where = job?.data.data.where;

          const imageBuffer = await generateImage(where);
          const id = job?.data.data.id;
          const imageUrl = await saveBufferToMinio("image", id, imageBuffer);
          await findAndUpdateData({ url: id }, { url: imageUrl }, "image")
          console.log('Task executed successfully');
        }
        if (job?.data.data.type === "refresh-question") {
          const prompt = job?.data.data.question;
          const transactionId = job?.data.data.transactionId;
          const answer = await getAnswerNow(transactionId);
          const address = await getAddress(transactionId)
          if (answer) {
            const data = await saveData({ address: address, prompt, answer, transactionId }, "quiz")
            const imageBuffer = await generateImage(`/screenshot/question/${encodeString(answer as string)}`);
            const imageUrl = await saveBufferToMinio("image", "file-" + data._id.toString(), imageBuffer);
            await findAndUpdateData({ url: "file-" + data._id.toString() }, { url: imageUrl }, "image")
          }
          console.log("refresh question")
        }
        if (job?.data.data.type === "check") {
          console.log("checking")
          try {
            const answer = await getAnswerNow(job?.data.data.transactionId);
            const address = await getAddress(job?.data.data.transactionId);
            const question = await getQuestion(job?.data.data.transactionId);
            const quiz = job?.data.data.quiz;
            const transactionId = job?.data.data.transactionId;

            if (answer && address && question) {
              const near = await calculateSimilarityPost({sentence1:answer, sentence2:(quiz as any).answer})
              if (near > 0.5) {
                const saveSolved = await findAndUpdateData({ quizId: (quiz as any)._id.toString(), address }, { transactionId, question, address, answer, similarity: near, quizId: (quiz as any)._id.toString(), solved: true }, "quiz-solved")
                const imageBuffer = await generateImage(`/screenshot/solved?quiz=${encodeURIComponent(quiz)}&question=${encodeURIComponent(question)}`);
                const imageUrl = await saveBufferToMinio("image", "file-" + saveSolved._id.toString(), imageBuffer);
                await findAndUpdateData({ url: "file-" + saveSolved._id.toString() }, { url: imageUrl }, "image")
              } else {
                await findAndUpdateData({ quizId: (quiz as any)._id.toString(), address }, { transactionId, question, address, answer, similarity: near, quizId: (quiz as any)._id.toString(), solved: false }, "quiz-solved")
                const imageBuffer = await generateImage(`/screenshot/quiz/fail/${encodeString((quiz as any).answer)}`);
                const imageUrl = await saveBufferToMinio("image", "file-" + encodeString(`/screenshot/quiz/fail/${encodeString((quiz as any).answer)}`), imageBuffer);
                await findAndUpdateData({ url: "file-" + encodeString(`/screenshot/quiz/fail/${encodeString((quiz as any).answer)}`) }, { url: imageUrl }, "image")

              }

            }
            console.log("check")
          } catch (e) {
            //@ts-ignore
            console.log("apdpapsd")
            //@ts-ignore
            console.log(e.message)
          }

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
