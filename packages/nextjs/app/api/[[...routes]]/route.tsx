/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'

import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'

import { getData } from '../../../action/action'
import { getTableSize, getDataByColumnNamePaginated } from '../../../action/mongo'
import { generateOgImage, encodeString } from '../../../action/create-image'
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
const client = new NeynarAPIClient(process.env.NEYNAR as string);
//@ts-ignore
const app = new Frog({
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
  const imageUrl = await generateOgImage("/screenshot/title");
  const unixTimestamp = Math.floor(Date.now() / 1000);
  const processing = processingImage();
  return c.res({
    image: imageUrl.trim().length === 0 ? processing : `${process.env.MINIO_URL}/image/${imageUrl}?t=${unixTimestamp}` as any,
    intents: [
      <Button action="/play">
        Play
      </Button>,
      <Button.Redirect location="https://nextjs-five-tau-89.vercel.app">Create</Button.Redirect>
    ]
  })
})
app.frame('/play', async (c) => {

  const { deriveState,previousState } = c

    //@ts-ignore
  // const fid = c.frameData.fid;
  //   //@ts-ignore
  // const userData = await client.lookupUserByFid(fid);
  //   //@ts-ignore
  // let verifiedAddresses = userData.result.user.verifiedAddresses.eth_addresses
  // let addresses = verifiedAddresses.concat(userData.result.user.custodyAddress);
  const totalQuizSize = await getTableSize("quiz");
  // const allQuiz = await getData("quiz")
  console.log("total",totalQuizSize)
  // console.log(state)
  //@ts-ignore
  const state = deriveState(previousState => {
    //@ts-ignore
    if (previousState.count != totalQuizSize - 1) {
      //@ts-ignore
      previousState.count++
    } else {
      //@ts-ignore
      previousState.count = 0
    }
  })
  console.log("previ",previousState)
  console.log(state)
  //@ts-ignore
  const getQuizPaginated=await getDataByColumnNamePaginated("quiz",{},previousState.count+1,1)
  console.log("daquiz",getQuizPaginated)
  return c.res({
    image: (
      <div style={{ color: 'white', backgroundColor: 'purple', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', height: '100vh', fontSize: 60 }}>
        {/* @ts-ignore*/}
        {getQuizPaginated[0].answer}
        process
      </div>
    ),
    intents: [
      <TextInput placeholder="Input your question" />,
      // <Button.Transaction target="/ask">Ask</Button.Transaction>,
      //@ts-ignore
      <Button action="/play" >Next</Button>,
      <Button action="/">Home</Button>

    ],
  })
})



devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
