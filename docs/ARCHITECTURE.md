        # Pulse AI Architecture

        Tech Stack
        Electron
        React
        TypeScript
        React Router
        Tailwind CSS v4
        shadcn/ui
        Lucide React
        systeminformation
        PowerShell (Windows Device Detection)

        ## Project Overview

        Pulse AI is a Windows-first desktop application built with Electron and React.
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
                Electron Preload
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
        Preload API
                │
                ▼
        monitor.ts
                │
                ▼
        SystemSnapshot
                │
        ┌──────┴─────────────┐
        ▼                    ▼
        Dashboard        Monitoring
        │                    │
        └──────────┬─────────┘
                ▼
        Shared Components

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
        - Performance History

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
        │     │  ├─ process.ts
        │     │  └─ services
        │     │     ├─ devices.ts
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
        │     │  │     ├─ card.tsx
        │     │  │     ├─ chart.tsx
        │     │  │     └─ progress.tsx
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
        │     │  │  │  │  ├─ DiskUsageCard.tsx
        │     │  │  │  │  ├─ DisplayCard.tsx
        │     │  │  │  │  ├─ GpuCard.tsx
        │     │  │  │  │  ├─ HistoryChart.tsx
        │     │  │  │  │  ├─ InputDevicesCard.tsx
        │     │  │  │  │  ├─ MemoryCard.tsx
        │     │  │  │  │  ├─ NetworkCard.tsx
        │     │  │  │  │  └─ StorageCard.tsx
        │     │  │  │  ├─ hooks
        │     │  │  │  │  └─ useHistory.ts
        │     │  │  │  └─ pages
        │     │  │  │     └─ MonitoringPage.tsx
        │     │  │  ├─ optimizer
        │     │  │  ├─ processes
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