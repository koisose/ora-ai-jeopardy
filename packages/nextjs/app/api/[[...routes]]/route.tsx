/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'

import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'

import { getTableSize, getDataByColumnNamePaginated, getDataByQuery, getDataById } from '~~/action/mongo'
import { generateOgImage, generateImage,getSession } from '~~/action/create-image'
import { encodeString, decodeString } from '~~/action/encode'
import { sampleQueue } from '~~/action/worker';
import { estimateFee, convertBigIntToEther } from '~~/action/eth'
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
    image: !imageUrl.includes("file") ? imageUrl.trim().length === 0 ? processing : imageUrl : `${process.env.MINIO_URL}/image/${imageUrl}?t=${unixTimestamp}` as any,
    intents: [
      <Button action="/play">
        Play
      </Button>,
      <Button action="/quiz">Create</Button>
    ]
  })
})
app.hono.get('/img/:id', async (c) => {
  const { req } = c
  const url = decodeString(req.param("id"))
  const imageBuffer = await generateImage(url)
  return new Response(imageBuffer, {
    headers: {
      'Content-Type': 'image/png'
    }
  })
})
app.hono.get('/panda',async (c)=>{
  const imageBuffer = await generateImage("/screenshot/title")
  return new Response(imageBuffer, {
    headers: {
      'Content-Type': 'image/png'
    }
  })
})
app.frame('/share/:id', async (c) => {
  const { req } = c

  let intents = [
    <Button action={`/share/${req.param("id")}`} >Play</Button>,

  ];
  let addresses = [];
  //@ts-ignore
  if (c?.frameData?.fid) {
    //@ts-ignore
    const fid = c.frameData.fid;
    //   //@ts-ignore
    const userData = await client.lookupUserByFid(fid);
    //@ts-ignore
    let verifiedAddresses = userData.result.user.verifiedAddresses.eth_addresses
    addresses = verifiedAddresses.concat(userData.result.user.custodyAddress);
    intents = [
      <TextInput placeholder="Input your question" />,
      <Button.Transaction target="/ask">Ask</Button.Transaction>,
      <Button action="/play" >Next</Button>,
      <Button action="/">Home</Button>,
      <Button.Link href={`https://warpcast.com/~/compose?text=Try%20To%20Solve%20This!&embeds[]=${process.env.SCREENSHOT_URL}/api/share/${req.param("id")}`}>Share</Button.Link>,
    ]
  }

  const getQuizPaginated = await getDataById("quiz", req.param("id"))
  const getQuizSolved = await getDataByQuery("quiz-solved", { address: { $in: addresses }, quizId: getQuizPaginated._id.toString() })
  

  const imageUrl = getQuizSolved.length > 0 ? await generateOgImage(`/screenshot/solved?quiz=${encodeURIComponent(getQuizPaginated.answer)}&question=${encodeURIComponent(getQuizSolved[0].question)}`, getQuizSolved[0]._id.toString()) : await generateOgImage(`/screenshot/question/${encodeString(getQuizPaginated.answer)}`, getQuizPaginated._id.toString());
  const unixTimestamp = Math.floor(Date.now() / 1000);
  const processing = processingImage();
  if (getQuizSolved.length > 0 || addresses.some((a: any) => a === getQuizPaginated.address)) {
    intents = [
      <Button action="/play" >Next</Button>,
      <Button action="/">Home</Button>,
      <Button.Link href={`https://warpcast.com/~/compose?text=Try%20To%20Solve%20This!&embeds[]=${process.env.SCREENSHOT_URL}/api/share/${getQuizPaginated._id.toString()}`}>Share</Button.Link>,
    ]
  }
  return c.res({
    action: `/solved/${getQuizPaginated._id.toString()}`,
    image: !imageUrl.includes("file") ? imageUrl.trim().length === 0 ? processing : imageUrl : `${process.env.MINIO_URL}/image/${imageUrl}?t=${unixTimestamp}` as any,
    intents,
  })
})
app.frame('/quiz', async (c) => {
  const imageUrl = await generateOgImage("/screenshot/quiz", encodeString("/screenshot/quiz"));
  const unixTimestamp = Math.floor(Date.now() / 1000);
  const processing = processingImage();
  return c.res({
    image: !imageUrl.includes("file") ? imageUrl.trim().length === 0 ? processing : imageUrl : `${process.env.MINIO_URL}/image/${imageUrl}?t=${unixTimestamp}` as any,
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
  const question = encodeString(JSON.stringify({ "instruction": "you're a jeopardy quiz generator, you will only answer without revealing the real answer for example i will ask 'who is vitalik?' you will answer 'he is the founder of ethereum'", "input": inputText }))
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
    image: !imageUrl.includes("file") ? imageUrl.trim().length === 0 ? processing : imageUrl : `${process.env.MINIO_URL}/image/${imageUrl}?t=${unixTimestamp}` as any,
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
  const pleaseWaitImg = pleaseWait()

  const unixTimestamp = Math.floor(Date.now() / 1000);
  try {
    const getQuizPaginated = await getDataByColumnNamePaginated("quiz", { transactionId: buttonValue }, 1, 1)
    if (getQuizPaginated.length > 0) {
      return c.res({
        image: `${process.env.MINIO_URL}/image/file-${getQuizPaginated[0]._id.toString()}?t=${unixTimestamp}` as any,
        intents: [<Button action="/">Home</Button>,
        <Button.Link href={`https://warpcast.com/~/compose?text=Try%20To%20Solve%20This!&embeds[]=${process.env.SCREENSHOT_URL}/api/share/${getQuizPaginated[0]._id.toString()}`}>Share</Button.Link>,]
      })
    }
    await sampleQueue.add("create-image", { data: { question: JSON.parse(question).input, transactionId: buttonValue as string , type: "refresh-question" } }, { removeOnComplete: true, removeOnFail: true })

    return c.res({
      image: pleaseWaitImg,
      intents: [<Button action={"/refresh/"+req.param("question")} value={buttonValue}>Refresh</Button>]
    })

  } catch {
    return c.res({
      image: pleaseWaitImg,
      intents: [<Button action={"/refresh/"+req.param("question")} value={buttonValue}>Refresh</Button>]
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

  const imageUrl = getQuizSolved.length > 0 ? await generateOgImage(`/screenshot/solved?quiz=${encodeURIComponent(getQuizPaginated[0].answer)}&question=${encodeURIComponent(getQuizPaginated[0].question)}`, getQuizSolved[0]._id.toString()) : await generateOgImage(`/screenshot/question/${encodeString(getQuizPaginated[0].answer)}`, getQuizPaginated[0]._id);
  const unixTimestamp = Math.floor(Date.now() / 1000);
  const processing = processingImage();
  let intents = getQuizSolved.length > 0 || addresses.some((a: any) => a === getQuizPaginated[0].address) ? [
    <Button action="/play" >Next</Button>,
    <Button action="/">Home</Button>,
    // <Button.Link href={`https://warpcast.com/~/compose?text=Try%20To%20Solve%20This!&embeds[]=${process.env.SCREENSHOT_URL}/api/share/${getQuizPaginated[0]._id.toString()}`}>Share</Button.Link>,
    <Button.Link href={`https://warpcast.com/~/compose?text=Try%20To%20Solve%20This!&embeds[]=${process.env.SCREENSHOT_URL}/api/share/${getQuizPaginated[0]._id.toString()}`}>Share</Button.Link>

  ] : [
    <TextInput placeholder="Input your question" />,
    <Button.Transaction target="/ask">Ask</Button.Transaction>,
    <Button action="/play" >Next</Button>,
    <Button action="/">Home</Button>,
    <Button.Link href={`https://warpcast.com/~/compose?text=Try%20To%20Solve%20This!&embeds[]=${process.env.SCREENSHOT_URL}/api/share/${getQuizPaginated[0]._id.toString()}`}>Share</Button.Link>
  ];
  return c.res({
    action: `/solved/${getQuizPaginated[0]._id.toString()}`,
    image: !imageUrl.includes("file") ? imageUrl.trim().length === 0 ? processing : imageUrl : `${process.env.MINIO_URL}/image/${imageUrl}?t=${unixTimestamp}` as any,
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

app.frame('/solved/:id', async (c) => {
  const { transactionId, buttonValue, req } = c
  const pleaseWaitImg = pleaseWait()
   const unixTimestamp = Math.floor(Date.now() / 1000);
  try {
    const quiz = await getDataById("quiz", req.param("id"))
    const getQuizPaginated = await getDataByColumnNamePaginated("quiz-solved", { transactionId: transactionId || buttonValue as string }, 1, 1)
    await sampleQueue.add("create-image", { data: { quiz, transactionId: transactionId || buttonValue, type: "check" } }, { removeOnComplete: true, removeOnFail: true })
    if (getQuizPaginated.length > 0 && getQuizPaginated[0].solved) {
      
      return c.res({
        image: `${process.env.MINIO_URL}/image/file-${getQuizPaginated[0]._id.toString()}?t=${unixTimestamp}` as any,
        intents: [<Button action="/">Home</Button>,
        <Button.Link href={`https://warpcast.com/~/compose?text=Try%20To%20Solve%20This!&embeds[]=${process.env.SCREENSHOT_URL}/api/share/${getQuizPaginated[0]._id.toString()}`}>Share</Button.Link>,]
      })
    }else if(getQuizPaginated.length > 0 && !getQuizPaginated[0].solved){
      
      return c.res({
        image:  `${process.env.MINIO_URL}/image/file-${encodeString((quiz as any).answer)}?t=${unixTimestamp}` as any,
        intents: [<TextInput placeholder="Input your question" />,
        <Button.Transaction target="/ask">Ask</Button.Transaction>,
        <Button action="/play" >Next</Button>,
        <Button action="/">Home</Button>,
        <Button.Link href={`https://warpcast.com/~/compose?text=Try%20To%20Solve%20This!&embeds[]=${process.env.SCREENSHOT_URL}/api/share/${(quiz as any)._id.toString()}`}>Share</Button.Link>]
      })
    }
    
     
      return c.res({
        image: pleaseWaitImg,
        intents: [<Button action={`/solved/${quiz._id.toString()}`} value={transactionId || buttonValue}>Refresh</Button>]
      })
    
  } catch {
    return c.res({
      image: pleaseWaitImg,
      intents: [<Button action={`/solved/${req.param("id")}`} value={transactionId || buttonValue}>Refresh</Button>]
    })
  }


})


devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
