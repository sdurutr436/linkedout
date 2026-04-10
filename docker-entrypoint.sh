#!/bin/sh
set -e

echo "[LinkedOut] Running database migrations..."
npx prisma migrate deploy

echo "[LinkedOut] Starting application..."
exec "$@"
