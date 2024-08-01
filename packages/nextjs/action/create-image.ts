
import playwright from "playwright";
import { getDataByColumnName } from './mongo'
import {encodeString} from './encode'
import { sampleQueue } from './worker';
import ky from 'ky'
export async function getSession(){
  const response = await ky.get(`http://${process.env.BROWSERLESS}/sessions?token=adssad`).json();
  return response;
}
export async function generateImage(where: string) {
  let browser;
  let context;
  let page;

  try {
    
    browser = await playwright.chromium.connectOverCDP(
        `ws://${process.env.BROWSERLESS as string}`,
    );

    context = await browser.newContext();
    page = await context.newPage();

    // Set the viewport size to match the desired image dimensions.
    await page.setViewportSize({ width: 512, height: 512 });

    const url = process.env.SCREENSHOT_URL as string;
    // Navigate to the provided URL.
    await page.goto(url + where, { waitUntil: 'networkidle' });
   
    const clip = {
      x: 0,    // x coordinate
      y: 0,    // y coordinate
      width: 512,  // width of the region
      height: 512  // height of the region
    };
    // Capture a screenshot of the page as the OG image.
    const buffer = await page.screenshot({ type: "png", clip });
    if (page) await page.close();
    if (context) await context.close();
    return buffer;
  } catch (error) {
    if (page) await page.close();
    if (context) await context.close();
    if (browser) await browser.close();
    console.error('Error generating image:', error);
    throw new Error('Failed to generate image.');
  
  }
}

export async function generateOgImage(where:any,id:string):Promise<string> {
  try{
    const check = await getDataByColumnName("image", "url", "file-"+id);
    
    await sampleQueue.add("create-image", { data: { id:"file-"+id,where, type: "create-image" } },  { removeOnComplete: true, removeOnFail: true })
    if (check.length === 0) {
      const unixTimestamp = Math.floor(Date.now() / 1000);
      return `${process.env.SCREENSHOT_URL}/api/img/${encodeString(where)}?t=${unixTimestamp}`;
    } else {
       return check[0].url
    }
  }catch(e){
    //@ts-ignore
    console.log("error",e.message)
    return ""
  }
  
}