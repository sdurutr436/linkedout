import { chromium, Browser, BrowserContext } from "playwright";

const SCRAPER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

export async function launchBrowser(headless = true): Promise<{ browser: Browser; context: BrowserContext }> {
  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({ userAgent: SCRAPER_USER_AGENT });
  return { browser, context };
}
