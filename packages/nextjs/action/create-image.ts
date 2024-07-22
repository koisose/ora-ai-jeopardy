import playwright from "playwright";
import { getDataByColumnName } from './mongo'
import { sampleQueue } from './worker';
export function encodeString(str) {
  return Buffer.from(str, 'utf-8').toString('base64');
}

export function decodeString(encodedStr) {
  return Buffer.from(encodedStr, 'base64').toString('utf-8');
}

export async function generateImage(where) {

  const browser = await playwright.chromium.connectOverCDP(
    process.env.BROWSERLESS as string,
  );

  const context = await browser.newContext();
  const page = await context.newPage();

  // Set the viewport size to match the desired image dimensions.
  await page.setViewportSize({ width: 512, height: 512 });


  const url = process.env.NODE_ENV === "DEVELOP" ? "http://localhost:3000" : "https://nextjs-five-tau-89.vercel.app";
  // Navigate to the provided URL.
  await page.goto(url + where);

  // Capture a screenshot of the page as the OG image.
  const buffer = await page.screenshot({ type: "png" });

  console.log("The image has been saved!");
  // Close the browser.
  await browser.close();
  return buffer
}

export async function generateOgImage(where) {
  const check = await getDataByColumnName("image", "urlHash", encodeString(where));
  if (check.length === 0) {
    await sampleQueue.add("create-image", { data: { encode: encodeString(where), type: "create-image" } })
    return ""
  } else {
    await sampleQueue.add("create-image", { data: { encode: encodeString(where), type: "create-image" } })
    return check[0].url
  }
}