# LifeSync 2.0 — Deployment Guide

> Industry-standard deployment guide for development, staging, and production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Production Build](#production-build)
- [Deployment Options](#deployment-options)
  - [Vercel (Frontend + API)](#vercel-frontend--api)
  - [Node.js Server (Self-Hosted)](#nodejs-server-self-hosted)
  - [Docker](#docker)
- [Database Setup](#database-setup)
- [Supabase Configuration](#supabase-configuration)
- [Health Checks & Monitoring](#health-checks--monitoring)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool       | Version  | Purpose                        |
| ---------- | -------- | ------------------------------ |
| Node.js    | ≥ 20.x   | Runtime                        |
| npm        | ≥ 10.x   | Package manager                |
| Git        | ≥ 2.x    | Version control                |
| PostgreSQL | ≥ 15     | Database (via Neon or local)   |

---

## Environment Variables

Create a `.env` file in the project root based on `.env.example`:

```bash
# Supabase Authentication
VITE_SUPABASE_PROJECT_ID="your_project_id"
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

### Variable Reference

| Variable                        | Required | Client/Server | Description                        |
| ------------------------------- | -------- | ------------- | ---------------------------------- |
| `VITE_SUPABASE_URL`             | ✅       | Both          | Supabase project URL               |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ✅       | Client        | Supabase anon/public key           |
| `SUPABASE_SERVICE_ROLE_KEY`     | ✅       | Server only   | Supabase admin key (for registration) |
| `VITE_SUPABASE_PROJECT_ID`      | ❌       | Client        | Supabase project identifier        |
| `DATABASE_URL`                  | ❌*      | Server only   | PostgreSQL connection string       |

> *`DATABASE_URL` is optional — without it, the server uses in-memory storage (data lost on restart).

**Security note:** Variables prefixed with `VITE_` are exposed to the client bundle. Never prefix secret keys with `VITE_`.

---

## Local Development

### 1. Install Dependencies

```bash
git clone https://github.com/aditikale02/LifeSync2.0.git
cd LifeSync2.0
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your Supabase and database credentials
```

### 3. Start Development Server

```bash
npm run dev
```

This starts both the Express backend and Vite frontend on **port 5000** with hot module replacement (HMR).

### 4. Access the Application

Open `http://localhost:5000` in your browser.

### Available Scripts

| Script           | Command                  | Description                               |
| ---------------- | ------------------------ | ----------------------------------------- |
| `npm run dev`    | `tsx server/index.ts`    | Start dev server with HMR (port 5000)     |
| `npm run build`  | `vite build`             | Build frontend for production             |
| `npm run build:server` | `esbuild server/index.ts ...` | Bundle server for production    |
| `npm run start`  | `node dist-server/index.js` | Start production server                |
| `npm run check`  | `tsc`                    | TypeScript type checking                  |
| `npm run db:push`| `drizzle-kit push`       | Push schema changes to database           |

---

## Production Build

### Step 1: Build Frontend

```bash
npm run build
```

Output: `dist/` directory with optimized static assets.

### Step 2: Build Server

```bash
npm run build:server
```

Output: `dist-server/index.js` (ESM bundle with external packages).

### Step 3: Start Production Server

```bash
NODE_ENV=production npm run start
```

The production server:
- Serves the built frontend from `dist/`.
- Runs the Express API.
- Listens on port 5000 (or `PORT` env var).

---

## Deployment Options

### Vercel (Frontend + API)

The project includes `vercel.json` for Vercel deployment.

#### Configuration (`vercel.json`)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

#### Steps

1. Connect your GitHub repository to Vercel.
2. Set environment variables in the Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`
3. Deploy — Vercel will automatically build and serve the frontend.

> **Note:** The current `vercel.json` rewrites all paths to `index.html` for SPA routing. For server-side API routes, consider using Vercel Serverless Functions or deploying the backend separately.

---

### Node.js Server (Self-Hosted)

For traditional server deployment (VPS, AWS EC2, DigitalOcean, etc.):

#### Steps

```bash
# 1. Clone and install
git clone https://github.com/aditikale02/LifeSync2.0.git
cd LifeSync2.0
npm ci --production=false

# 2. Build
npm run build
npm run build:server

# 3. Set environment variables
export DATABASE_URL="postgresql://..."
export VITE_SUPABASE_URL="https://..."
export VITE_SUPABASE_PUBLISHABLE_KEY="..."
export SUPABASE_SERVICE_ROLE_KEY="..."
export NODE_ENV=production

# 4. Start
npm run start
```

#### Process Management with PM2

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start dist-server/index.js --name lifesync

# Enable startup on reboot
pm2 startup
pm2 save
```

#### Reverse Proxy with Nginx

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

### Docker

#### Dockerfile

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm run build:server

# Stage 2: Production
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "dist-server/index.js"]
```

#### Docker Compose

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_PUBLISHABLE_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    restart: unless-stopped
```

#### Build & Run

```bash
# Build image
docker build -t lifesync .

# Run container
docker run -p 5000:5000 --env-file .env lifesync
```

---

## Database Setup

### Option A: Neon PostgreSQL (Recommended)

1. Create a project at [neon.tech](https://neon.tech).
2. Copy the connection string from the Neon dashboard.
3. Set `DATABASE_URL` in your `.env` file.
4. Push the schema:

```bash
npm run db:push
```

### Option B: Local PostgreSQL

1. Install PostgreSQL locally.
2. Create a database:

```bash
createdb lifesync
```

3. Set `DATABASE_URL`:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/lifesync"
```

4. Push the schema:

```bash
npm run db:push
```

### Option C: No Database (Development Only)

Leave `DATABASE_URL` unset. The server will use `MemStorage` (in-memory). Data is lost on server restart.

---

## Supabase Configuration

### 1. Create a Supabase Project

Go to [supabase.com](https://supabase.com) and create a new project.

### 2. Get API Keys

From **Project Settings → API**:

- **URL** → `VITE_SUPABASE_URL`
- **anon/public key** → `VITE_SUPABASE_PUBLISHABLE_KEY`
- **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Configure Authentication

From **Authentication → Providers**:

- Enable **Email** authentication.
- Optionally disable email confirmation for development:
  - Go to **Authentication → Email Auth**.
  - Toggle **"Confirm email"** to OFF.

### 4. Rate Limits

If you encounter "Email rate limit exceeded":

- Go to **Project Settings → Authentication → Email Outgoing → Rate Limits Configuration**.
- Increase the limits for development.

---

## Health Checks & Monitoring

### Basic Health Check

The API can be tested with any wellness endpoint:

```bash
curl http://localhost:5000/api/wellness-summary/test-user?days=7
```

A successful response confirms the server is running.

### Monitoring Recommendations

| Tool          | Purpose                              |
| ------------- | ------------------------------------ |
| PM2           | Process management & restart         |
| Uptime Robot  | External uptime monitoring           |
| Sentry        | Error tracking (add as needed)       |
| Neon Dashboard| Database metrics & query performance |

---

## Troubleshooting

### Common Issues

| Issue                                | Solution                                          |
| ------------------------------------ | ------------------------------------------------- |
| `DATABASE_URL, ensure the database is provisioned` | Set `DATABASE_URL` in `.env` or leave unset for in-memory mode |
| Supabase URL or Anon Key is missing  | Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env` |
| Email rate limit exceeded            | Increase Supabase email rate limits (see above)   |
| Port 5000 already in use             | Kill the existing process or change port           |
| `MODULE_NOT_FOUND` on production     | Run `npm ci` before building                       |
| CORS errors                          | Ensure frontend and backend are on the same origin |
| Database connection refused           | Check `DATABASE_URL` format and network access     |

### Debug Mode

For verbose logging during development:

```bash
NODE_ENV=development npm run dev
```

The Express server logs all API requests with method, path, status code, and response time.

---

*See also: [Architecture](./ARCHITECTURE.md) · [API Documentation](./API_DOCUMENTATION.md) · [Project Structure](./PROJECT_STRUCTURE.md)*
