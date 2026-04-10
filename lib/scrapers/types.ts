export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  jobType?: string;
  description: string;
  url: string;
  platform: "linkedin" | "infojobs";
  postedAt?: string;
  contactPerson?: string;
  isEasyApply?: boolean;
}

export interface ScraperCredentials {
  email: string;
  password: string;
}

export interface SearchParams {
  keywords: string;
  location?: string;
  jobType?: string;
  salaryMin?: number;
  maxResults?: number;
}

export interface JobScraper {
  search(params: SearchParams, credentials: ScraperCredentials): Promise<JobListing[]>;
  apply(jobUrl: string, credentials: ScraperCredentials, cvPdfPath: string): Promise<boolean>;
}
