import { chromium, Browser, BrowserContext } from "playwright";

const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export async function launchBrowser(headless = true): Promise<{ browser: Browser; context: BrowserContext }> {
  const browser = await chromium.launch({
    headless,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-first-run",
      "--no-zygote",
    ],
  });

  const context = await browser.newContext({
    userAgent: USER_AGENT,
    viewport: { width: 1366, height: 768 },
    locale: "es-ES",
    timezoneId: "Europe/Madrid",
    extraHTTPHeaders: { "Accept-Language": "es-ES,es;q=0.9,en;q=0.8" },
  });

  // Remove primary automation signals that sites use to detect headless browsers
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    Object.defineProperty(navigator, "plugins", {
      get: () => Object.assign([1, 2, 3, 4, 5], { item: () => null, namedItem: () => null, refresh: () => {} }),
    });
    Object.defineProperty(navigator, "languages", { get: () => ["es-ES", "es", "en-US", "en"] });
    // Expose window.chrome so pages don't detect a "headless chrome" absence
    Object.assign(window, { chrome: { runtime: {}, loadTimes: () => {}, csi: () => {}, app: {} } });
  });

  return { browser, context };
}
