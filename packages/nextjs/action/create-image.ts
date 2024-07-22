import playwright from "playwright";
import { getDataByColumnName } from './mongo'
import { sampleQueue } from './worker';
export function encodeString(str: string) {
  return Buffer.from(str, 'utf-8').toString('hex');
}

export function decodeString(encodedStr: string) {
  return Buffer.from(encodedStr, 'hex').toString('utf-8');
}

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
  
    // Capture a screenshot of the page as the OG image.
    const buffer = await page.screenshot({ type: "png" });
  
    console.log("The image has been saved!");
    // Close the browser.
    await browser.close();
    return buffer
  } catch (error) {
    console.error('Error generating image:', error);
    throw new Error('Failed to generate image.');
  }
}

export async function generateOgImage(where:any) {
  const check = await getDataByColumnName("image", "urlHash", encodeString(where));
 
  if (check.length === 0) {
    await sampleQueue.add("create-image", { data: { encode: encodeString(where), type: "create-image" } },  { removeOnComplete: true, removeOnFail: true },)
    return ""
  } else {
    await sampleQueue.add("create-image", { data: { encode: encodeString(where), type: "create-image" } },  { removeOnComplete: true, removeOnFail: true },)
    return check[0].url
  }
}