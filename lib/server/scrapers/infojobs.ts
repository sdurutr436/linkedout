import { Page } from "playwright";
import type { JobListing, ScraperCredentials, SearchParams, JobScraper } from "./types";
import { launchBrowser } from "./browser";

async function login(page: Page, credentials: ScraperCredentials): Promise<void> {
  await page.goto("https://www.infojobs.net/candidate/login.xhtml", { waitUntil: "domcontentloaded" });
  await page.fill("#email", credentials.email);
  await page.fill("#password", credentials.password);
  await page.click('[id="loginButton"]');
  await page.waitForURL("**/candidate/**", { timeout: 15000 });
}

async function searchJobs(page: Page, params: SearchParams): Promise<JobListing[]> {
  const keywords = encodeURIComponent(params.keywords);
  const location = encodeURIComponent(params.location ?? "");
  const url = `https://www.infojobs.net/jobsearch/search-results/list.xhtml?keyword=${keywords}&province=${location}`;

  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  const maxResults = params.maxResults ?? 20;
  const jobs: JobListing[] = [];

  // Accept cookies if banner appears
  await page.locator("#didomi-notice-agree-button").click().catch(() => {});
  await page.waitForTimeout(500);

  const jobCards = await page.locator("li.ij-JobList-item").all();

  for (const card of jobCards.slice(0, maxResults)) {
    try {
      const titleEl = card.locator("h2.ij-OfferCard-title a");
      const title = await titleEl.textContent();
      const href = await titleEl.getAttribute("href");
      const company = await card.locator(".ij-OfferCard-company-name").textContent();
      const location = await card.locator(".ij-OfferCard-caption").first().textContent();
      const salary = await card
        .locator(".ij-OfferCard-salary")
        .textContent()
        .catch(() => undefined);
      const jobId = href?.match(/\/(\d+)\//)?.[1] ?? String(Date.now());

      if (!title || !href) continue;

      jobs.push({
        id: `infojobs-${jobId}`,
        title: title.trim(),
        company: company?.trim() ?? "",
        location: location?.trim() ?? "",
        salary: salary?.trim(),
        description: "",
        url: `https://www.infojobs.net${href}`,
        platform: "infojobs",
        isEasyApply: true,
      });
    } catch {
      // skip
    }
  }

  return jobs;
}

class InfojobsScraper implements JobScraper {
  async search(params: SearchParams, credentials: ScraperCredentials): Promise<JobListing[]> {
    const { browser, context } = await launchBrowser(true);
    const page = await context.newPage();

    try {
      await login(page, credentials);
      return await searchJobs(page, params);
    } finally {
      await browser.close();
    }
  }

  async apply(jobUrl: string, credentials: ScraperCredentials, _cvPdfPath: string): Promise<boolean> {
    const { browser, context } = await launchBrowser(false);
    const page = await context.newPage();

    try {
      await login(page, credentials);
      await page.goto(jobUrl, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(2000);

      const applyBtn = page.locator("button#applyButton, a[id='applyButton']").first();
      const visible = await applyBtn.isVisible().catch(() => false);
      if (!visible) return false;

      await applyBtn.click();
      await page.waitForTimeout(2000);

      // Submit the Infojobs quick-apply form
      const submitBtn = page.locator("button[type='submit']").last();
      await submitBtn.click();
      await page.waitForTimeout(2000);

      return true;
    } finally {
      await browser.close();
    }
  }
}

export const infojobsScraper = new InfojobsScraper();
