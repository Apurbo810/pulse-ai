## Project Overview

Pulse AI is a Windows-first desktop application designed to monitor, diagnose, and optimize system performance through a modular, feature-first architecture.
The application centralizes system monitoring into a shared pipeline that supplies data to multiple features while minimizing duplicated IPC calls.
The application centralizes system monitoring into a
shared pipeline that supplies data to multiple features while minimizing duplicated
IPC calls.

## Technology Stack

Electron
React
TypeScript
React Router
Tailwind CSS v4
shadcn/ui
Lucide React
systeminformation
PowerShell (Windows Performance Counters)



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

## Monitoring Pipeline

System monitoring is centralized within the Electron main process to reduce
duplicate system calls and provide a single source of truth for performance
metrics.

```text
systeminformation
        │
        ▼
Central Monitoring Service
        │
        ├── CPU Sampler (2s)
        ├── Memory Snapshot (Live)
        ├── GPU Cache (10s)
        ├── Network Snapshot (Live)
        ├── Storage Snapshot (15s)
        └── Hardware Snapshot (Startup)
                │
                ▼
          Cached System State
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
        ┌───────┴────────┐
        ▼                ▼
    Dashboard       Monitoring
```

### Design Goals

- Single owner for CPU sampling.
- Cached hardware information to avoid repeated system discovery.
- Independent polling intervals based on data volatility.
- Shared snapshots across multiple renderer pages.
- Minimized IPC traffic between Electron and React.

## Process Analysis Architecture

The Process Manager includes a lightweight analysis engine that evaluates
running processes and generates diagnostic information without modifying or
terminating applications.

```text
Running Processes
        │
        ▼
Process Analyzer
        │
        ├── CPU Analyzer
        ├── Memory Analyzer
        ├── GPU Analyzer
        └── Disk Analyzer
                │
                ▼
        ProcessAnalysis
                │
                ▼
Severity
Reason
Recommendation
```

Each analyzer is responsible for:

- Ignoring Windows system processes.
- Applying configurable thresholds.
- Assigning a severity level.
- Producing a human-readable explanation.
- Generating actionable optimization recommendations.

Future analyzers will extend this pipeline with suspicious process detection,
AI diagnostics, and optimization suggestions.

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
        
        

## Folder Structure

        apps/
        packages/
        docs/


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

## Process Manager Architecture

```text
systeminformation
        │
        ▼
Windows Performance Counters
        │
        ▼
Electron Process Service
(process.ts)
        │
        ▼
IPC Main
        │
        ▼
Preload API
        │
        ▼
useProcesses()
        │
        ▼
Process Manager UI
```

The Process Manager combines `systeminformation` with Windows Performance Counters to provide real-time process monitoring.

Implemented features include:

- Live process monitoring
- CPU, Memory, GPU and Disk usage
- Process filtering and sorting
- Configurable refresh intervals
- Process search
- Application icons
- Process Properties
- Open File Location
- Search Process Online
- End Task
- Critical process protection

Critical process protection is enforced in both the Electron backend and the React frontend to prevent accidental termination of essential Windows processes.

The React renderer is responsible only for presenting process data and handling user interactions. All operating system access, process termination, and security validation are performed by the Electron backend, ensuring the renderer cannot bypass critical process protection.

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

## Implemented Modules

### Monitoring

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
- Performance History Charts

### Process Manager

- Live process monitoring
- Process filtering
- Process sorting
- Auto refresh
- Persistent preferences
- Application icons
- Process properties
- Open File Location
- Search Process Online
- End Task
- Critical process protection
- Process analysis framework
- CPU analysis

The shared monitoring service (`monitor.ts`) centralizes system data collection.

Dashboard and Monitoring consume a shared SystemSnapshot, ensuring a single source of truth while eliminating duplicated IPC calls.

## Planned Architecture

Future features will build upon the shared monitoring and Electron service layers while maintaining a modular, feature-first architecture.

Current implemented features:

- Dashboard
- Monitoring
- Storage
- Process Manager

The Process Manager provides real-time process monitoring, filtering,
sorting, live resource usage, application icons, process properties,
Open File Location, Search Process Online, End Task, and protected
Windows process detection.

Upcoming modules include:

- Gaming Mode
- Optimizer
- AI Diagnostics
- System Notifications

Each feature will remain isolated while sharing common monitoring data through reusable services.
     
## Project Structure   

               
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
│     │  └─ services
│     │     ├─ devices.ts
│     │     ├─ icon.ts
│     │     ├─ process.ts
│     │     ├─ processes
│     │     │  └─ criticalProcesses.ts
│     │     ├─ shell.ts
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
│     ├─ release
│     │  └─ 0.0.0
│     │     └─ win-unpacked
│     ├─ src
│     │  ├─ app
│     │  │  ├─ App.css
│     │  │  └─ App.tsx
│     │  ├─ assets
│     │  │  └─ logo
│     │  ├─ components
│     │  │  ├─ cards
│     │  │  ├─ navigation
│     │  │  │  └─ NavItem.tsx
│     │  │  ├─ shared
│     │  │  │  └─ ApplicationIcon.tsx
│     │  │  └─ ui
│     │  │     ├─ badge.tsx
│     │  │     ├─ button.tsx
│     │  │     ├─ card.tsx
│     │  │     ├─ chart.tsx
│     │  │     ├─ context-menu.tsx
│     │  │     ├─ dialog.tsx
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
│     │  │  │  ├─ analysis
│     │  │  │  │  ├─ cpuAnalyzer.ts
│     │  │  │  │  ├─ diskAnalyzer.ts
│     │  │  │  │  ├─ gpuAnalyzer.ts
│     │  │  │  │  ├─ index.ts
│     │  │  │  │  ├─ memoryAnalyzer.ts
│     │  │  │  │  ├─ test.ts
│     │  │  │  │  └─ types.ts
│     │  │  │  ├─ components
│     │  │  │  │  ├─ actions
│     │  │  │  │  │  └─ ProcessActions.tsx
│     │  │  │  │  ├─ dialogs
│     │  │  │  │  │  ├─ ProcessPropertiesDialog.tsx
│     │  │  │  │  │  └─ sections
│     │  │  │  │  │     ├─ ExecutableSection.tsx
│     │  │  │  │  │     ├─ OverviewSection.tsx
│     │  │  │  │  │     ├─ PerformanceSection.tsx
│     │  │  │  │  │     ├─ ProcessAdvancedSection.tsx
│     │  │  │  │  │     └─ ProcessDetailsSection.tsx
│     │  │  │  │  ├─ menus
│     │  │  │  │  │  └─ ProcessContextMenu.tsx
│     │  │  │  │  ├─ table
│     │  │  │  │  │  ├─ ProcessRow.tsx
│     │  │  │  │  │  ├─ ProcessTable.tsx
│     │  │  │  │  │  └─ SortableHeader.tsx
│     │  │  │  │  └─ toolbar
│     │  │  │  │     ├─ ProcessFilterBar.tsx
│     │  │  │  │     ├─ ProcessToolbar.tsx
│     │  │  │  │     └─ RefreshIntervalSelect.tsx
│     │  │  │  ├─ hooks
│     │  │  │  │  └─ useProcesses.ts
│     │  │  │  ├─ ProcessesPage.tsx
│     │  │  │  ├─ types.ts
│     │  │  │  └─ utils
│     │  │  │     └─ preferences.ts
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
│     ├─ test-cpu.js
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