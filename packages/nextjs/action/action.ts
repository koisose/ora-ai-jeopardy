'use server'
import { Deta } from 'deta';
import { GoogleGenerativeAI,  HarmCategory,
    // @ts-ignore
    HarmBlockThreshold } from "@google/generative-ai";
// @ts-ignore
const deta = new Deta(process.env.DETA);
export async function getQuiz(){
  const bcDb = deta.Base("quiz");
  let bcData=await bcDb.fetch({}) 
  let mo=bcData.items
  // console.log(bcData.last)
  while(bcData.last){
      bcData=await bcDb.fetch({},{last:bcData.last}) 
      mo=mo.concat(bcData.items)
  }
  
  return mo
}
export async function getQuizSolved(){
  const bcDb = deta.Base("quiz-solved");
  let bcData=await bcDb.fetch({}) 
  let mo=bcData.items
  // console.log(bcData.last)
  while(bcData.last){
      bcData=await bcDb.fetch({},{last:bcData.last}) 
      mo=mo.concat(bcData.items)
  }
  
  return mo
}
export async function putKey(data:any,key:any, database:any) {

  const db = deta.Base(database);
  await db.put(data,key);
}
export async function put(data:any, database:any) {

    const db = deta.Base(database);
    await db.put(data);
}
export async function generateQuiz(prompt:string){
    const API_KEY = process.env.GOOGLE_API_KEY as string; // Replace with your actual API key

const genAI = new GoogleGenerativeAI(API_KEY);
    const generationConfig = {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      };
      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ];
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest",
      systemInstruction: `you're a jeopardy quiz generator do not create answer that is very obvious for user to guess,
      for example the question is 'who is vitalik?' do not add 'vitalik' in the answer, instead say 'he is an ethereum founder',
      only return json answer for example {'answer':'he is an ethereum founder'}
      `
    }
      , { apiVersion: 'v1beta' });
      const chatSession = model.startChat({
        generationConfig,
        safetySettings,
        history: [
         
        ],
      });
    
      
      const result = await chatSession.sendMessage(prompt);
      
      
  
      const text = result.response.text();
      return text
}