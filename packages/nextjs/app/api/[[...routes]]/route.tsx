/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import ky from 'ky'
//@ts-ignore
const app = new Frog({
  //@ts-ignore
  assetsPath: '/',
  //@ts-ignore
  basePath: '/api',

  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})

// Uncomment to use Edge Runtime
// export const runtime = 'edge'
//https://dappapi.propy.com/nft/base/propykeys?perPage=20&page=141&landmark=true
function generateRandomNumber() {
  return Math.floor(Math.random() * (1407 - 1 + 1)) + 1;
}
async function fetchPropyKeys() {
  try {
    const response = await ky.get('https://dappapi.propy.com/nft/base/propykeys', {
      searchParams: {
        perPage: 2,
        page: generateRandomNumber(),
        landmark: true
      }
    }).json();
    return response;
  } catch (error) {
    console.error('Failed to fetch propy keys:', error);
    return null;
  }
}
function generateRandomNumberBetweenOneAndTwo() {
  return Math.floor(Math.random() * (2 - 1 + 1)) + 1;
}

app
  .frame('/', (c) => {

    return c.res({
      image: (
        <div style={{ color: 'white', backgroundColor: 'purple', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: 60 }}>
          Guess the propy landmark game
        </div>
      ),
      intents: [
        <Button action="/propy/random">
          Play
        </Button>,
        <Button action="/propy/leaderboard">
          Leaderboard
        </Button>,
      ]
    })
  })
app.frame('/index', (c) => {
  const { buttonValue, inputText, status } = c
  const fruit = inputText || buttonValue
  return c.res({
    image: (
      <div
        style={{
          background: 'purple',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          width: '100%',

        }}
      >
        <div style={{ margin: '15px', fontSize: '35px', color: 'white' }}>Pick one farcaster channel to search for cast using semantic search:
        </div>
        <div style={{ marginLeft: "12px", fontSize: '40px', color: 'white' }}>
          1. EthCC
        </div>
        <div style={{ marginLeft: "12px", fontSize: '40px', color: 'white' }}>
          2. Podcast
        </div>
        <div style={{ marginLeft: "12px", fontSize: '40px', color: 'white' }}>
          3. Launchcaster
        </div>
        <div style={{ marginLeft: "12px", fontSize: '40px', color: 'white' }}>
          4. News
        </div>
        <div style={{ marginLeft: "12px", fontSize: '40px', color: 'white' }}>
          5. SF
        </div>
        <div style={{ marginLeft: "12px", fontSize: '40px', color: 'white' }}>
          6. Events
        </div>
        <div style={{ marginLeft: "12px", fontSize: '40px', color: 'white' }}>
          7. FarCon
        </div>
        <div style={{ marginLeft: "12px", fontSize: '40px', color: 'white' }}>
          8. AI
        </div>
        <div style={{ marginLeft: "12px", fontSize: '40px', color: 'white' }}>
          9. NYC
        </div>
        <div style={{ marginLeft: "12px", fontSize: '40px', color: 'white' }}>
          10. Farcaster
        </div>
      </div>
    ),
    intents: [
      <TextInput placeholder="Pick one channel" />,
      <Button action="/cop">Pick</Button>
    ],
  })
})
app
  .frame('/propy', (c) => {

    return c.res({
      image: (
        <div style={{ color: 'white', backgroundColor: 'purple', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: 60 }}>
          Guess the propy landmark game
        </div>
      ),
      intents: [
        <Button action="/log-this">
          Play
        </Button>,
        <Button action="/">
          Leaderboard
        </Button>,
      ]
    })
  })
app
  .frame('/propy/random',(c) => {
// const data=await fetchPropyKeys();
// const pickNumber=generateRandomNumberBetweenOneAndTwo();
// const whatElse=pickNumber===1?2:1;
// //@ts-ignore
// const trueAnswer=data.data.data[pickNumber-1];
// //@ts-ignore
// const wrongAnswer=data.data.data[whatElse-1];
// console.log(`https://cloudflare-ipfs.com/ipfs/${trueAnswer.metadata.image.replace("ipfs://","")}`)
    return c.res({
      image: (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', height: '100vh', textAlign: 'center', backgroundColor: 'purple' }}>
          {/* <img src={`https://ipfs.io/ipfs/${trueAnswer.metadata.image.replace("ipfs://","")}`} style={{ width: '380px', height: '380px', marginTop: '20px' }} />
          <div style={{ marginTop: '20px', fontSize: '40px', color: 'white' }}>
            What is this landmark?
          </div>
          <div style={{  fontSize: '40px', color: 'white' }}>A. {trueAnswer.metadata.name}</div>
          <div style={{  fontSize: '40px', color: 'white' }}>B. {wrongAnswer.metadata.name}</div> */}
        </div>
      ),
      intents: [
        <Button action="/">
          A
        </Button>,
        <Button action="/">
          B
        </Button>,
        <Button action="/">
        Back
      </Button>,
      ]
    })
  })
app
  .frame('/propy/leaderboard', (c) => {

    return c.res({
      image: (
        <div style={{ color: 'white', backgroundColor: 'purple', display: 'flex', justifyContent: 'center',  height: '100vh', fontSize: 60, position: 'absolute', top: 0, left: 0, right: 0 }}>
Leaderboard
        </div>
      ),
      intents: [
        <Button action="/propy/random">
          Play
        </Button>,
        <Button action="/">
          Back
        </Button>,
      ]
    })
  })
devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
