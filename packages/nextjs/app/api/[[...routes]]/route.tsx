/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import ky from 'ky'
import { getData } from '../../action/action'
//@ts-ignore
const app = new Frog({
  //@ts-ignore
  assetsPath: '/',
  //@ts-ignore
  basePath: '/api',
  initialState: {
    count: 0, total: 0
  }
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

app
  .frame('/', (c) => {

    return c.res({
      image: (
        <div style={{ color: 'white', backgroundColor: 'purple', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', height: '100vh', fontSize: 60 }}>
          Guess the question, ORA AI Jeopardy like game
        </div>
      ),
      intents: [
        <Button action="/play">
          Play
        </Button>,
        <Button.Redirect location="https://nextjs-five-tau-89.vercel.app">Create</Button.Redirect>
      ]
    })
  })
app.frame('/play', async (c) => {
  const { buttonValue, inputText, deriveState } = c
  const fruit = inputText || buttonValue
  const allQuiz = await getData("quiz")
  const state = deriveState(previousState => {
    //@ts-ignore
    if (previousState.count != allQuiz.length - 1) {
      //@ts-ignore
      previousState.count++
    } else {
      //@ts-ignore
      previousState.count = 0
    }

    //@ts-ignore
    previousState.total = allQuiz.length
  })
  return c.res({
    image: (
      <div style={{ color: 'white', backgroundColor: 'purple', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', height: '100vh', fontSize: 60 }}>
        {/* @ts-ignore*/}
        {allQuiz[state.count].answer}
      </div>
    ),
    intents: [
      <TextInput placeholder="Input your question" />,
      <Button.Transaction target="/ask">Ask</Button.Transaction>,
      <Button action="/play">Next</Button>,
      <Button action="/">Back</Button>

    ],
  })
})
app.transaction('/ask', async (c) => {
  const { address } = c
  // const allQuiz = await getData("quiz")
  
  return  new Response(address, { status: 200 })
})

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
