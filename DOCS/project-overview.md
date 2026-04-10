# Project Overview — LinkedOut

## What is LinkedOut?

LinkedOut is a **personal job application automation tool** built as a self-hosted web application. It allows a job seeker to manage their entire application pipeline from a single interface: discover relevant offers, generate tailored CVs using AI, apply automatically, and track every interaction in a structured database and a Google Sheets spreadsheet.

The name is a play on "LinkedIn" + "out" — automating the way out of manual, repetitive job applications.

---

## The Problem It Solves

Applying for jobs in 2026 is time-consuming and repetitive:
- The same CV gets copy-pasted across dozens of applications with minimal customization
- Tracking applications across platforms (LinkedIn, Infojobs) is done in scattered spreadsheets
- Each platform has its own UX for applying, wasting significant time
- There is no single view of the full pipeline: applied → waiting → rejected → accepted

LinkedOut addresses all of these with automation and a unified dashboard.

---

## What It Does

### 1. Profile management
The user uploads their base CV (text or Markdown), lists their titulaciones and work experience, and stores their LinkedIn and Infojobs credentials. These are stored locally in a SQLite database — never sent to third parties.

### 2. Job discovery
Using Playwright browser automation, LinkedOut logs into LinkedIn (or Infojobs) with the user's credentials and searches for job offers matching keywords, location, and job type. Results are displayed in an interactive list with salary, company, and Easy Apply indicators.

### 3. AI-powered CV optimization
For each job offer, the user can trigger CV optimization. LinkedOut sends the job description plus the user's profile to **Claude** (`claude-opus-4-6`) via the Anthropic API. Claude generates a Markdown CV tailored specifically to that offer, highlighting the most relevant skills and experience. The optimized CV is stored and can be downloaded as `.md` or rendered to PDF.

### 4. Automated application
LinkedOut can submit LinkedIn Easy Apply applications automatically via Playwright — filling in the multi-step modal and clicking submit. It skips any offer that redirects to an external portal (per product spec). Infojobs applications follow the same modular pattern via its own scraper.

### 5. Application tracking
Every submitted application is recorded in the local database with: company, position, platform, date, time, contact person (if visible), company summary, salary, and status. The status (`enviado`, `rechazado`, `aceptado`) can be changed at any time through the table UI. Simultaneously, a row is appended to a configured Google Sheets spreadsheet for sharing or additional analysis.

---

## Stack Summary

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.3 — App Router, Server Components, Route Handlers |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 |
| Database | SQLite via Prisma 7 — zero-config, file-based |
| Auth | jose (JWT HS256) + bcryptjs — no external auth service |
| AI | Anthropic Claude API (`claude-opus-4-6`) |
| Browser automation | Playwright (Chromium) — scraping + PDF rendering |
| Sheets | Google Sheets API v4 via googleapis |
| Logging | Pino — structured JSON logs |
| Testing | Vitest — unit tests for auth, scrapers, and CV optimizer |
| CI/CD | GitHub Actions — lint + test + build; Docker publish to GHCR |
| Security | Trivy scanning, Dependabot, security headers, rate limiting |
| Deployment | Docker + docker-compose, persistent named volumes |

---

## Intended Users

This tool is designed for **personal, single-user** self-hosted use. There is no multi-tenancy. The user registers once on their own instance and manages all data locally.

---

## What Is NOT in Scope

- Mass automated spam applying — LinkedOut is designed for **deliberate, quality applications** (one at a time)
- Offers that redirect to external application portals — skipped by design
- Platforms other than LinkedIn and Infojobs (though the modular `JobScraper` interface makes adding new platforms straightforward)
- Cloud hosting or SaaS — this is a self-hosted tool
