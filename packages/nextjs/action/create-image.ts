
import playwright from "playwright";
import { getDataByColumnName,findAndUpdateData } from './mongo'
import { saveBufferToMinio } from './minio'
import { sampleQueue } from './worker';
import {encodeString} from './encode'
export async function generateImage(where:string) {

  try {
    const browser = await playwright.chromium.connectOverCDP(
      process.env.BROWSERLESS as string,
    );
  
    const context = await browser.newContext();
    const page = await context.newPage();
  
    // Set the viewport size to match the desired image dimensions.
    await page.setViewportSize({ width: 512, height: 512 });
  
  
    const url = process.env.SCREENSHOT_URL as string;
    // Navigate to the provided URL.
    await page.goto(url + where);
    const clip = {
      x: 0,    // x coordinate
      y: 0,    // y coordinate
      width: 512,  // width of the region
      height: 512  // height of the region
    };
    // Capture a screenshot of the page as the OG image.
    const buffer = await page.screenshot({ type: "png",clip });
  
    console.log("The image has been saved!");
    // Close the browser.
    await browser.close();
    return buffer
  } catch (error) {
    console.error('Error generating image:', error);
    throw new Error('Failed to generate image.');
  }
}

export async function generateOgImage(where:any,id:string):Promise<string> {
  try{
    const check = await getDataByColumnName("image", "url", "file-"+id);
    
    await sampleQueue.add("create-image", { data: { id:"file-"+id,where, type: "create-image" } },  { removeOnComplete: true, removeOnFail: true })
    if (check.length === 0) {
      const imageBuffer=await generateImage(where);
      const imageUrl=await saveBufferToMinio("image","file-"+id,imageBuffer);
     
      await findAndUpdateData({url:"file-"+id},{url:"file-"+id},"image")
      return imageUrl
    } else {
       return check[0].url
    }
  }catch(e){
    //@ts-ignore
    console.log("error",e.message)
    return ""
  }
  
}