import { Queue } from "quirrel/next-app"
import { generateImage } from '~~/action/create-image';
import { encodeString } from '~~/action/encode';
import { saveBufferToMinio } from '~~/action/minio';
import { findAndUpdateData, saveData } from '~~/action/mongo';
import { getAnswerNow, getAddress, getQuestion, calculateSimilarityPost } from '~~/action/eth';
export const emailQueue = Queue(
    "api/queue", // 👈 the route it's reachable on
    async job => {
        //@ts-ignore
        if (job.data.type === "create-image") {
            //@ts-ignore
            const where = job.data.where;

            const imageBuffer = await generateImage(where);
            //@ts-ignore
            const id = job.data.id;
            const imageUrl = await saveBufferToMinio("image", id, imageBuffer);
            await findAndUpdateData({ url: id }, { url: imageUrl }, "image")
            console.log('Task executed successfully');
        }
        //@ts-ignore
        if (job.data.type === "refresh-question") {
            //@ts-ignore
            const prompt = job.data.question;
            //@ts-ignore
            const transactionId = job.data.transactionId;
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
        //@ts-ignore
        if (job.data.type === "check") {
            console.log("checking")
            try {
                //@ts-ignore
                const answer = await getAnswerNow(job.data.transactionId);
                //@ts-ignore
                const address = await getAddress(job.data.transactionId);
                //@ts-ignore
                const question = await getQuestion(job.data.transactionId);
                //@ts-ignore
                const quiz = job.data.quiz;
                //@ts-ignore
                const transactionId = job.data.transactionId;

                if (answer && address && question) {
                    const near = await calculateSimilarityPost({ sentence1: answer, sentence2: (quiz as any).answer })
                    if (near > 0.5) {
                        const saveSolved = await findAndUpdateData({ quizId: (quiz as any)._id.toString(), address }, { transactionId, question, address, answer, similarity: near, quizId: (quiz as any)._id.toString(), solved: true }, "quiz-solved")
                        const imageBuffer = await generateImage(`/screenshot/solved?quiz=${encodeURIComponent((quiz as any).answer)}&question=${encodeURIComponent(question)}`);
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
    }
)

export const POST = emailQueue