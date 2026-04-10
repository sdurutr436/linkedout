#!/bin/sh
set -e

echo "[LinkedOut] Running database migrations..."
node node_modules/prisma/build/index.js migrate deploy

echo "[LinkedOut] Starting application..."
exec "$@"
