# Security Policy

## Supported Versions

Security fixes are accepted for the current `main` branch.

## Deployment Safety

BriefForge is local-first by default. If you expose it outside your own machine, set `BRIEFFORGE_ACCESS_PASSWORD` and keep API keys in server-side environment variables only. Public `/share/...` links are designed to be read-only.

Access sessions use signed, expiring, HTTP-only cookies. Project API routes and AI-generation routes include in-memory rate limits to reduce accidental abuse on single-instance deployments.

## Production Checklist

- Set `BRIEFFORGE_ACCESS_PASSWORD` to a long, unique value.
- Set `BRIEFFORGE_SESSION_SECRET` to a separate long random value.
- Keep `OPENAI_API_KEY` and `DEEPSEEK_API_KEY` server-side only.
- Serve the app behind HTTPS in production.
- Keep `.env`, `data/`, logs, and build output out of Git.
- Use a single Node process with SQLite, or migrate storage before running multiple app instances.
- Replace the in-memory rate limiter with Redis/Upstash before horizontal scaling.
- Review public share links before distributing them; they are intentionally read-only but accessible to anyone with the URL.

## Reporting a Vulnerability

Please do not open a public issue for a suspected vulnerability.

Send a private report to Fernando de Oliveira through https://fernandodeoliveira.pro with:

- Affected route, component, or file.
- Steps to reproduce.
- Expected impact.
- Any relevant logs or screenshots, with secrets removed.

## Sensitive Data

Never commit:

- `.env` files
- API keys
- `data/briefforge.sqlite`
- `data/*.sqlite-wal`
- `data/*.sqlite-shm`
- build output
- logs

BriefForge stores generated projects locally in SQLite under `data/`. This local database is ignored by Git and should not be published.
