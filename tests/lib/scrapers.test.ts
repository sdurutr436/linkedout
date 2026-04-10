import { describe, it, expect } from "vitest";
import type { JobListing, SearchParams, ScraperCredentials, JobScraper } from "@/lib/server/scrapers/types";

describe("Scraper types contract", () => {
  it("JobListing has required fields", () => {
    const job: JobListing = {
      id: "linkedin-123",
      title: "Software Engineer",
      company: "Acme Corp",
      location: "Madrid",
      description: "Build cool stuff",
      url: "https://linkedin.com/jobs/view/123",
      platform: "linkedin",
    };
    expect(job.id).toBe("linkedin-123");
    expect(job.platform).toBe("linkedin");
  });

  it("SearchParams allows optional fields", () => {
    const params: SearchParams = { keywords: "React" };
    expect(params.keywords).toBe("React");
    expect(params.location).toBeUndefined();
  });

  it("ScraperCredentials requires email and password", () => {
    const creds: ScraperCredentials = {
      email: "user@example.com",
      password: "secret",
    };
    expect(creds.email).toBeTruthy();
    expect(creds.password).toBeTruthy();
  });

  it("JobScraper interface is satisfied by a mock", () => {
    const mockScraper: JobScraper = {
      search: async (_params, _creds) => [],
      apply: async (_url, _creds, _cv) => false,
    };
    expect(typeof mockScraper.search).toBe("function");
    expect(typeof mockScraper.apply).toBe("function");
  });

  it("platform field is correctly typed", () => {
    const platforms: Array<JobListing["platform"]> = ["linkedin", "infojobs"];
    expect(platforms).toHaveLength(2);
  });
});
