import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as tf from '@tensorflow/tfjs';
import { parseEther, formatUnits } from 'viem'
import { getAccount, simulateContract, writeContract, readContract, getTransactionConfirmations } from '@wagmi/core'
import { wagmiConfig } from "../services/web3/wagmiConfig";

import { abi } from '../abi/abi'
import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
//@ts-ignore
// const { connector } = getAccount(wagmiConfig)


const publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
})
export async function calculateSimilarity(sentences: any) {
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


export const convertBigIntToEther = (bigIntValue: any) => {
  // Format the BigInt value to Ether (18 decimal places)
  const etherValue = formatUnits(bigIntValue, 18);
  return etherValue;
};

export async function estimateFee() {
  //@ts-ignore
  const result = await publicClient.readContract({
    address: process.env.NEXT_PUBLIC_ORA_SEPOLIA as any,
    abi,
    functionName: 'estimateFee',
    args: [13],

  })
  return result
}
export async function getAnswer(hash: string,prompt:string) {
  try{
//@ts-ignore
const transactionReceipt = await publicClient.getTransactionReceipt({ hash })
const confirmations = await publicClient.getTransactionConfirmations({  
  transactionReceipt
})
if (Number(confirmations) > 0) {
  //@ts-ignore
  const result2 = await publicClient.readContract( {
    address: process.env.NEXT_PUBLIC_ORA_SEPOLIA as any,
    abi,
    functionName: 'prompts',
    //@ts-ignore
    args: [11, prompt],
    
  })
  return result2
} else {
  return false
}
  }catch{
return false
  }
  


}
export async function getAddress(hash: string) {
  try{
//@ts-ignore
const transactionReceipt = await publicClient.getTransactionReceipt({ hash })
return transactionReceipt.from.toLowerCase();
  }catch{
    return ""
  }
  


}