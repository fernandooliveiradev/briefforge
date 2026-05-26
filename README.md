# BriefForge

BriefForge generates fictional client briefings for portfolio projects. It creates a complete project package with briefing, brand direction, moodboard notes, execution prompts, deliverables, and stage-specific agent skills.

The app intentionally uses real AI generation only. If the AI call fails, the project is not saved.

Created and maintained by [Fernando de Oliveira](https://fernandodeoliveira.pro).

## Status

BriefForge is early-stage open source software. The current focus is a stable local-first workflow for generating and managing fictional client briefings.

## Features

- Generate fictional clients by business type, visual style, project goal, language, and complexity.
- Produce structured brand, audience, visual identity, moodboard, prompts, deliverables, and agent skills.
- Copy execution prompts for design, development, and content workflows.
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
- OpenAI API

## Requirements

- Node.js 24 or 25
- pnpm 10 or newer
- An OpenAI API key

## Getting Started

Install dependencies:

```bash
pnpm install
```

Create your local environment file:

```bash
cp .env.example .env
```

Fill the required values:

```bash
OPENAI_API_KEY=your_api_key
```

Start the development server:

```bash
pnpm dev
```

Open http://localhost:3000.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `OPENAI_API_KEY` | Yes | Server-side key used to generate briefings. |

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
- The local SQLite database is intended for local development and single-instance use.
- Report vulnerabilities privately. See `SECURITY.md`.

## Contributing

Issues and pull requests are welcome. Please read `CONTRIBUTING.md` before opening a PR.

## Changelog

See `CHANGELOG.md`.

## Maintainer

Created and maintained by [Fernando de Oliveira](https://fernandodeoliveira.pro).

## License

Apache-2.0. See `LICENSE`.
