# Deployment Guide

BriefForge is local-first software. It can run on a private machine, a small VPS, or a Node-capable hosting platform, but the default SQLite storage is best for one running instance at a time.

## Required Runtime

- Node.js 24 or 25
- pnpm 10 or newer
- Server-side access to at least one AI provider key

## Environment Variables

| Variable | Required | Notes |
| --- | --- | --- |
| `AI_PROVIDER` | No | Default UI provider: `openai`, `deepseek`, or `openrouter`. |
| `OPENAI_API_KEY` | When using OpenAI | Keep server-side only. |
| `OPENAI_MODEL` | No | Defaults to `gpt-4o`. |
| `OPENAI_BASE_URL` | No | Defaults to `https://api.openai.com/v1`. |
| `DEEPSEEK_API_KEY` | When using DeepSeek | Keep server-side only. |
| `DEEPSEEK_MODEL` | No | Defaults to `deepseek-v4-pro`. |
| `DEEPSEEK_BASE_URL` | No | Defaults to `https://api.deepseek.com`. |
| `OPENROUTER_API_KEY` | When using OpenRouter | Keep server-side only. |
| `OPENROUTER_MODEL` | When using OpenRouter | Exact OpenRouter model slug to use. |
| `OPENROUTER_BASE_URL` | No | Defaults to `https://openrouter.ai/api/v1`. |
| `OPENROUTER_SITE_URL` | No | Optional OpenRouter app attribution URL. |
| `OPENROUTER_APP_NAME` | No | Optional OpenRouter app attribution title. |
| `BRIEFFORGE_ACCESS_PASSWORD` | Recommended in production | Enables the private access gate. |
| `BRIEFFORGE_SESSION_SECRET` | Recommended in production | Separate random secret for signed sessions. |
| `NEXT_DIST_DIR` | No | Optional build output directory override. |

## Local or Private VPS

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

Recommended:

- Run behind HTTPS when exposed outside localhost.
- Persist the `data/` directory if you want to keep generated projects.
- Back up `data/briefforge.sqlite`, `data/*.sqlite-wal`, and `data/*.sqlite-shm` together while the app is stopped.
- Use a process manager such as systemd or PM2 for a VPS.

## Vercel or Node Hosting

BriefForge uses native `node:sqlite`, so confirm that the hosting target supports Node.js 24 and persistent local storage before deploying. Serverless environments with ephemeral filesystems are not a good fit for the current SQLite adapter.

For production hosting, prefer:

- A long-lived Node server with persistent disk for the current version.
- Postgres for multi-instance or serverless deployments.
- Redis or Upstash for shared rate limiting.
- A queue for long AI generation tasks when multiple users are expected.

## Security Defaults

The app sets global browser security headers:

- Content Security Policy
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`
- Frame protection via CSP `frame-ancestors` and `X-Frame-Options`
- HSTS in production

The CSP intentionally allows inline scripts/styles needed by the current Next.js runtime and Tailwind setup. Tighten it further only after validating the production build in a browser.

## Scale-Up Path

1. Keep the current local-first setup for personal use and demos.
2. Move rate limits from memory to Redis/Upstash before running multiple instances.
3. Move project storage from SQLite to Postgres before multi-user production.
4. Add background jobs for generation/regeneration so provider latency does not hold request threads.
5. Add user accounts and per-user project ownership when the app becomes a shared SaaS.
