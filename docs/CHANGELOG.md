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


## [0.2.0-dev] - 2026-07-14

### Added

#### System Monitoring
- Integrated the `systeminformation` library.
- Created the Electron monitoring service.
- Added IPC handlers for CPU and memory information.
- Exposed secure monitoring APIs through the preload script.
- Added TypeScript definitions for Electron APIs.
- Connected React to Electron through IPC.
- Implemented live CPU usage monitoring.
- Implemented live RAM usage monitoring.
- Added automatic dashboard refresh every second.

### Architecture

- Separated system monitoring logic from the React renderer.
- Moved operating system access into the Electron main process.
- Established the first Electron → IPC → React communication pipeline.
- Implemented dashboard polling as an initial prototype before extracting a shared monitoring service.

## [0.3.0-dev] - 2026-07-15

### Added

#### System Monitoring

- Implemented live GPU monitoring.
- Displayed GPU utilization.
- Displayed GPU model information.
- Implemented storage monitoring.
- Calculated total system storage across all drives.
- Displayed storage utilization percentage.
- Displayed used and total storage capacity.
- Implemented live network monitoring.
- Displayed real-time download speed.
- Displayed real-time upload speed.

#### Dashboard

- Expanded the dashboard to display five live system metrics:
  - CPU
  - RAM
  - GPU
  - Storage
  - Network

### Improved

- Replaced `setInterval()` polling with a controlled asynchronous polling loop.
- Prevented overlapping monitoring requests.
- Added polling performance logging for debugging.
- Improved dashboard responsiveness and eliminated UI freezing.

### Notes

- CPU usage currently differs from Windows Task Manager and requires further investigation.
- Dashboard polling remains inside the dashboard component and will later be extracted into a shared monitoring service.

## [0.4.0-dev] - 2026-07-16

### Added

#### Routing

- Integrated React Router.
- Added application router configuration.
- Implemented nested layouts using `Outlet`.
- Added route-based navigation.
- Implemented automatic active navigation highlighting using `NavLink`.
- Added placeholder routes for application features.

#### Monitoring

- Created a shared monitoring service (`monitor.ts`).
- Implemented `getSystemSnapshot()` to retrieve all monitoring data through a single API.
- Centralized CPU, Memory, GPU, Storage and Network polling.
- Added a dedicated Monitoring page.
- Displayed detailed CPU information:
  - Overall usage
  - User usage
  - System usage
  - Idle percentage
- Displayed detailed memory information.
- Displayed detailed GPU information.
- Displayed detailed storage information.
- Displayed detailed network upload and download speeds.

#### Type Safety

- Moved monitoring interfaces into a shared `types/system.ts` module.
- Improved type safety across Electron, preload and React.

### Changed

#### Dashboard

- Refactored the dashboard to consume the shared monitoring service.
- Replaced multiple IPC requests with a single `SystemSnapshot`.
- Simplified dashboard state management.

#### Architecture

- Separated monitoring logic from UI components.
- Established a reusable monitoring layer for future features.
- Prepared the application for Process Manager, Gaming Mode and AI integration.

### Improved

- Reduced duplicated monitoring code.
- Improved maintainability of the monitoring system.
- Standardized system data models across the application.

### Known Issues

- CPU usage still differs slightly from Windows Task Manager and requires further investigation.
- Storage currently displays combined system usage; per-drive (C:, D:, E:, SSD/HDD/USB) monitoring is planned.