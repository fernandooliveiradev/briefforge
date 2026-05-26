# Changelog

All notable changes to BriefForge will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses semantic versioning where practical.

## [Unreleased]

### Added

- Open source project metadata, contribution docs, security policy, issue templates, pull request template, and CI workflow.
- Runtime check for supported Node.js versions.
- Local SQLite persistence using Node's native `node:sqlite` module.
- Markdown export and print-ready PDF export view.
- Briefing duplication with version tracking.
- Dashboard search and filters.
- Stage-level regeneration for briefing, brand, moodboard, prompts, and deliverables.
- Public read-only sharing links.
- DeepSeek provider support alongside OpenAI.
- Logo concept board output with logo type, composition, symbolism, required variations, board sections, production notes, and a dedicated prompt for visual identity boards.
- Deliverable generation now asks for concrete production files, brand board assets, logo variations, export formats, usage notes, and acceptance criteria.
- Optional password gate for deployed instances, protecting private pages and project APIs while keeping public share links read-only.

### Changed

- Dashboard and primary actions now use a neutral black visual style.
- Dashboard empty state now has a single creation call to action.
- User-facing storage errors no longer expose local filesystem or database implementation details.
- README now documents the real project, maintainer, setup, scripts, storage, and security notes.
- AI provider configuration is documented in `docs/AI_PROVIDERS.md`.
- Updated Next.js and Tailwind CSS to patched versions and removed the unused chart/Recharts dependency.

### Removed

- Legacy local fallback briefing generator.
- Legacy JSON database storage.
- Legacy local database encryption secret.
- Scaffold-only development dependency and webpack hook.

## [0.1.0] - 2026-05-25

### Added

- Initial BriefForge application.
- AI-generated fictional client briefings.
- Brand, moodboard, prompt, deliverable, and agent skill sections.
- Project dashboard, detail page, creation flow, and delete action.
