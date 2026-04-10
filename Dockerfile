# ─── Stage 1: deps ───────────────────────────────────────────────────────────
FROM node:25-slim AS deps
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN npm ci --omit=dev --ignore-scripts

# Install Playwright Chromium + system deps
RUN npx playwright install chromium --with-deps

# ─── Stage 2: builder ─────────────────────────────────────────────────────────
FROM node:25-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Full install (including dev deps) with scripts so native binaries are downloaded
RUN npm ci
# package-lock.json generated on Windows doesn't include linux native binaries for lightningcss;
# install it explicitly so Tailwind/PostCSS can compile CSS on linux/x64
RUN npm install --no-save lightningcss-linux-x64-gnu

# Reuse Playwright browsers from deps stage instead of re-downloading
COPY --from=deps /root/.cache/ms-playwright /root/.cache/ms-playwright

COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js app
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DATABASE_URL="file:/data/dev.db"

RUN npm run build

# ─── Stage 3: runner ──────────────────────────────────────────────────────────
FROM node:25-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates \
    libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
    libdbus-1-3 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 \
    libxrandr2 libgbm1 libasound2 libxshmfence1 \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:/data/dev.db"

# Create volume mount point
RUN mkdir -p /data /app/uploads

# Copy playwright browsers from deps stage
COPY --from=deps /root/.cache/ms-playwright /root/.cache/ms-playwright

# Copy built app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/app/generated ./app/generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
# JS modules: deps stage has the full production tree (effect, c12, deepmerge-ts,
# empathic, mysql2, postgres…) installed with npm ci --omit=dev --ignore-scripts.
COPY --from=deps /app/node_modules ./node_modules
# Prisma engine binaries are downloaded by postinstall scripts that --ignore-scripts
# skipped in the deps stage — take them from builder where scripts did run.
COPY --from=builder /app/node_modules/@prisma/engines ./node_modules/@prisma/engines

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "server.js"]
