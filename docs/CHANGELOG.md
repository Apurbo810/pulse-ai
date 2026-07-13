# Changelog

All notable changes to Pulse AI will be documented in this file.

---

## [0.1.0-dev] - 2026-07-13

### Added

#### Project Setup
- Created GitHub repository.
- Set up npm workspace monorepo.
- Initialized Electron + React + TypeScript desktop application.
- Configured Electron development environment.
- Enabled React hot reload.

#### Architecture
- Established initial project architecture (`apps/`, `packages/`, `docs/`).
- Configured TypeScript path aliases (`@/*`).

#### UI Foundation
- Configured Tailwind CSS v4.
- Initialized shadcn/ui with the Nova preset.
- Added the first reusable UI component (`Button`).
- Built the application shell.
- Implemented sidebar navigation.
- Added reusable navigation item component.
- Created the initial dashboard page.
- Added reusable system statistic cards.

### Changed

- Switched from a manual Electron integration to the Electron + Vite template for a more maintainable development environment.