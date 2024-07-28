import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as tf from '@tensorflow/tfjs';
import { parseEther,formatUnits } from 'viem'
import { getAccount, simulateContract, writeContract, readContract, getTransactionConfirmations } from '@wagmi/core'
import { wagmiConfig } from "../services/web3/wagmiConfig";
import { sepolia } from '@wagmi/core/chains'
import { abi } from '../abi/abi'
//@ts-ignore
const { connector } = getAccount(wagmiConfig)
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
  
  
  const convertBigIntToEther = (bigIntValue: any) => {
    // Format the BigInt value to Ether (18 decimal places)
    const etherValue = formatUnits(bigIntValue, 18);
    return etherValue;
  };
  export async function executeContractFunction(prompt: any) {
    //@ts-ignore
    const result = await readContract(wagmiConfig, {
      address: process.env.NEXT_PUBLIC_ORA_SEPOLIA as string,
      abi,
      functionName: 'estimateFee',
      args: [13],
      chainId: sepolia.id,
    })
    // return result
    //@ts-ignore
    const { request } = await simulateContract(wagmiConfig, {
      abi,
      address: process.env.NEXT_PUBLIC_ORA_SEPOLIA as string,
      functionName: 'calculateAIResult',
      args: [
        13,
        prompt
      ],
      value: parseEther(convertBigIntToEther(result)),
      connector
    })
  //@ts-ignore
    const hash = await writeContract(wagmiConfig, request)
    return hash
    
  }
  export async function getAnswer(hash:string){
    //@ts-ignore
    const transaction = await getTransactionConfirmations(wagmiConfig, {
        chainId: sepolia.id,
        hash,
      })
      if(Number(transaction) > 0){
//@ts-ignore
const result2 = await readContract(wagmiConfig, {
    address: process.env.NEXT_PUBLIC_ORA_SEPOLIA as string,
    abi,
    functionName: 'prompts',
    //@ts-ignore
    args: [13, prompt],
    chainId: sepolia.id,
  })
  return result2
      }else{
        return false
      }
      
        
  }