import playwright from "playwright";
async function a(){
  const browser = await playwright.chromium.connectOverCDP(
    "ws://156.67.214.204:3004/",
  );
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto("https://www.example.com/");
  await page.screenshot({ path: "cdp.png" });
  
  await browser.close();
}
a()