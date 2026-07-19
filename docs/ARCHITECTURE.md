        # Pulse AI Architecture

        Electron
        React
        TypeScript
        React Router
        Tailwind CSS v4
        shadcn/ui
        Lucide React
        systeminformation
        PowerShell (Windows Performance Counters)


        ## Project Overview

        Pulse AI is a Windows-first desktop application designed to monitor, diagnose, and optimize system performance through a modular, feature-first architecture.
        Its goal is to monitor, diagnose, and optimize system performance through a modular,
        feature-first architecture. The application centralizes system monitoring into a
        shared pipeline that supplies data to multiple features while minimizing duplicated
        IPC calls.

        ## Folder Structure

        apps/
        packages/
        docs/

        ## Architecture


Electron Main Process
        │
        ▼
Electron Services
        │
        ▼
IPC Main
        │
        ▼
Preload API
        │
        ▼
React Renderer
        │
        ▼
React Router
        │
        ▼
Feature Modules
        │
        ▼
Reusable Components


        ## Monitoring Flow

systeminformation
        │
        ▼
Electron Services
        │
        ├───────────────┐
        ▼               ▼
Windows Performance   systeminformation
Counters              APIs
(PowerShell)
        │               │
        └──────┬────────┘
               ▼
        IPC Main
               ▼
        Preload API
               ▼
        monitor.ts
               ▼
        SystemSnapshot

        ## Monitoring Modules

        Implemented:


        - CPU
        - Memory
        - GPU
        - Storage Summary
        - Storage Devices & Partitions
        - Network Adapter
        - Network Throughput
        - Display Detection
        - Keyboard Detection
        - Mouse Detection
        - Performance History Graphs

        The shared monitoring service (`monitor.ts`) centralizes system data collection.

        Dashboard and Monitoring consume a shared SystemSnapshot, ensuring a single source of truth while eliminating duplicated IPC calls.

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
        - Modular feature isolation
        - Single source of truth for system data
        - Scalable module organization

     
        ```
        pulse-ai
        ├─ .agents
        ├─ apps
        │  └─ desktop
        │     ├─ .eslintrc.cjs
        │     ├─ components.json
        │     ├─ electron
        │     │  ├─ electron-env.d.ts
        │     │  ├─ main.ts
        │     │  ├─ preload.ts
        │     │  ├─ process.ts
        │     │  └─ services
        │     │     ├─ devices.ts
        │     │     ├─ process.ts
        │     │     └─ system.ts
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
        │     │  │     ├─ card.tsx
        │     │  │     ├─ chart.tsx
        │     │  │     ├─ input.tsx
        │     │  │     ├─ progress.tsx
        │     │  │     └─ table.tsx
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
        │     │  │  │  ├─ components
        │     │  │  │  │  ├─ CpuCard.tsx
        │     │  │  │  │  ├─ DevicesCard.tsx
        │     │  │  │  │  ├─ DiskUsageCard.tsx
        │     │  │  │  │  ├─ DisplayCard.tsx
        │     │  │  │  │  ├─ GpuCard.tsx
        │     │  │  │  │  ├─ HistoryChart.tsx
        │     │  │  │  │  ├─ MemoryCard.tsx
        │     │  │  │  │  ├─ NetworkCard.tsx
        │     │  │  │  │  └─ StorageCard.tsx
        │     │  │  │  ├─ hooks
        │     │  │  │  │  └─ useHistory.ts
        │     │  │  │  └─ pages
        │     │  │  │     └─ MonitoringPage.tsx
        │     │  │  ├─ optimizer
        │     │  │  ├─ processes
        │     │  │  │  ├─ components
        │     │  │  │  │  ├─ ProcessDetails.tsx
        │     │  │  │  │  ├─ ProcessRow.tsx
        │     │  │  │  │  ├─ ProcessTable.tsx
        │     │  │  │  │  └─ ProcessToolbar.tsx
        │     │  │  │  ├─ hooks
        │     │  │  │  │  └─ useProcesses.ts
        │     │  │  │  └─ ProcessesPage.tsx
        │     │  │  ├─ settings
        │     │  │  ├─ shared
        │     │  │  │  └─ utils
        │     │  │  │     └─ status.ts
        │     │  │  └─ storage
        │     │  │     ├─ components
        │     │  │     │  ├─ PartitionCard.tsx
        │     │  │     │  ├─ StorageGroupCard.tsx
        │     │  │     │  └─ StorageOverview.tsx
        │     │  │     ├─ hooks
        │     │  │     │  └─ useStorage.ts
        │     │  │     ├─ pages
        │     │  │     │  ├─ DriveDetailsPage.tsx
        │     │  │     │  └─ StoragePage.tsx
        │     │  │     └─ utils
        │     │  │        └─ storageFormat.ts
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
        │     ├─ vite.config.ts
        │     └─ vite.config.ts.timestamp-1784449007718-571f3bd1253da.mjs
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

        Implemented modules

        - Dashboard
        - Monitoring
        - Storage
        - Process Manager

        Upcoming modules include:

        - Gaming Mode
        - Optimizer
        - AI Diagnostics
        - System Notifications

        Each feature will remain isolated while sharing common monitoring data through reusable services.