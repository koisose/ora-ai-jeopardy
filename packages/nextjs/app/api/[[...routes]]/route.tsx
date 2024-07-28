/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'

import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'

import { getTableSize, getDataByColumnNamePaginated,getDataByQuery,getDataById } from '../../../action/mongo'
import { generateOgImage } from '../../../action/create-image'
import { encodeString } from '../../../action/encode'
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
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
    count: 0
  },

})
function processingImage() {
  return (
    <div style={{ color: 'white', backgroundColor: 'purple', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', height: '100vh', fontSize: 60 }}>
      Please wait we're still processing the image
    </div>
  )
}

app.frame('/', async (c) => {
  const imageUrl = await generateOgImage("/screenshot/title",encodeString("/screenshot/title"));
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
app.frame('/share/:panda', async (c) => {
  console.log(c.initialPath.replace("/api/share/",""))
  const getQuizPaginated=await getDataById("quiz",c.initialPath.replace("/api/share/",""))
  const imageUrl = await generateOgImage("/screenshot/quiz",encodeString("/screenshot/quiz"));
  const unixTimestamp = Math.floor(Date.now() / 1000);
  const processing = processingImage();
  return c.res({
    image: imageUrl.trim().length === 0 ? processing : `${process.env.MINIO_URL}/image/${imageUrl}?t=${unixTimestamp}` as any,
    intents: [
      <Button action="/play/">Create</Button>,
      <Button action="/">Home</Button>
    ]
  })
})
app.frame('/quiz', async (c) => {
  const imageUrl = await generateOgImage("/screenshot/quiz",encodeString("/screenshot/quiz"));
  const unixTimestamp = Math.floor(Date.now() / 1000);
  const processing = processingImage();
  return c.res({
    image: imageUrl.trim().length === 0 ? processing : `${process.env.MINIO_URL}/image/${imageUrl}?t=${unixTimestamp}` as any,
    intents: [
      <TextInput placeholder="Input your question" />,  
      <Button>Create</Button>,
      <Button action="/">Home</Button>
    ]
  })
})
app.frame('/play', async (c) => {

  const { deriveState,previousState } = c

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
  const getQuizPaginated=await getDataByColumnNamePaginated("quiz",{},previousState.count+1,1)
  const getQuizSolved=await getDataByQuery("quiz-solved",{address:{$in:addresses},quizId:getQuizPaginated[0]._id.toString()})
  const getQuizHash=await getDataByQuery("quiz-hash",{address:{$in:addresses},quizId:getQuizPaginated[0]._id.toString()})
  const what = getQuizSolved.length > 0 ? {
    aiAnswer: getQuizSolved[0].answer,
    quiz: getQuizPaginated[0].answer,
    question: getQuizHash[0].prompt
  } : null;
  
  const imageUrl = getQuizSolved.length>0?await generateOgImage(`/screenshot/solved/${encodeString(JSON.stringify(what))}`,getQuizSolved[0]._id.toString()):await generateOgImage(`/screenshot/question/${encodeString(getQuizPaginated[0].answer)}`,getQuizPaginated[0]._id);
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
    image: imageUrl.trim().length === 0 ? processing : `${process.env.MINIO_URL}/image/${imageUrl}?t=${unixTimestamp}` as any,
    intents,
  })
})



devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
