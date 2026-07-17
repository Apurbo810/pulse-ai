# Pulse AI Architecture

## Tech Stack

- Electron
- React
- TypeScript
- React Router
- Tailwind CSS v4
- shadcn/ui
- Lucide React
- systeminformation

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
Electron Preload
        │
        ▼
Shared Monitoring Service (monitor.ts)
        │
        ▼
System Snapshot
        │
        ├───────────────────────┐
        ▼                       ▼
     Dashboard               Monitoring
        │                        │
        ▼                        ▼      
Reusable UI Components    Feature Components

        



## Monitoring Modules

Implemented:

- CPU
- Memory
- GPU
- Storage Summary
- Storage Devices & Partitions
- Network Adapter
- Network Throughput

The shared monitoring service (`monitor.ts`) centralizes system data collection.

Dashboard and Monitoring consume the same snapshot through a single API, eliminating duplicated IPC calls.

## Storage Architecture


Storage is implemented as its own feature module.

Storage
│
├── Storage Overview
├── Physical Drives
├── Partitions
└── Drive Details

Electron Services
        │
        ▼
systeminformation
(fsSize, diskLayout, blockDevices)
        │
        ▼
IPC
        │
        ▼
Preload
        │
        ▼
useStorage()
        │
        ▼
Storage UI


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

## Design Principles

- Feature-first architecture
- Shared monitoring service
- Reusable UI components
- Strong TypeScript typing
- IPC separation between renderer and Electron
- Minimal duplicated system calls
- Scalable module organization



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
│     │  │  ├─ settings
│     │  │  └─ storage
│     │  │     ├─ components
│     │  │     │  ├─ DriveCard.tsx
│     │  │     │  ├─ DriveHeader.tsx
│     │  │     │  ├─ DriveHealth.tsx
│     │  │     │  ├─ PartitionTable.tsx
│     │  │     │  ├─ StorageOverview.tsx
│     │  │     │  └─ StorageStats.tsx
│     │  │     ├─ hooks
│     │  │     │  └─ useStorage.ts
│     │  │     ├─ pages
│     │  │     │  ├─ DriveDetailsPage.tsx
│     │  │     │  └─ StoragePage.tsx
│     │  │     └─ utils
│     │  │        └─ format.ts
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
- Performance History
- System Notifications

Each feature will remain isolated while sharing common monitoring data through reusable services.