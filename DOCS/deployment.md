# Deployment Guide

## Local Development

```bash
git clone https://github.com/sdurutr436/linkedout.git
cd linkedout
npm install
cp .env.example .env   # fill in values
mkdir -p data
npx prisma migrate dev
npm run dev            # http://localhost:3000
```

## Docker (recommended for production)

### Prerequisites
- Docker Engine 24+
- Docker Compose v2

### Steps

```bash
# 1. Clone and configure
git clone https://github.com/sdurutr436/linkedout.git
cd linkedout
cp .env.example .env
# Edit .env — at minimum: JWT_SECRET and ANTHROPIC_API_KEY

# 2. Build and start
docker compose up -d

# 3. View logs
docker compose logs -f linkedout

# 4. Stop
docker compose down
```

### Persistent volumes

| Volume | Mount | Contents |
|--------|-------|----------|
| `linkedout_data` | `/data` | SQLite database |
| `linkedout_uploads` | `/app/uploads` | Uploaded files |

To back up data:
```bash
docker run --rm -v linkedout_data:/data -v $(pwd):/backup alpine \
  tar czf /backup/linkedout-backup.tar.gz /data
```

## Environment Variables

See [`.env.example`](../.env.example) for a full reference.

Minimum required for production:

```env
DATABASE_URL=file:/data/dev.db
JWT_SECRET=<64-char random string>
ANTHROPIC_API_KEY=<your key>
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

Generate a secure secret:
```bash
openssl rand -base64 64
```

## Google Sheets Integration (optional)

1. Create a project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable the **Google Sheets API**
3. Create a **Service Account** and download the JSON key
4. Share your target spreadsheet with the service account email (Editor role)
5. Set in `.env`:
   ```env
   GOOGLE_SERVICE_ACCOUNT_EMAIL=linkedout@my-project.iam.gserviceaccount.com
   GOOGLE_SERVICE_ACCOUNT_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
   GOOGLE_SHEETS_ID=<spreadsheet-id-from-url>
   ```

## HTTPS

For production, place a reverse proxy (Nginx, Caddy, Traefik) in front of the app.

**Caddy example** (`/etc/caddy/Caddyfile`):
```
your-domain.com {
    reverse_proxy localhost:3000
}
```

Caddy handles HTTPS certificates automatically via Let's Encrypt.
