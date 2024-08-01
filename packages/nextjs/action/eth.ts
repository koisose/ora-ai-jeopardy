import { formatUnits } from 'viem'
import { abi,optimismAbi } from '../abi/abi'
import { createPublicClient, http,parseEventLogs } from 'viem'
import { optimismSepolia } from 'viem/chains'
import ky from 'ky';
//@ts-ignore
// const { connector } = getAccount(wagmiConfig)

export async function calculateSimilarityPost(data:any){
  try {
    const response = await ky.post("https://sentence.koisose.lol/calculate-similarity", {
      json: data,
      headers: {
        'Content-Type': 'application/json'
      }
    }).json();
    //@ts-ignore
    return response.similarity;
  } catch (error) {
    return 0
  }
}
const publicClient = createPublicClient({
  chain: optimismSepolia,
  transport: http('https://optimism-sepolia.infura.io/v3/'+process.env.INFURA)
  
})
export async function getAnswerNow(hash:any){
  try{
    const transaction = await publicClient.getTransactionReceipt({ 
      hash
    })
    // console.log(transaction.logs)
    const logs = parseEventLogs({ 
      abi: optimismAbi, 
      logs: transaction.logs,
    })
    const logsData=logs.filter((log:any) => log.eventName === "promptRequest")
    if(logsData.length>0){
      const requestId=(logsData[0] as any).args.requestId
      const answer = await publicClient.getContractEvents({
        abi: optimismAbi,
        address: process.env.NEXT_PUBLIC_OAO_PROMPT as any || "0xf6919ebb1bFdD282c4edc386bFE3Dea1a1D8AC16",
         eventName: 'promptsUpdated',
         fromBlock:transaction.blockNumber
      })
      const answerLog=answer.filter((log:any) => log.eventName === "promptsUpdated" && log.args.requestId===requestId)
      if(answerLog.length>0){
        return (answerLog[0] as any).args.output
      }else{
        return false
      }
    }else{
  
      return false
    }
  }catch{
    return false
  }
   
}
export async function getQuestion(hash:any){
  try{
    const transaction = await publicClient.getTransactionReceipt({ 
      hash
    })
    // console.log(transaction.logs)
    const logs = parseEventLogs({ 
      abi: optimismAbi, 
      logs: transaction.logs,
    })
    const logsData=logs.filter((log:any) => log.eventName === "promptRequest")
    if(logsData.length>0){
      return (logsData[0] as any).args.prompt
      
    }else{
  
      return false
    }
  }catch{
    return false
  }
   
}




export const convertBigIntToEther = (bigIntValue: any) => {
  // Format the BigInt value to Ether (18 decimal places)
  const etherValue = formatUnits(bigIntValue, 18);
  return etherValue;
};

export async function estimateFee() {
  //@ts-ignore
  const result = await publicClient.readContract({
    address: process.env.NEXT_PUBLIC_OAO_PROMPT as any,
    abi:optimismAbi,
    functionName: 'estimateFee',
    args: [11],

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