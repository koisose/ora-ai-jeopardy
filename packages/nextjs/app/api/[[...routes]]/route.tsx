/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'

import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'

import { getTableSize, getDataByColumnNamePaginated, getDataByQuery, getDataById, saveData } from '~~/action/mongo'
import { generateOgImage } from '~~/action/create-image'
import { encodeString, decodeString } from '~~/action/encode'
import { estimateFee, convertBigIntToEther, getAnswerNow, getAddress,calculateSimilarity,getQuestion } from '~~/action/eth'
import { abi } from '~~/abi/abi'
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { parseEther } from 'viem'
const client = new NeynarAPIClient(process.env.NEYNAR as string);
//@ts-ignore
const app = new Frog({
  imageAspectRatio: '1:1',
  title: 'ORA AI Jeopardy',
  //@ts-ignore
  assetsPath: '/',
  //@ts-ignore
  basePath: '/api',
  initialState: {
    count: 0,
    question: ""
  },

})
function processingImage() {
  return (
    <div style={{ color: 'white', backgroundColor: 'purple', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', height: '100vh', fontSize: 60 }}>
      Please wait we're still processing the image
    </div>
  )
}
function pleaseWait() {
  return (
    <div
    style={{
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fff',
      fontSize: 32,
      fontWeight: 600,
    }}
  >
    <svg
      width="75"
      viewBox="0 0 75 65"
      fill="#000"
      style={{ margin: '0 75px' }}
    >
      <path d="M37.59.25l36.95 64H.64l36.95-64z"></path>
    </svg>
    <div style={{ marginTop: 40 }}>Please wait, still processing</div>
  </div>
  
  )
}
app.frame('/', async (c) => {
  const imageUrl = await generateOgImage("/screenshot/title", encodeString("/screenshot/title"));
  const unixTimestamp = Math.floor(Date.now() / 1000);
  const processing = processingImage();
  return c.res({
    image: imageUrl.trim().length === 0 ? processing : `${process.env.MINIO_URL}/image/${imageUrl}?t=${unixTimestamp}` as any,
    intents: [
      <Button action="/play">
        Play
      </Button>,
      <Button action="/quiz">Create</Button>
    ]
  })
})
app.frame('/share/:id', async (c) => {
const {req}=c
//@ts-ignore
const fid = c.frameData.fid;
//   //@ts-ignore
const userData = await client.lookupUserByFid(fid);
//@ts-ignore
let verifiedAddresses = userData.result.user.verifiedAddresses.eth_addresses
let addresses = verifiedAddresses.concat(userData.result.user.custodyAddress);
  const getQuizPaginated = await getDataById("quiz", req.param("id"))
  const getQuizSolved = await getDataByQuery("quiz-solved", { address: { $in: addresses }, quizId: getQuizPaginated._id.toString() })
  const getQuizHash = await getDataByQuery("quiz-hash", { address: { $in: addresses }, quizId: getQuizPaginated._id.toString() })
  const what = getQuizSolved.length > 0 ? {
    aiAnswer: getQuizSolved[0].answer,
    quiz: getQuizPaginated.answer,
    question: getQuizHash[0].prompt
  } : null;

  const imageUrl = getQuizSolved.length > 0 ? await generateOgImage(`/screenshot/solved/${encodeString(JSON.stringify(what))}`, getQuizSolved[0]._id.toString()) : await generateOgImage(`/screenshot/question/${encodeString(getQuizPaginated.answer)}`, getQuizPaginated._id.toString());
  const unixTimestamp = Math.floor(Date.now() / 1000);
  const processing = processingImage();
  let intents = getQuizSolved.length > 0 ? [
    <Button action="/play" >Next</Button>,
    <Button action="/">Home</Button>,
    <Button.Redirect location="https://google.com">Share</Button.Redirect>

  ] : [
    <TextInput placeholder="Input your question" />,
    <Button.Transaction target="/ask">Ask</Button.Transaction>,
    <Button action="/play" >Next</Button>,
    <Button action="/">Home</Button>,
    <Button.Redirect location="https://google.com">Share</Button.Redirect>,
  ];
  return c.res({
    action:`/solved/${getQuizPaginated._id.toString()}`,
    image: imageUrl.trim().length === 0 ? processing : `${process.env.MINIO_URL}/image/${imageUrl}?t=${unixTimestamp}` as any,
    intents,
  })
})
app.frame('/quiz', async (c) => {
  const imageUrl = await generateOgImage("/screenshot/quiz", encodeString("/screenshot/quiz"));
  const unixTimestamp = Math.floor(Date.now() / 1000);
  const processing = processingImage();
  return c.res({
    image: imageUrl.trim().length === 0 ? processing : `${process.env.MINIO_URL}/image/${imageUrl}?t=${unixTimestamp}` as any,
    intents: [
      <TextInput placeholder="Input your question" />,
      <Button action="/quiz-sure">Create</Button>,
      <Button action="/">Home</Button>
    ]
  })
})
app.frame('/quiz-sure', async (c) => {
  const { inputText } = c

  const imageUrl = inputText?.trim().length === 0 ? await generateOgImage("/screenshot/quiz", encodeString("/screenshot/quiz")) : await generateOgImage(`/screenshot/quiz/${encodeString(inputText as string)}`, encodeString(`/screenshot/quiz/${encodeString(inputText as string)}`));
  const unixTimestamp = Math.floor(Date.now() / 1000);
  const processing = processingImage();
  const question=encodeString(JSON.stringify({"instruction":"you're a jeopardy quiz generator, you will only answer without revealing the real answer for example i will ask 'who is vitalik?' you will answer 'he is the founder of ethereum'","input":inputText}))
  let intents = inputText?.trim().length === 0 ? [
    <TextInput placeholder="Input your question" />,
    <Button action="/quiz-sure">Create</Button>,
    <Button action="/">Home</Button>
  ] : [

    <Button.Transaction target={`/ask-question/${question}`} >Yes</Button.Transaction>,
    <Button action="/quiz">No</Button>
  ];
  return c.res({
    action: `/finish/${question}`,
    image: imageUrl.trim().length === 0 ? processing : `${process.env.MINIO_URL}/image/${imageUrl}?t=${unixTimestamp}` as any,
    intents
  })
})
app.transaction('/ask-question/:question', async (c) => {
  // Contract transaction response.
  const { req } = c

  const est = await estimateFee();
  return c.contract({
    abi,
    chainId: 'eip155:11155420',
    functionName: 'calculateAIResult',
    args: [11, decodeString(req.param("question"))],
    to: process.env.NEXT_PUBLIC_OAO_PROMPT as any,
    value: parseEther(convertBigIntToEther(est))
  })
})
app.frame('/finish/:question', (c) => {
  const { transactionId, req } = c
  const question = req.param("question")
  return c.res({
    image: (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
          fontSize: 32,
          fontWeight: 600,
        }}
      >
        <svg
          width="75"
          viewBox="0 0 75 65"
          fill="#000"
          style={{ margin: '0 75px' }}
        >
          <path d="M37.59.25l36.95 64H.64l36.95-64z"></path>
        </svg>
        <div style={{ marginTop: 40 }}>Please wait while ORA AI</div>
        <div>processing your transaction</div>
        <div>click refresh button to see the result</div>
      </div>

    ),
    intents: [<Button action={`/refresh/${question}`} value={transactionId}>Refresh</Button>]
  })
})
app.frame('/refresh/:question', async (c) => {
  const { buttonValue, req } = c
  const question = decodeString(req.param("question"));
  const processing = processingImage();
  try{
    const answer = await getAnswerNow(buttonValue as string);
    const address = await getAddress(buttonValue as string)
    let imageUrl = "";
    const unixTimestamp = Math.floor(Date.now() / 1000);
    
    let id=""
    if (answer) {
      const data = await saveData({ address: address, prompt: JSON.parse(question).input, answer }, "quiz")
      imageUrl = await generateOgImage(`/screenshot/question/${encodeString(answer as string)}`, data._id.toString());
      id=data._id.toString();
    }
    
    return c.res({
      image: answer ? imageUrl.trim().length === 0 ? processing : `${process.env.MINIO_URL}/image/${imageUrl}?t=${unixTimestamp}` as any : (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            fontSize: 32,
            fontWeight: 600,
          }}
        >
          <svg
            width="75"
            viewBox="0 0 75 65"
            fill="#000"
            style={{ margin: '0 75px' }}
          >
            <path d="M37.59.25l36.95 64H.64l36.95-64z"></path>
          </svg>
          <div style={{ marginTop: 40 }}>Please wait while ORA AI</div>
          <div>processing your transaction</div>
          <div>click refresh button to see the result</div>
        </div>
  
      ),
      intents: answer ? [<Button action="/">Home</Button>,
      <Button.Redirect location={`https://warpcast.com/~/compose?text=Solve%20This!&embeds[]=${process.env.SCREENSHOT_URL}/api/share/${id}`}>Share</Button.Redirect>,] : [<Button action="/refresh" value={buttonValue}>Refresh</Button>]
    })
  }catch{
    return c.res({
      image: (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            fontSize: 32,
            fontWeight: 600,
          }}
        >
          <svg
            width="75"
            viewBox="0 0 75 65"
            fill="#000"
            style={{ margin: '0 75px' }}
          >
            <path d="M37.59.25l36.95 64H.64l36.95-64z"></path>
          </svg>
          <div style={{ marginTop: 40 }}>Please wait while ORA AI</div>
          <div>processing your transaction</div>
          <div>click refresh button to see the result</div>
        </div>
  
      ),
      intents: [<Button action="/refresh" value={buttonValue}>Refresh</Button>]
    })
  }
  
})
app.frame('/play', async (c) => {

  const { deriveState, previousState } = c

  //@ts-ignore
  const fid = c.frameData.fid;
  //   //@ts-ignore
  const userData = await client.lookupUserByFid(fid);
  //@ts-ignore
  let verifiedAddresses = userData.result.user.verifiedAddresses.eth_addresses
  let addresses = verifiedAddresses.concat(userData.result.user.custodyAddress);
  const totalQuizSize = await getTableSize("quiz");
  // const allQuiz = await getData("quiz")

  // console.log(state)
  //@ts-ignore
  deriveState(previousState => {
    //@ts-ignore
    if (previousState.count != totalQuizSize - 1) {
      //@ts-ignore
      previousState.count++
    } else {
      //@ts-ignore
      previousState.count = 0
    }
  })

  //@ts-ignore
  const getQuizPaginated = await getDataByColumnNamePaginated("quiz", {}, previousState.count + 1, 1)
  const getQuizSolved = await getDataByQuery("quiz-solved", { address: { $in: addresses }, quizId: getQuizPaginated[0]._id.toString() })
  const getQuizHash = await getDataByQuery("quiz-hash", { address: { $in: addresses }, quizId: getQuizPaginated[0]._id.toString() })
  const what = getQuizSolved.length > 0 ? {
    aiAnswer: getQuizSolved[0].answer,
    quiz: getQuizPaginated[0].answer,
    question: getQuizHash[0].prompt
  } : null;

  const imageUrl = getQuizSolved.length > 0 ? await generateOgImage(`/screenshot/solved/${encodeString(JSON.stringify(what))}`, getQuizSolved[0]._id.toString()) : await generateOgImage(`/screenshot/question/${encodeString(getQuizPaginated[0].answer)}`, getQuizPaginated[0]._id);
  const unixTimestamp = Math.floor(Date.now() / 1000);
  const processing = processingImage();
  let intents = getQuizSolved.length > 0 ? [
    <Button action="/play" >Next</Button>,
    <Button action="/">Home</Button>,
    <Button.Redirect location="https://google.com">Share</Button.Redirect>

  ] : [
    <TextInput placeholder="Input your question" />,
    <Button.Transaction target="/ask">Ask</Button.Transaction>,
    <Button action="/play" >Next</Button>,
    <Button action="/">Home</Button>,
    <Button.Redirect location="https://google.com">Share</Button.Redirect>,
  ];
  return c.res({
    action:`/solved/${getQuizPaginated[0]._id.toString()}`,
    image: imageUrl.trim().length === 0 ? processing : `${process.env.MINIO_URL}/image/${imageUrl}?t=${unixTimestamp}` as any,
    intents,
  })
})
app.transaction('/ask', async (c) => {
  // Contract transaction response.
  const { inputText } = c

  const est = await estimateFee();
  return c.contract({
    abi,
    chainId: 'eip155:11155420',
    functionName: 'calculateAIResult',
    args: [11, inputText],
    to: process.env.NEXT_PUBLIC_OAO_PROMPT as any,
    value: parseEther(convertBigIntToEther(est))
  })
})
app.frame('/solved/:id', async(c) => {
  const { transactionId, buttonValue,req  } = c
  const pleaseWaitImg=pleaseWait()
  const processing=processingImage()
  try{
    const answer = await getAnswerNow(transactionId || buttonValue as string);
    const address = await getAddress(transactionId || buttonValue as string);
    const question = await getQuestion(transactionId || buttonValue as string);
    const unixTimestamp = Math.floor(Date.now() / 1000);
    const quiz=await getDataById("quiz",req.param("id"))
    
    if (answer && address && question) {
      const near = await calculateSimilarity([answer, (quiz as any).answer])
    if(near > 0.5){
      const what = {
        aiAnswer: answer,
        quiz: (quiz as any).answer,
        question
      };
      const saveSolved=await saveData({ question, address, answer, similarity: near, quizId: (quiz as any)._id.toString() }, "quiz-solved")
      const imageUrl = await generateOgImage(`/screenshot/solved/${encodeString(JSON.stringify(what))}`, saveSolved._id.toString());
      return c.res({
        image: imageUrl.trim().length === 0 ? processing : `${process.env.MINIO_URL}/image/${imageUrl}?t=${unixTimestamp}` as any,
        intents: [<Button action="/play" >Next</Button>,
          <Button action="/">Home</Button>]
      })
    }else{
      const imageUrl =  await generateOgImage(`/screenshot/quiz/fail/${encodeString((quiz as any).answer)}`, encodeString(`/screenshot/quiz/fail/${encodeString((quiz as any).answer)}`))
      return c.res({
        image: imageUrl.trim().length === 0 ? processing : `${process.env.MINIO_URL}/image/${imageUrl}?t=${unixTimestamp}` as any,
        intents: [<TextInput placeholder="Input your question" />,
          <Button.Transaction target="/ask">Ask</Button.Transaction>,
          <Button action="/play" >Next</Button>,
          <Button action="/">Home</Button>,
          <Button.Redirect location="https://google.com">Share</Button.Redirect>]
      })
    }
       
    }else{
      return c.res({
        image: pleaseWaitImg,
        intents: [<Button action={`/solved/${quiz._id.toString()}`} value={transactionId || buttonValue}>Refresh</Button>]
      })
    }
  }catch{
    return c.res({
      image: pleaseWaitImg,
      intents: [<Button action={`/solved/${req.param("id")}`} value={transactionId || buttonValue}>Refresh</Button>]
    })
  }
  
  
})


devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
