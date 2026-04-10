# Architecture

## Overview

LinkedOut is a full-stack Next.js 16 application (App Router) running on a single Node.js process. It uses SQLite for local storage and Playwright for browser automation.

## High-Level Architecture

```
Browser (User)
      │
      ▼
┌─────────────────────────────────────────────────┐
│               Next.js 16 App Router             │
│                                                 │
│  ┌─────────────┐    ┌─────────────────────────┐ │
│  │  Pages/UI   │    │      API Routes          │ │
│  │ (protected) │    │  /api/auth/*             │ │
│  │             │    │  /api/profile            │ │
│  │ /dashboard  │    │  /api/jobs               │ │
│  │ /jobs       │    │  /api/cv/optimize        │ │
│  │ /profile    │    │  /api/cv/[id]            │ │
│  │ /applications│   │  /api/applications/*     │ │
│  └─────────────┘    └──────────┬──────────────┘ │
│                                │                 │
│  ┌─────────────────────────────▼──────────────┐  │
│  │               Library Layer                 │  │
│  │  lib/auth.ts    lib/db.ts    lib/logger.ts  │  │
│  │  lib/scrapers/  lib/cv/      lib/sheets/    │  │
│  └─────┬──────────────┬─────────────┬─────────┘  │
└────────│──────────────│─────────────│────────────┘
         │              │             │
    ┌────▼────┐   ┌─────▼─────┐  ┌───▼──────────┐
    │ SQLite  │   │ Playwright │  │ External APIs│
    │ (Prisma)│   │ Browser   │  │ - Anthropic  │
    └─────────┘   └─────┬─────┘  │ - Google     │
                        │         └──────────────┘
                   ┌────▼──────────┐
                   │  LinkedIn.com │
                   │  Infojobs.net │
                   └───────────────┘
```

## Middleware

Every request passes through `middleware.ts` which:
1. Applies security headers (CSP, X-Frame-Options, …)
2. Rate limits API routes (60 req/min/IP, in-memory)
3. Validates the JWT session cookie
4. Redirects unauthenticated requests to `/login`

## Authentication Flow

```
POST /api/auth/login
  → bcrypt.compare(password, hash)
  → signToken(payload)  [jose, HS256, 7d TTL]
  → Set-Cookie: linkedout_token=<JWT>; HttpOnly; SameSite=Lax
```

## Scraper Architecture

Both LinkedIn and Infojobs scrapers implement the `JobScraper` interface:

```typescript
interface JobScraper {
  search(params: SearchParams, credentials: ScraperCredentials): Promise<JobListing[]>
  apply(jobUrl: string, credentials: ScraperCredentials, cvPdfPath: string): Promise<boolean>
}
```

Each scraper launches a Playwright Chromium browser, logs in, and performs DOM operations. The `apply` method only proceeds for native platform applications (LinkedIn Easy Apply, Infojobs quick apply) — it skips any offer that redirects to an external portal.

## CV Optimization Pipeline

```
User clicks "Optimize & Apply"
  │
  ▼
POST /api/cv/optimize
  → Fetch user profile (CV, titulaciones, experiencia)
  → Claude API: generate tailored Markdown CV
  → Store in OptimizedCV table
  │
  ▼
GET /api/cv/[id]?format=pdf
  → marked: Markdown → HTML
  → Playwright: HTML → PDF buffer
  → Return as attachment
```

## Database Schema

```
User (1) ──── (1) Profile
  │
  ├──── (n) Application ──── (0|1) OptimizedCV
  └──── (n) OptimizedCV
```

## Technical Decisions

| Decision | Rationale |
|----------|-----------|
| SQLite | Zero-config, perfect for single-user local deployment |
| Playwright over Puppeteer | Better API, cross-browser support, actively maintained |
| In-memory rate limiting | Simple; sufficient for single-instance deployment |
| JWT in cookies | Simpler than session stores for a self-hosted single-user app |
| `output: standalone` | Required for minimal Docker image without `node_modules` copy |
| Pino logger | Structured JSON logging; negligible overhead |
