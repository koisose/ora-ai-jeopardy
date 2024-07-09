"use client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { abi } from '~~/abi/abi'
import { useState } from "react"
import { formatUnits } from 'viem';
import { getAccount,simulateContract, writeContract, http, createConfig, readContract, getTransactionConfirmations } from '@wagmi/core'
import { sepolia } from '@wagmi/core/chains'
import { parseEther } from 'viem'
import { put } from '~~/action/action'
import { notification } from "~~/utils/scaffold-eth";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
const { connector } = getAccount(wagmiConfig)
const convertBigIntToEther = (bigIntValue: any) => {
  // Format the BigInt value to Ether (18 decimal places)
  const etherValue = formatUnits(bigIntValue, 18);
  return etherValue;
};
async function executeContractFunction(prompt: any) {
  const result = await readContract(wagmiConfig, {
    address: '0xe75af5294f4CB4a8423ef8260595a54298c7a2FB',
    abi,
    functionName: 'estimateFee',
    args: [15],
    chainId: sepolia.id,
  })
  // return result
  const { request } = await simulateContract(wagmiConfig, {
    abi,
    address: '0xe75af5294f4CB4a8423ef8260595a54298c7a2FB',
    functionName: 'calculateAIResult',
    args: [
      15,
      `{"instruction":"You are a jeopardy quiz generator people will input a question and you will be given the answer, but hide the obvious answer for example the question would be 'Who is vitalik?' instead of answering 'vitalik is crypto entrepreneur' you answer with 'he is the creator of ethereum'","input":"${prompt}"}`
    ],
    value: parseEther(convertBigIntToEther(result)),
    connector
  })

  const hash = await writeContract(wagmiConfig, request)
  let transaction = await getTransactionConfirmations(wagmiConfig, {
    chainId: sepolia.id,
    hash,
  })
  while (Number(transaction) === 0) {
    transaction = await getTransactionConfirmations(wagmiConfig, {
      chainId: sepolia.id,
      hash,
    })
    console.log("still waiting for transaction to be confirmed")
  }
  let result2 = await readContract(wagmiConfig, {
    address: '0xe75af5294f4CB4a8423ef8260595a54298c7a2FB',
    abi,
    functionName: 'prompts',
    args: [15, `{"instruction":"You are a jeopardy quiz generator people will input a question and you will be given the answer, but hide the obvious answer for example the question would be 'Who is vitalik?' instead of answering 'vitalik is crypto entrepreneur' you answer with 'he is the creator of ethereum'","input":"${prompt}"}`],
    chainId: sepolia.id,
  })
  console.log("result2",result2)
  while((result2 as string).length===0){
    result2 = await readContract(wagmiConfig, {
      address: '0xe75af5294f4CB4a8423ef8260595a54298c7a2FB',
      abi,
      functionName: 'prompts',
      args: [15, prompt],
      chainId: sepolia.id,
    })
    console.log("result2",result2)
  await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(result2)
  return result2
}
async function generateQuiz(){
  
}
const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [prompt2, setPrompt2] = useState("")
  const [loading, setLoading] = useState(false)
  const [result2, setResult2] = useState("")
  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Using OpenLM Chat (7B)*</span>
            <span className="block text-4xl font-bold">Jeopardy</span>

          </h1>


          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
          <p className="text-center text-lg">
            kinda like jeopardy game show, you will win when you ask the right question
          </p>
          <div className="flex justify-center">
            <div className="flex flex-col items-center">
              <textarea
                placeholder="Enter your question here..."
                className="w-full mt-4 p-2 border border-gray-300 bg-white rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                onChange={(e) => setPrompt2(e.target.value)}
              />
              <button disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  setResult2("")
                  try{
                    const pa = await executeContractFunction(prompt2);
                    await put({address:connectedAddress,prompt:prompt2,answer:pa},"quiz")
                    setResult2(pa as any)
                  setLoading(false);
                  }catch(e){
                    notification.error((e as any).message)
                    setLoading(false);
                  }
                  
                  
                }}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">
                {loading ? <div className="flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" className="lds-rolling">
                    <circle cx="50" cy="50" fill="none" stroke="#fff" strokeWidth="10" r="35" strokeDasharray="164.93361431346415 56.97787143782138" transform="rotate(275.845 50 50)">
                      <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform>
                    </circle>
                  </svg>
                </div> : "Create Quiz Using AI Now"}

              </button>
              {result2.length > 0 && <div className="bg-blue-700 rounded-lg p-4 mt-2">
                <p className="text-white">{result2}</p>
              </div>}
            </div>
          </div>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center mb-5">
            <span className="badge p-6 text-lg">Quiz that you've solved: 0/10</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4">

            <div className="card w-64 p-4 border border-gray-300 bg-sky-100">
              <h2 className="text-lg font-bold mb-2 text-center text-black bg-blue-500 p-1 rounded">
                <code>This is a block with a dark blue background and border radius.</code>
              </h2>
              <input type="text" placeholder="Enter your answer" className="mb-2 border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none text-black" />
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Submit
              </button>
            </div>
            <div className="card w-64 h-48 p-4 border border-gray-300 bg-sky-100">
              <h2 className="text-lg font-bold mb-2 text-center text-black bg-blue-500 p-1 rounded">
                <code>Card 2</code>
              </h2>
              <input type="text" placeholder="Enter your answer" className="mb-2 border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none text-black" />
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Submit
              </button>
            </div>
            <div className="card w-64 h-48 p-4 border border-gray-300 bg-sky-100">
              <h2 className="text-lg font-bold mb-2 text-center text-black bg-blue-500 p-1 rounded">
                <code>Card 3</code>
              </h2>
              <input type="text" placeholder="Enter your answer" className="mb-2 border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none text-black" />
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
