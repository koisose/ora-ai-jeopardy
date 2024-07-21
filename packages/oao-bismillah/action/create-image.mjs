import playwright from "playwright";
// import sharp from "sharp";


export async function generateOgImage() {
//http://156.67.214.204:3004/
const browser = await playwright.chromium.connectOverCDP(
  process.env.BROWSERLESS,
);
  // const browser = await playwright.chromium.launch({
  //   headless: true,
  //   args: ["--no-sandbox", "--headless", "--disable-gpu"],
  // });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Set the viewport size to match the desired image dimensions.
  await page.setViewportSize({ width: 512, height: 512 });
  


  // Navigate to the provided URL.
  await page.goto("https://duckduckgo.com/");
  const title = await page.title();
  console.log(title)
  // Capture a screenshot of the page as the OG image.
  // const buffer = await page.screenshot({ type: "png" });

  // // Convert the buffer to an image object
  // const image = await sharp(buffer).png().toBuffer();
  
  console.log("The image has been saved!");
  // Close the browser.
  await browser.close();
}