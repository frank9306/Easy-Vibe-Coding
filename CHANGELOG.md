# Changelog

## Unreleased

## 0.1.0 - 2026-07-16

- Added a capability navigator that explains what is installed, when each capability applies, and what benefit it provides.
- Added `suggest <task>` with local, explainable recommendations for installed and available capabilities.
- Added `explain <component>` and redesigned `status` with activation modes and file health checks.
- Added discovery of project-local Agent Skills and plugin manifests that are not managed by Easy ECC.
- Enriched installed rule descriptions so agents can recognize relevant trigger scenarios.
- Improved post-install guidance and rejected unknown custom component names.

## 0.0.2 - 2026-07-16

- Redesigned the GitHub Pages site with a clearer product hierarchy, CLI preview, installation-level comparison, and responsive layout.
- Fixed the copy-command feedback text and added an explicit clipboard failure state.
- Changed documentation commands to use the npm `latest` tag instead of a hard-coded package version.
- Renamed the GitHub repository to `Easy-ECC` and updated documentation and Pages links.

## 0.0.1 - 2026-07-15

- Added Lite, Standard, Pro, Team, and Custom installation profiles.
- Added adapters for Claude Code, Codex, Cursor, OpenCode, and generic Agent Skills clients.
- Added pinned ECC component downloads, dry-run planning, installation state, and safe uninstall.
- Added English and Simplified Chinese documentation plus a GitHub Pages site.
- Enabled GitHub Pages automatically during the first documentation deployment.
- Normalized npm executable metadata so the `easy-ecc` command is installed correctly.
