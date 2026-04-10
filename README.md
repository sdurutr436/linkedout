# LinkedOut

> Automate your job search on LinkedIn and Infojobs — AI-powered CV optimization, one-click applications, and a full tracking dashboard.

[![CI](https://github.com/sdurutr436/linkedout/actions/workflows/ci.yml/badge.svg)](https://github.com/sdurutr436/linkedout/actions/workflows/ci.yml)
[![Docker](https://github.com/sdurutr436/linkedout/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/sdurutr436/linkedout/actions/workflows/docker-publish.yml)
[![Security Scan](https://github.com/sdurutr436/linkedout/actions/workflows/trivy.yml/badge.svg)](https://github.com/sdurutr436/linkedout/actions/workflows/trivy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Features

| Feature | Description |
|---------|-------------|
| 🔐 **Auth** | JWT-based login with bcrypt passwords and `HttpOnly` session cookies |
| 📄 **Profile** | Upload your CV, titulaciones, and work experience |
| 🔍 **Job Search** | Scrape LinkedIn and Infojobs based on your preferences |
| 🤖 **CV Optimizer** | Claude AI generates a tailored Markdown CV per job offer |
| 📥 **Download** | Export the optimized CV as `.md` or PDF |
| 📨 **Apply** | LinkedIn Easy Apply automation (skips external portals) |
| 📊 **Applications** | Full CRUD table with status tracking (sent / rejected / accepted) |
| 📑 **Google Sheets** | Auto-sync every application to a shared spreadsheet |
| 🐳 **Docker** | One-command deploy with persistent data volumes |
| 🛡️ **Security** | Security headers, CORS, rate limiting, Trivy scanning |

---

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router, TypeScript)
- **Database**: SQLite via [Prisma 7](https://prisma.io)
- **Auth**: [jose](https://github.com/panva/jose) JWT + bcryptjs
- **AI**: [Anthropic Claude](https://anthropic.com) (`claude-opus-4-6`)
- **Browser automation**: [Playwright](https://playwright.dev) (scraping + PDF)
- **Sheets**: [googleapis](https://github.com/googleapis/google-api-nodejs-client)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **Logging**: [Pino](https://getpino.io)
- **Tests**: [Vitest](https://vitest.dev)

---

## Quick Start

### Prerequisites

- Node.js 22+
- Anthropic API key (for CV optimization)
- Google service account JSON (optional, for Sheets sync)

### Local development

```bash
# 1. Clone
git clone https://github.com/sdurutr436/linkedout.git
cd linkedout

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your values

# 4. Set up database
mkdir -p data
npx prisma migrate dev

# 5. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and register your account.

### Docker

```bash
# Copy and fill environment variables
cp .env.example .env

# Build and start
docker compose up -d

# View logs
docker compose logs -f linkedout
```

Data is persisted in named Docker volumes (`linkedout_data`, `linkedout_uploads`).

---

## Configuration

See [`.env.example`](.env.example) for all variables with explanations.

Key variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | SQLite file path |
| `JWT_SECRET` | ✅ | Long random string for JWT signing |
| `ANTHROPIC_API_KEY` | ✅ | For CV optimization |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Optional | Google Sheets sync |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Optional | Google Sheets sync |
| `GOOGLE_SHEETS_ID` | Optional | Target spreadsheet ID |

---

## Scripts

```bash
npm run dev           # Development server
npm run build         # Production build
npm run start         # Start production server
npm run lint          # ESLint
npm test              # Run tests (Vitest)
npm run test:coverage # Coverage report
```

---

## Documentation

See the [`DOCS/`](DOCS/) folder for:
- [Architecture overview](DOCS/architecture.md)
- [API reference](DOCS/api-reference.md)
- [Deployment guide](DOCS/deployment.md)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Please read our [Code of Conduct](CODE_OF_CONDUCT.md).

## Security

See [SECURITY.md](SECURITY.md) for the vulnerability disclosure process.

## License

[MIT](LICENSE) — Copyright © 2026 sdurutr436
