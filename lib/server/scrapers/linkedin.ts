import { Page } from "playwright";
import type { JobListing, ScraperCredentials, SearchParams, JobScraper } from "./types";
import { launchBrowser } from "./browser";
import logger from "../logger";

async function login(page: Page, credentials: ScraperCredentials): Promise<void> {
  await page.goto("https://www.linkedin.com/login", { waitUntil: "networkidle" });
  await page.fill("#username", credentials.email);
  await page.fill("#password", credentials.password);
  await page.click('[data-litms-control-urn="login-submit"]');
  await page.waitForURL("**/feed/**", { timeout: 15000 });
}

async function searchJobs(page: Page, params: SearchParams): Promise<JobListing[]> {
  const keywords = encodeURIComponent(params.keywords);
  const location = encodeURIComponent(params.location ?? "");
  const jobTypeMap: Record<string, string> = {
    fulltime: "F",
    parttime: "P",
    contract: "C",
    internship: "I",
  };
  const fJT = params.jobType ? `&f_JT=${jobTypeMap[params.jobType] ?? "F"}` : "";
  const url = `https://www.linkedin.com/jobs/search/?keywords=${keywords}&location=${location}${fJT}&f_LF=f_AL`;

  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  const maxResults = params.maxResults ?? 20;
  const jobs: JobListing[] = [];

  // Scroll to load more results
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);
  }

  const jobCards = await page.locator(".jobs-search__results-list li, .scaffold-layout__list-item").all();

  for (const card of jobCards.slice(0, maxResults)) {
    try {
      const title = await card.locator(".base-search-card__title, .job-card-list__title").textContent();
      const company = await card.locator(".base-search-card__subtitle, .job-card-container__company-name").textContent();
      const location = await card.locator(".job-search-card__location, .job-card-container__metadata-item").textContent();
      const href = await card.locator("a.base-card__full-link, a.job-card-list__title").getAttribute("href");
      const jobId = href?.match(/\/jobs\/view\/(\d+)/)?.[1] ?? String(Date.now());

      if (!title || !company || !href) continue;

      jobs.push({
        id: `linkedin-${jobId}`,
        title: title.trim(),
        company: company.trim(),
        location: location?.trim() ?? "",
        description: "",
        url: href.split("?")[0],
        platform: "linkedin",
      });
    } catch {
      // skip malformed card
    }
  }

  return jobs;
}

class LinkedInScraper implements JobScraper {
  async search(params: SearchParams, credentials: ScraperCredentials): Promise<JobListing[]> {
    const { browser, context } = await launchBrowser(true);
    const page = await context.newPage();

    try {
      await login(page, credentials);
      const jobs = await searchJobs(page, params);
      return jobs;
    } finally {
      await browser.close();
    }
  }

  async apply(jobUrl: string, credentials: ScraperCredentials, cvPdfPath: string): Promise<boolean> {
    const { browser, context } = await launchBrowser(false);
    const page = await context.newPage();

    try {
      await login(page, credentials);
      await page.goto(jobUrl, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(2000);

      // Only support Easy Apply
      const easyApplyBtn = page.locator(".jobs-apply-button--top-card .jobs-apply-button").first();
      const btnText = await easyApplyBtn.textContent().catch(() => "");
      if (!btnText?.toLowerCase().includes("easy")) {
        // External application portal — skip per product spec
        logger.info({ jobUrl }, "offer redirects to external portal — skipped");
        return false;
      }

      await easyApplyBtn.click();
      await page.waitForTimeout(1500);

      // Handle multi-step Easy Apply modal
      let step = 0;
      while (step < 10) {
        const nextBtn = page.locator(
          "button[aria-label='Continue to next step'], button[aria-label='Review your application']"
        );
        const submitBtn = page.locator("button[aria-label='Submit application']");

        const submitVisible = await submitBtn.isVisible().catch(() => false);
        if (submitVisible) {
          await submitBtn.click();
          await page.waitForTimeout(2000);
          return true;
        }

        const nextVisible = await nextBtn.isVisible().catch(() => false);
        if (!nextVisible) break;

        await nextBtn.click();
        await page.waitForTimeout(1000);
        step++;
      }

      return false;
    } finally {
      await browser.close();
    }
  }
}

export const linkedInScraper = new LinkedInScraper();
