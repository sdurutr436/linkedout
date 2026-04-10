# Contributing to LinkedOut

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/sdurutr436/linkedout.git
cd linkedout

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env
# Fill in your values in .env

# 4. Initialize the database
mkdir -p data
npx prisma migrate dev

# 5. Start the development server
npm run dev
```

## Branch Strategy

- `main` — stable, deployable. **Never commit directly here.**
- `feat/<name>` — new features
- `fix/<name>` — bug fixes
- `chore/<name>` — tooling, docs, refactors

```bash
git checkout -b feat/my-feature
```

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`

Examples:
```
feat(scraper): add Infojobs location filter
fix(auth): prevent token reuse after logout
docs(api): document /api/cv/optimize endpoint
```

## Pull Request Process

1. Ensure all tests pass: `npm test`
2. Ensure the build passes: `npm run build`
3. Run the linter: `npm run lint`
4. Open a PR against `main` with a clear description of changes
5. Fill in the PR template completely
6. Request a review

## Running Tests

```bash
npm test              # Run all tests once
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## Project Structure

```
app/
  (auth)/          # Public auth routes
  (protected)/     # Protected pages (dashboard, jobs, profile, applications)
  api/             # API route handlers
lib/
  auth.ts          # JWT helpers
  db.ts            # Prisma client singleton
  logger.ts        # Pino structured logger
  cv/              # CV optimization and PDF generation
  scrapers/        # LinkedIn and Infojobs scrapers
  sheets/          # Google Sheets integration
components/        # Shared React components
tests/             # Vitest unit tests
prisma/            # Database schema and migrations
```

## Code Style

- TypeScript strict mode
- No `console.log` in production code — use `lib/logger.ts`
- All user-facing strings in Spanish; code, variables, and comments in English
- No unused imports or variables
