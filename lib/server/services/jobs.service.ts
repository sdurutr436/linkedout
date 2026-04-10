import { linkedInScraper } from "../scrapers/linkedin";
import { infojobsScraper } from "../scrapers/infojobs";
import { ValidationError, ExternalServiceError } from "../errors";
import { ProfileService } from "./profile.service";
import logger from "../logger";
import type { z } from "zod";
import type { searchJobsSchema } from "../validation/schemas";

export const JobsService = {
  async search(userId: string, input: z.infer<typeof searchJobsSchema>) {
    const profile = await ProfileService.getOrThrow(userId);

    const params = {
      keywords: input.keywords,
      location: input.location,
      jobType: input.jobType,
      maxResults: input.maxResults,
    };

    if (input.platform === "infojobs") {
      if (!profile.infojobsEmail || !profile.infojobsPassword) {
        throw new ValidationError("Configure your Infojobs credentials in your profile first");
      }

      logger.info({ platform: "infojobs", keywords: params.keywords }, "starting job search");

      try {
        return await infojobsScraper.search(params, {
          email: profile.infojobsEmail,
          password: profile.infojobsPassword,
        });
      } catch (err) {
        logger.error({ err, platform: "infojobs" }, "scraper error");
        throw new ExternalServiceError("Infojobs", "Failed to retrieve job listings. Check your credentials.");
      }
    }

    // Default: LinkedIn
    if (!profile.linkedinEmail || !profile.linkedinPassword) {
      throw new ValidationError("Configure your LinkedIn credentials in your profile first");
    }

    logger.info({ platform: "linkedin", keywords: params.keywords }, "starting job search");

    try {
      return await linkedInScraper.search(params, {
        email: profile.linkedinEmail,
        password: profile.linkedinPassword,
      });
    } catch (err) {
      logger.error({ err, platform: "linkedin" }, "scraper error");
      throw new ExternalServiceError("LinkedIn", "Failed to retrieve job listings. Check your credentials.");
    }
  },
};
