"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { abi } from '~~/abi/abi'
import { useReadContract } from 'wagmi'
import {useState} from "react"
import { formatUnits } from 'viem';
import { simulateContract, writeContract,http, createConfig,readContract } from '@wagmi/core'
import {sepolia } from '@wagmi/core/chains'
import { parseEther } from 'viem'

export const config = createConfig({
  chains: [ sepolia],
  transports: {
      [sepolia.id]: http(),
  },
})
const convertBigIntToEther = (bigIntValue:any) => {
  // Format the BigInt value to Ether (18 decimal places)
  const etherValue = formatUnits(bigIntValue, 18);
  return etherValue;
};
async function executeContractFunction(prompt:any,eth:any) {
  const result = await readContract(config, {
    abi,
    address: '0x6b175474e89094c44da98b954eedeac495271d0f',
    functionName: 'totalSupply',
  })
  const { request } = await simulateContract(config, {
    abi,
    address: '0xe75af5294f4CB4a8423ef8260595a54298c7a2FB',
    functionName: 'transferFrom',
    args: [
      15,
      prompt
    ],
    value: parseEther(eth)
  })
  
  const hash = await writeContract(config, request)
  return hash
}
const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [fee,setFee]=useState(0)
  const {  refetch } = useReadContract({
    address: '0xe75af5294f4CB4a8423ef8260595a54298c7a2FB',
    abi,
    functionName: 'estimateFee',
    args: [15],
    chainId: sepolia.id,
  });
  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Using OpenLM Chat (7B)*</span>
            <span className="block text-4xl font-bold">Jeopardy</span>
            
          </h1>
          {/* <button onClick={async() => {
const a=await refetch()
const etherValue = convertBigIntToEther(a.data);
setFee(etherValue as any)
          }}>
            Log to Console
          </button> */}
          
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
          <p className="text-center text-lg">
            kinda like jeopardy game show you will win when you ask the right question
          </p>
          <div className="flex justify-center">
            <div className="flex flex-col items-center">
              <textarea
                placeholder="Enter your question here..."
                className="w-full mt-4 p-2 border border-gray-300 bg-white rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
              />
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">
                Create Quiz Using AI Now
              </button>
            <div className="bg-blue-700 rounded-lg p-4 mt-2">
              <p className="text-white">This is a block with a dark blue background and border radius.</p>
            </div>
            </div>
          </div>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
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
