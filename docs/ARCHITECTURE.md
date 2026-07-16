# Pulse AI Architecture

## Tech Stack

- Electron
- React
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Lucide React

## Folder Structure

apps/
packages/
docs/

## Architecture

Electron Main Process
        │
        ▼
Electron Preload
        │
        ▼
React Renderer
        │
        ▼
React Router
        │
        ▼
Feature Pages
        │
        ▼
Reusable UI Components

## Monitoring Flow

systeminformation
        │
        ▼
Electron Services
        │
        ▼
IPC Main
        │
        ▼
Preload Bridge
        │
        ▼
Shared Monitoring Service
        │
        ▼
React Pages
        │
        ├──────────────┐
        ▼              ▼
Dashboard           Monitoring
        │
        ▼
Reusable UI Components


## Monitoring Modules

- CPU Monitoring
- Memory Monitoring
- GPU Monitoring
- Storage Monitoring
- Network Monitoring

The shared monitoring service (`monitor.ts`) centralizes system data collection.

Both the Dashboard and Monitoring page consume the same monitoring snapshot through a single API, reducing duplicated IPC requests and preparing the application for future features such as the Process Manager and Gaming Mode.
Polling is performed by the shared monitoring service, while React components only consume monitoring snapshots.

## Routing

React Router is used for navigation between feature pages.

Current routes:

- /
- /monitoring
- /processes
- /gaming
- /optimizer
- /ai
- /settings

All routes share a common application layout through `AppLayout` and render feature pages using React Router's `Outlet`.

```
pulse-ai
├─ apps
│  └─ desktop
│     ├─ .eslintrc.cjs
│     ├─ components.json
│     ├─ electron
│     │  ├─ electron-env.d.ts
│     │  ├─ main.ts
│     │  ├─ preload.ts
│     │  └─ services
│     │     ├─ system.ts
│     │     └─ systemMonitor.ts
│     ├─ electron-builder.json5
│     ├─ index.html
│     ├─ package-lock.json
│     ├─ package.json
│     ├─ public
│     │  ├─ electron-vite.animate.svg
│     │  ├─ electron-vite.svg
│     │  └─ vite.svg
│     ├─ README.md
│     ├─ src
│     │  ├─ app
│     │  │  ├─ App.css
│     │  │  └─ App.tsx
|     |  |  └── router.tsx
│     │  ├─ assets
│     │  │  └─ logo
│     │  ├─ components
│     │  │  ├─ cards
│     │  │  ├─ navigation
│     │  │  │  └─ NavItem.tsx
│     │  │  └─ ui
│     │  │     ├─ button.tsx
│     │  │     └─ card.tsx
│     │  ├─ constants
│     │  │  ├─ app.ts
│     │  │  ├─ colors.ts
│     │  │  └─ navigation.ts
│     │  ├─ features
│     │  │  ├─ ai
│     │  │  ├─ dashboard
│     │  │  │  ├─ components
│     │  │  │  │  └─ StatCard.tsx
│     │  │  │  └─ DashboardPage.tsx
│     │  │  ├─ gaming
│     │  │  ├─ monitoring
│     │  │  │  └─ MonitoringPage.tsx
│     │  │  ├─ optimizer
│     │  │  ├─ processes
│     │  │  └─ settings
│     │  ├─ hooks
│     │  │  └─ useSystemMonitor.ts
│     │  ├─ index.css
│     │  ├─ lib
│     │  │  ├─ ai.ts
│     │  │  ├─ electron.ts
│     │  │  ├─ ipc.ts
│     │  │  ├─ monitor.ts
│     │  │  ├─ system.ts
│     │  │  └─ utils.ts
│     │  ├─ main.tsx
│     │  ├─ styles
│     │  ├─ types
│     │  │  └─ system.ts
│     │  ├─ utils
│     │  └─ vite-env.d.ts
│     ├─ tsconfig.json
│     ├─ tsconfig.node.json
│     └─ vite.config.ts
├─ docs
│  ├─ ARCHITECTURE.md
│  ├─ CHANGELOG.md
│  ├─ plan.odt
│  └─ ROADMAP.md
├─ packages
│  ├─ ai
│  ├─ database
│  ├─ monitoring
│  ├─ optimizer
│  ├─ shared
│  └─ ui
└─ README.md

```

## Planned Architecture

Future features will reuse the shared monitoring service.

Upcoming modules include:

- Process Manager
- Gaming Mode
- Optimizer
- AI Diagnostics

Each feature will remain isolated while sharing common monitoring data through reusable services.