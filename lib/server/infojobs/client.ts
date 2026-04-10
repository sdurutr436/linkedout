import type { JobListing, SearchParams } from "../scrapers/types";
import { ExternalServiceError } from "../errors";
import logger from "../logger";

const BASE_URL = "https://api.infojobs.net";

function appBasicAuth(): string {
  const id = process.env.INFOJOBS_CLIENT_ID ?? "";
  const secret = process.env.INFOJOBS_CLIENT_SECRET ?? "";
  return `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`;
}

function userAuth(accessToken: string): string {
  const id = process.env.INFOJOBS_CLIENT_ID ?? "";
  // Infojobs user auth: Basic base64(client_id:access_token)
  return `Basic ${Buffer.from(`${id}:${accessToken}`).toString("base64")}`;
}

interface InfojobsOffer {
  id: string;
  title: string;
  link: string;
  city?: { value: string };
  province?: { value: string };
  company?: { name: string };
  salary?: { description: string };
  published?: string;
  requirementMin?: string;
  applications?: number;
}

export async function searchJobs(params: SearchParams): Promise<JobListing[]> {
  const auth = appBasicAuth();
  const url = new URL(`${BASE_URL}/api/9/offer`);
  url.searchParams.set("q", params.keywords);
  if (params.location) url.searchParams.set("province", params.location);
  url.searchParams.set("maxResults", String(params.maxResults ?? 20));
  url.searchParams.set("page", "1");

  logger.info({ url: url.toString(), keywords: params.keywords }, "infojobs api search");

  const res = await fetch(url.toString(), {
    headers: { Authorization: auth, "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    logger.error({ status: res.status, body }, "infojobs search failed");
    throw new ExternalServiceError("Infojobs", `Search failed: ${res.status}`);
  }

  const data = (await res.json()) as { items?: InfojobsOffer[] };

  return (data.items ?? []).map((offer) => ({
    id: `infojobs-${offer.id}`,
    title: offer.title,
    company: offer.company?.name ?? "",
    location: offer.city?.value ?? offer.province?.value ?? "",
    salary: offer.salary?.description,
    description: offer.requirementMin ?? "",
    url: offer.link,
    platform: "infojobs" as const,
    postedAt: offer.published,
    isEasyApply: true,
  }));
}

export async function applyToJob(offerId: string, accessToken: string): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/api/9/offer/${offerId}/application`, {
    method: "POST",
    headers: {
      Authorization: userAuth(accessToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    logger.error({ status: res.status, offerId }, "infojobs apply failed");
    return false;
  }

  return true;
}
