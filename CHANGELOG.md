# Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

## [0.1.0] — 2026-04-10

### Added
- **Auth system**: JWT-based login/register with `HttpOnly` cookies, bcrypt password hashing
- **Protected routing**: Next.js middleware guards all protected pages and API routes
- **Profile module**: Upload CV (text/markdown), titulaciones, experiencia; store LinkedIn and Infojobs credentials and search preferences
- **LinkedIn scraper**: Playwright-based job search and Easy Apply automation
- **Infojobs scraper**: Modular scraper following the same `JobScraper` interface
- **CV Optimizer**: Claude API (`claude-opus-4-6`) generates tailored markdown CVs per job offer
- **PDF generation**: Playwright renders markdown CVs to PDF for download
- **Applications table**: Full CRUD with status management (`enviado` / `rechazado` / `aceptado`) and filtering
- **Google Sheets sync**: Automatic row append on application submission via service account
- **Security**: Security headers (CSP, X-Frame-Options, …), CORS, in-memory rate limiting (60 req/min/IP)
- **Observability**: Structured JSON logging with Pino
- **Docker**: Multi-stage `Dockerfile` + `docker-compose.yml` with named persistent volumes for DB and uploads
- **CI/CD**: GitHub Actions for lint + test + build on every push; Docker image publish to GHCR on `main`
- **Security scanning**: Trivy filesystem and image scans on PRs and `main`
- **Dependabot**: Automated weekly updates for npm, Docker, and GitHub Actions dependencies
- **Tests**: 14 unit tests (Vitest) covering auth helpers, scraper type contracts, and CV optimizer
