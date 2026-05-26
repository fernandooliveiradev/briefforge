# Contributing

Thanks for helping improve BriefForge.

## Development

1. Fork or clone the repository.
2. Install dependencies with `pnpm install`.
3. Copy `.env.example` to `.env`.
4. Add `OPENAI_API_KEY`.
5. Run `pnpm dev`.

Before opening a pull request, run:

```bash
pnpm check
```

## Changelog

User-facing changes should update `CHANGELOG.md` under `Unreleased`.

## Pull Request Guidelines

- Keep changes focused and explain the user-facing impact.
- Do not commit secrets, local data, build output, logs, or generated `.next` folders.
- Prefer existing UI components and patterns.
- Add validation for new API inputs.
- Avoid silent fallbacks for AI generation. If generation fails, surface a clear error and do not save partial data.

## Code Style

- Use TypeScript for application code.
- Keep server-only logic out of client components.
- Keep reusable business rules in `src/lib`.
- Keep reusable UI in `src/components`.
- Use Zod for request validation where external input enters the app.
