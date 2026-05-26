# Security Policy

## Supported Versions

Security fixes are accepted for the current `main` branch.

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
