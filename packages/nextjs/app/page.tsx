"use client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { abi } from '~~/abi/abi'
import { useState, useEffect } from "react"
import { formatUnits } from 'viem';
import { getAccount, simulateContract, writeContract, readContract, getTransactionConfirmations } from '@wagmi/core'
import { sepolia } from '@wagmi/core/chains'
import { parseEther } from 'viem'
import { put, generateQuiz, getQuiz, getQuizSolved, saveData, getData } from '~~/action/action'
import { notification } from "~~/utils/scaffold-eth";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as tf from '@tensorflow/tfjs';

// Sample sentences

const { connector } = getAccount(wagmiConfig)

async function calculateSimilarity(sentences:any) {
  // Load the Universal Sentence Encoder model
  const model = await use.load();
  
  // Get sentence embeddings
  const embeddings = await model.embed(sentences);
  
  // Convert embeddings to array
  const embArray1 = embeddings.arraySync()[0];
  const embArray2 = embeddings.arraySync()[1];
  
  // Function to calculate cosine similarity
  //@ts-ignore
  function cosineSimilarity(vecA, vecB) {
    const dotProduct = tf.dot(vecA, vecB).dataSync();
    const magnitudeA = tf.norm(vecA).dataSync();
    const magnitudeB = tf.norm(vecB).dataSync();
    //@ts-ignore
    return dotProduct / (magnitudeA * magnitudeB);
  }
  
  // Calculate cosine similarity
  const similarity = cosineSimilarity(tf.tensor(embArray1), tf.tensor(embArray2));
  
  return similarity;
}


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
     prompt
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
    args: [15, prompt],
    chainId: sepolia.id,
  })
  console.log("result2", result2)
  while ((result2 as string).length === 0) {
    result2 = await readContract(wagmiConfig, {
      address: '0xe75af5294f4CB4a8423ef8260595a54298c7a2FB',
      abi,
      functionName: 'prompts',
      args: [15, prompt],
      chainId: sepolia.id,
    })
    console.log("result2", result2)
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(result2)
  return result2
}

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [prompt2, setPrompt2] = useState("")
  const [loading, setLoading] = useState(false)
  const [result2, setResult2] = useState("")
  const [allQuiz, setAllQuiz] = useState([])
  const [allQuizSolved, setAllQuizSolved] = useState([])
  const [answers, setAnswers] = useState({})
  const handleInputChange = (id:any, value:any) => {
    setAnswers({
      ...answers,
      [id]: value,
    });
  };

  const handleSubmit = (event:any) => {
    event.preventDefault();
    // Process the answers here
    console.log(answers);
  };
  useEffect(() => {
    const fetchData = async () => {

      const responseQuiz = await getData("quiz");
      setAllQuiz(responseQuiz)
      const responseQuizSolved = await getData("quiz-solved");
      setAllQuizSolved(responseQuizSolved)
    };

    fetchData();
  }, []);
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
                  try {
                    const pa = await generateQuiz(prompt2);
                    console.log(JSON.parse(pa).answer)
                    await saveData({ address: connectedAddress, prompt: prompt2, answer: JSON.parse(pa).answer }, "quiz")
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    const getAllQuiz = await getData("quiz")
                    const getAllQuizSolved = await getData("quiz-solved")
                    setAllQuiz(getAllQuiz)
                    setAllQuizSolved(getAllQuizSolved)
                    setResult2(JSON.parse(pa).answer)
                    setLoading(false);
                  } catch (e) {
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
            {/* @ts-ignore */}
            <div className="flex flex-col items-center">
              {/* @ts-ignore */}
              <span className="badge p-6 text-lg">Quiz that you've solved: {allQuizSolved.filter(quiz => quiz.address === connectedAddress).length}/{allQuiz.filter(quiz => quiz.address !== connectedAddress).length}</span>
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    const quizData = await getData("quiz");
                    setAllQuiz(quizData);
                    const quizDataSolved = await getData("quiz-solved");
                    setAllQuizSolved(quizDataSolved);
                    setLoading(false);
                  } catch (error) {
                    console.error("Failed to fetch quiz data:", error);
                    setLoading(false);
                  }
                }}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 mb-4"
              >
                {loading ? "Loading..." : "Refresh Quiz"}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {/* @ts-ignore */}
            {allQuiz.map(a => <div key={a._id} className="card w-64 p-4 border border-gray-300 bg-sky-100">
              <h2 className="text-lg font-bold mb-2 text-center text-black bg-blue-500 p-1 rounded">
                {/* @ts-ignore */}
                <code>{a.answer}</code>
              </h2>
              {/* @ts-ignore */}
              {(connectedAddress !== a.address || !allQuizSolved.some(quizSolved => quizSolved.address === connectedAddress)) && <>
                {/* @ts-ignore */}
                <input value={answers[a._id] || ''}   onChange={(e) => handleInputChange(a._id, e.target.value)}
                  disabled={loading}
                  type="text"
                  placeholder="Enter your answer"
                  className="mb-2 border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none text-black"
                  

                />
                <button disabled={loading}
                  onClick={async () => {
                    //@ts-ignore
                    const what = await generateQuiz(answers[a._id])
                    //@ts-ignore
                    console.log(answers[a._id])
                    console.log(JSON.parse(what).answer)
                    //@ts-ignore
                    console.log(a.answer)
                    //@ts-ignore
                    const near=await calculateSimilarity([JSON.parse(what).answer,a.answer])
                    // const near=cosineSimilarityOfStrings("It is a bear species native to south central China","It is a bear species native to south central China")
                    console.log("near",near)
                    
                  }}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  {loading ? <div className="flex justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" className="lds-rolling">
                      <circle cx="50" cy="50" fill="none" stroke="#fff" strokeWidth="10" r="35" strokeDasharray="164.93361431346415 56.97787143782138" transform="rotate(275.845 50 50)">
                        <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform>
                      </circle>
                    </svg>
                  </div> : "Submit"}
                </button>
              </>}
              {/* @ts-ignore */}
              {allQuizSolved.some(quizSolved => quizSolved.address === connectedAddress) && (
                <div className="text-center text-green-500">
                  You have already solved this quiz!
                </div>
              )}

            </div>)}


          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
