# Changelog

All notable changes to BriefForge will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses semantic versioning where practical.

## [Unreleased]

### Added

- Open source project metadata, contribution docs, security policy, issue templates, pull request template, and CI workflow.
- Runtime check for supported Node.js versions.
- Local SQLite persistence using Node's native `node:sqlite` module.

### Changed

- Dashboard and primary actions now use a neutral black visual style.
- Dashboard empty state now has a single creation call to action.
- User-facing storage errors no longer expose local filesystem or database implementation details.
- README now documents the real project, maintainer, setup, scripts, storage, and security notes.

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
