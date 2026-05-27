![BriefForge banner](docs/assets/github-banner.png)

# BriefForge

[![CI](https://github.com/fernandooliveiradev/briefforge/actions/workflows/ci.yml/badge.svg)](https://github.com/fernandooliveiradev/briefforge/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24%2B-43853d)](package.json)

BriefForge generates fictional client briefings for portfolio projects. It creates a complete project package with briefing, brand direction, moodboard notes, execution prompts, deliverables, and stage-specific agent skills.

The app intentionally uses real AI generation only. If the AI call fails, the project is not saved.

Created and maintained by [Fernando de Oliveira](https://fernandodeoliveira.pro).

## Status

BriefForge is early-stage open source software. The current focus is a stable local-first workflow for generating and managing fictional client briefings.

## Preview

BriefForge is designed as a private creative operations tool: generate a fictional client, refine the briefing by stage, export the package, and share read-only links when needed.

## Features

- Generate fictional clients by business type, visual style, project goal, language, and complexity.
- Choose OpenAI/GPT, DeepSeek, or OpenRouter per briefing from the creation screen.
- Produce structured brand, audience, visual identity, logo concept board, moodboard, prompts, production-ready deliverables, and agent skills.
- Copy execution prompts for design, development, and content workflows.
- Export briefings as Markdown or through a print-ready PDF view.
- Duplicate briefings into versioned variants.
- Search and filter the dashboard by name, segment, style, and project goal.
- Regenerate an individual stage without replacing the whole briefing.
- Share a read-only public link when needed.
- Store projects locally in SQLite.
- Delete generated projects from dashboard or detail pages.
- Run as a local-first Next.js app.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Radix UI / shadcn-style components
- Zod
- Native SQLite via `node:sqlite`
- OpenAI API, DeepSeek API, or OpenRouter API

## Requirements

- Node.js 24 or 25
- pnpm 10 or newer
- An OpenAI, DeepSeek, or OpenRouter API key

## Getting Started

Install dependencies:

```bash
pnpm install
```

Create your local environment file:

```bash
cp .env.example .env
```

Fill the values for the providers you want to use:

```bash
AI_PROVIDER=openai
OPENAI_API_KEY=your_api_key
```

To enable DeepSeek too:

```bash
DEEPSEEK_API_KEY=your_deepseek_key
DEEPSEEK_MODEL=deepseek-v4-pro
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

To enable OpenRouter, set the API key and the exact model slug you want to use:

```bash
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=google/gemma-4-26b-a4b-it:free
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

BriefForge does not hardcode the OpenRouter model. It uses the value from `OPENROUTER_MODEL`. Free examples include `google/gemma-4-26b-a4b-it:free` and `google/gemma-4-31b-it:free`.

`AI_PROVIDER` controls the default selected option on the creation screen. You can still choose OpenAI/GPT, DeepSeek, or OpenRouter per briefing in the UI, as long as that provider has a key configured. Restart the server after changing environment variables. See [`docs/AI_PROVIDERS.md`](docs/AI_PROVIDERS.md) for details.

Start the development server:

```bash
pnpm dev
```

Open http://localhost:3000.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `AI_PROVIDER` | No | Default provider selected in the UI. Use `openai`, `deepseek`, or `openrouter`. Defaults to `openai`. |
| `OPENAI_API_KEY` | When using OpenAI/GPT | Server-side OpenAI key. |
| `OPENAI_MODEL` | No | OpenAI chat model. Defaults to `gpt-4o`. |
| `OPENAI_BASE_URL` | No | OpenAI-compatible base URL. Defaults to `https://api.openai.com/v1`. |
| `DEEPSEEK_API_KEY` | When using DeepSeek | Server-side DeepSeek key. |
| `DEEPSEEK_MODEL` | No | DeepSeek chat model. Defaults to `deepseek-v4-pro`. |
| `DEEPSEEK_BASE_URL` | No | DeepSeek base URL. Defaults to `https://api.deepseek.com`. |
| `OPENROUTER_API_KEY` | When using OpenRouter | Server-side OpenRouter key. |
| `OPENROUTER_MODEL` | When using OpenRouter | Exact OpenRouter model slug to use, for example `google/gemma-4-26b-a4b-it:free`. |
| `OPENROUTER_BASE_URL` | No | OpenRouter OpenAI-compatible base URL. Defaults to `https://openrouter.ai/api/v1`. |
| `OPENROUTER_SITE_URL` | No | Optional app attribution URL sent to OpenRouter as `HTTP-Referer`. |
| `OPENROUTER_APP_NAME` | No | Optional app attribution title sent to OpenRouter. Defaults to `BriefForge`. |
| `AI_REQUEST_TIMEOUT_MS` | No | Generation timeout in milliseconds. Defaults to `120000`. |
| `OPENAI_TIMEOUT_MS` / `DEEPSEEK_TIMEOUT_MS` / `OPENROUTER_TIMEOUT_MS` | No | Provider-specific timeout override in milliseconds. |
| `BRIEFFORGE_ACCESS_PASSWORD` | No | Optional password gate for private routes and project APIs. Recommended for any deployed instance. |
| `BRIEFFORGE_SESSION_SECRET` | No | Optional extra secret used to derive the access cookie. Recommended when access control is enabled. |

## Scripts

```bash
pnpm dev        # start local development
pnpm build      # build for production
pnpm start      # start a production build
pnpm typecheck  # run TypeScript checks
pnpm check      # typecheck and build
```

## Data Storage

Generated projects are stored locally in `data/briefforge.sqlite`, ignored by Git.

SQLite is configured with WAL mode, foreign keys, a busy timeout, parameterized queries, explicit transactions, and a versioned schema via `PRAGMA user_version`. Remove `data/briefforge.sqlite` if you want to start with a clean local database.

## Project Structure

```text
src/app/                 Next.js routes and API handlers
src/components/          Reusable UI and app components
src/components/ui/       Base UI primitives
src/lib/                 AI generation, local database, validation, utilities
scripts/                 Local Next.js runner helpers
```

## Security Notes

- Do not commit `.env`, `data/`, logs, or generated build folders.
- API keys must stay server-side.
- Set `BRIEFFORGE_ACCESS_PASSWORD` before exposing the app outside your own machine. Public share links remain available in read-only mode.
- Access sessions are signed, expiring cookies. Project APIs and AI generation endpoints include in-memory rate limits.
- Security headers are configured globally, including CSP, frame protection, referrer policy, permissions policy, and content-type hardening.
- The local SQLite database is intended for local development and single-instance use. For multi-instance deployments, plan a migration to Postgres plus Redis/Upstash-backed rate limiting.
- Report vulnerabilities privately. See `SECURITY.md`.

## Production Readiness

BriefForge is local-first, but the repository is structured so it can be hardened for production:

- `pnpm check` runs TypeScript checks and a production build.
- CI runs install, typecheck, and build on pushes and pull requests.
- Authentication is optional locally and recommended for any deployed instance.
- Rate limiting currently uses an in-memory store and a small abstraction in `src/lib/rate-limit.ts`, ready to be replaced by Redis/Upstash.
- SQLite uses WAL mode, transactions, schema versioning, foreign keys, and indexed project queries.

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for recommended deployment settings and scale-up paths.
See [`docs/OPERATIONS.md`](docs/OPERATIONS.md) for release/versioning rules and the current login model.

## Roadmap

- Redis/Upstash rate limit adapter for multi-instance deployments.
- Postgres storage adapter for hosted production use.
- Background jobs for long AI generations and retryable regeneration.
- Optional user accounts and per-user project ownership.
- Automated UI tests for the core create/share/export flows.

## Contributing

Issues and pull requests are welcome. Please read `CONTRIBUTING.md` before opening a PR.

## Changelog

See `CHANGELOG.md`.

## Maintainer

Created and maintained by [Fernando de Oliveira](https://fernandodeoliveira.pro).

## License

Apache-2.0. See `LICENSE`.
