# Operations Guide

This document explains how BriefForge handles project releases and private access.

## Versioning and Releases

BriefForge follows semantic versioning where practical, especially for public releases.

A commit or push is not automatically a new version. Commits are normal development history. A new version should be created only when the project reaches a state worth publishing as a release.

Recommended release flow:

1. Merge or push the completed changes.
2. Update `CHANGELOG.md` by moving relevant items from `Unreleased` into a dated version section.
3. Update `package.json` if the release changes the application version.
4. Create a Git tag such as `v0.1.1`, `v0.2.0`, or `v1.0.0`.
5. Publish a GitHub Release from that tag with the changelog summary.

Version guidance:

- Patch, such as `0.1.1`: bug fixes, documentation corrections, small hardening changes, or security fixes that do not change the product surface.
- Minor, such as `0.2.0`: new user-facing features, meaningful workflow changes, or compatibility improvements.
- Major, such as `1.0.0`: stable public release with more mature behavior and compatibility expectations.

While BriefForge is below `1.0.0`, minor releases may still include larger changes. The changelog should make those changes clear.

## Login and Private Access

BriefForge currently uses a simple private password gate. It is designed for local use, private demos, and single-owner deployments.

If `BRIEFFORGE_ACCESS_PASSWORD` is empty, access control is disabled. This is convenient for local development.

If `BRIEFFORGE_ACCESS_PASSWORD` is set, BriefForge protects:

- the dashboard;
- project creation;
- project APIs;
- regeneration;
- duplication;
- deletion;
- export;
- public link management.

After a successful login, the app creates an HTTP-only signed session cookie. The cookie expires after 12 hours and is marked `secure` in production.

The session is signed with `BRIEFFORGE_SESSION_SECRET` when provided. If that variable is empty, the app falls back to the access password as the signing secret. Production deployments should set both variables to different long random values.

Public share links under `/share/...` stay accessible without login. They are read-only by design and can be opened by anyone who has the URL.

This is not a multi-user authentication system. BriefForge does not currently include individual user accounts, email login, password reset, per-user project ownership, roles, or an admin panel.

For a SaaS-style deployment, the recommended next step is to add:

- user accounts;
- per-user sessions;
- project ownership;
- role-based authorization;
- a database-backed authentication model.
