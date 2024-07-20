import playwright from "playwright";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { decodeFromHex } from "~/utils/encode";

export async function generateOgImage(url: string): Promise<void> {
  const decoded = decodeFromHex(url.split(".").slice(0, -1).join("."));
  const browser = await playwright.chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--headless", "--disable-gpu"],
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Set the viewport size to match the desired image dimensions.
  await page.setViewportSize({ width: 512, height: 512 });

  // Navigate to the provided URL.
  await page.goto(decoded);

  // Capture a screenshot of the page as the OG image.
  const buffer = await page.screenshot({ type: "png" });

  // Convert the buffer to an image object
  const image = await sharp(buffer).png().toBuffer();

  const resizedImage = await sharp(image).resize(512, 512).toBuffer();
  const fileName = path.resolve("./src/media/" + url);
  fs.writeFileSync(fileName, resizedImage);
  console.log("The image has been saved!");
  // Close the browser.
  await browser.close();
}