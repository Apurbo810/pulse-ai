<!-- pulse-ai/docs/ARCHITECTURE.md -->

# Pulse AI Architecture

## Project Overview

Pulse AI is a Windows-first desktop application designed to monitor, diagnose, and optimize system performance through a modular, feature-first architecture.

The application collects system data in the Electron main process and shares it with multiple features, while keeping all operating system access out of the React renderer.

## Technology Stack

- Electron
- React
- TypeScript
- React Router
- Tailwind CSS v4
- shadcn/ui
- Lucide React
- systeminformation
- PowerShell (Windows Performance Counters)

## Architecture

```text
Electron Main Process
        │
        ▼
Electron Services
        │
        ▼
IPC Main
        │
        ▼
Preload API (window.system)
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
```

## Monitoring Pipeline

### Currently implemented

The Electron main process owns the data that is expensive or stateful to collect. The renderer asks for the rest through IPC.

```text
systeminformation
        │
        ▼
Electron Services (system.ts)
        │
        ├── CPU Sampler        (main process, every 2s, cached)
        ├── GPU / Display Cache (main process, 10s cache)
        ├── Memory             (read on request)
        ├── Network            (read on request)
        ├── Storage            (read on request)
        └── Hardware / Devices (read on request, loaded once by the UI)
                │
                ▼
             IPC Main
                │
                ▼
         Preload API (window.system)
                │
                ▼
           monitor.ts
                │
        ┌───────┴────────┐
        ▼                ▼
    Dashboard        Monitoring
```

`monitor.ts` exposes three groups of data with different refresh rates:

- Live metrics (CPU, memory, GPU, network): every 2 seconds.
- Storage summary: every 15 seconds.
- Hardware (displays, input devices): loaded once.

### Planned improvements

- Move the memory, network, storage and hardware caches into the main process, so the main process is the single source of truth for all metrics.
- Push snapshots from main to the renderer instead of polling.
- Share one polling loop between Dashboard and Monitoring.

### Design Goals

- Single owner for CPU sampling.
- Cached hardware information to avoid repeated system discovery.
- Independent polling intervals based on data volatility.
- Shared snapshots across multiple renderer pages.
- Minimized IPC traffic between Electron and React.

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

The React renderer is responsible only for presenting process data and handling user interactions. All operating system access, process termination, and security validation are performed by the Electron backend.

## Process Analysis Architecture

The analysis engine evaluates running processes and produces diagnostic findings without modifying or terminating anything. It runs in the React renderer, on process data supplied by the Electron backend.

```text
window.system.getProcesses() + window.system.getMemory()
                │
                ▼
          useAnalysis()          (auto refresh, skips overlapping
                │                 requests, pauses while hidden)
                ▼
     Process Analysis Engine
                │
                ├── CPU Analyzer
                ├── Memory Analyzer
                ├── GPU Analyzer
                ├── Disk Analyzer
                └── Suspicious Analyzer
                │
                ▼
     Sustained-sample tracking
     (an issue must persist for several samples)
                │
                ▼
         ProcessAnalysis[]
         (id, category, severity, title, reason, detectedAt)
                │
                ▼
          Analysis UI
```

Each analyzer is responsible for:

- Ignoring Windows system processes (shared helper in `shared.ts`).
- Applying configurable thresholds.
- Assigning a severity level (low, medium, high, critical).
- Producing a human-readable reason.
- Returning a standardized `Finding`. The engine adds the `id` and `detectedAt` fields.

Notes:

- The disk analyzer converts bytes per second to MB/s before applying thresholds.
- The memory analyzer judges each process by its share of total RAM and only reports when system memory is under pressure.
- An issue is only reported after it persists for several samples (3 for CPU, GPU and disk; 2 for memory; 1 for suspicious findings), which reduces false positives from short spikes.
- Some checks need administrator rights to see a process path and owner. Without them, those checks are skipped.

## AI Insights Architecture

The insights layer turns analysis results into explanations, recommendations and a health score. It is currently rule-based, so it works offline and uses almost no resources.

```text
ProcessAnalysis[]
        │
        ▼
    useInsights()
        │
        ▼
    buildInsights()
        │
        ├── explanations.ts     plain-language explanation
        ├── recommendations.ts  performance, security and gaming tips
        │                       and suggested actions
        ├── priority.ts         priority score for each issue
        └── healthScore.ts      overall system health (0-100)
        │
        ▼
Insight[] + HealthScore
        │
        ▼
Analysis UI
(HealthScoreCard, PriorityList, InsightPanel)
```

- Insights are separate from `ProcessAnalysis`, so the analyzers stay simple.
- Suggested actions (Open File Location, End Task) go through `window.system`, so the Electron backend still enforces critical process protection.
- Gaming tips use a fixed list of background applications until Game Detection is built.
- The text generation can be replaced by a local LLM (Roadmap Week 8) without changing the UI.

## Storage Architecture

Storage is implemented as its own feature module.

```text
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
```

## Routing

React Router is used for navigation between feature pages.

Routes with pages:

- `/` (Dashboard)
- `/monitoring`
- `/storage`
- `/processes`
- `/analysis`

Placeholder routes (in the sidebar, no page yet):

- `/gaming`
- `/optimizer`
- `/ai`
- `/settings`

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
- Storage Devices and Partitions
- Network Adapter
- Network Throughput
- Display Detection
- Keyboard Detection
- Mouse Detection
- Performance History Charts

### Process Manager

- Live process monitoring
- Process filtering and sorting
- Auto refresh
- Persistent preferences
- Application icons
- Process properties
- Open File Location
- Search Process Online
- End Task
- Critical process protection

### Analysis

- CPU, Memory, GPU, Disk and Suspicious Process analyzers
- Analysis engine with severity classification and sustained-sample tracking
- Summary cards, severity filter, search, sorting and grouping
- Process details dialog
- Timestamps and auto refresh

### AI Insights

- Plain-language explanations
- Performance, security and gaming recommendations
- Suggested actions
- Overall system health score
- Priority list ("Fix these first")

## Planned Architecture

Future features will build upon the shared monitoring and Electron service layers while maintaining a modular, feature-first architecture.

Upcoming modules:

- Real game detection and Gaming Mode
- Optimizer
- History and analytics
- Local LLM integration (Ollama) for AI diagnostics
- System notifications

Each feature will remain isolated while sharing common monitoring data through reusable services.

## Project Structure

```text
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
│     ├─ README.md
│     ├─ release
│     ├─ src
│     │  ├─ app
│     │  │  ├─ App.tsx
│     │  │  └─ router.tsx
│     │  ├─ assets
│     │  ├─ components
│     │  │  ├─ layout
│     │  │  │  ├─ AppLayout.tsx
│     │  │  │  ├─ Header.tsx
│     │  │  │  ├─ MainContent.tsx
│     │  │  │  └─ Sidebar.tsx
│     │  │  ├─ navigation
│     │  │  │  └─ NavItem.tsx
│     │  │  ├─ shared
│     │  │  │  └─ ApplicationIcon.tsx
│     │  │  └─ ui
│     │  ├─ constants
│     │  │  ├─ app.ts
│     │  │  ├─ colors.ts
│     │  │  └─ navigation.ts
│     │  ├─ features
│     │  │  ├─ ai
│     │  │  ├─ analysis
│     │  │  │  ├─ AnalysisPage.tsx
│     │  │  │  ├─ SeverityBadge.tsx
│     │  │  │  ├─ components
│     │  │  │  │  ├─ AnalysisCard.tsx
│     │  │  │  │  ├─ EmptyState.tsx
│     │  │  │  │  ├─ HealthScoreCard.tsx
│     │  │  │  │  ├─ InsightPanel.tsx
│     │  │  │  │  └─ PriorityList.tsx
│     │  │  │  ├─ hooks
│     │  │  │  │  ├─ useAnalysis.ts
│     │  │  │  │  └─ useInsights.ts
│     │  │  │  └─ insights
│     │  │  │     ├─ buildInsights.ts
│     │  │  │     ├─ explanations.ts
│     │  │  │     ├─ healthScore.ts
│     │  │  │     ├─ priority.ts
│     │  │  │     ├─ recommendations.ts
│     │  │  │     └─ types.ts
│     │  │  ├─ dashboard
│     │  │  ├─ gaming
│     │  │  ├─ monitoring
│     │  │  ├─ optimizer
│     │  │  ├─ processes
│     │  │  │  ├─ analysis
│     │  │  │  │  ├─ analysisEngine.ts
│     │  │  │  │  ├─ cpuAnalyzer.ts
│     │  │  │  │  ├─ diskAnalyzer.ts
│     │  │  │  │  ├─ gpuAnalyzer.ts
│     │  │  │  │  ├─ index.ts
│     │  │  │  │  ├─ memoryAnalyzer.ts
│     │  │  │  │  ├─ shared.ts
│     │  │  │  │  ├─ suspiciousAnalyzer.ts
│     │  │  │  │  └─ types.ts
│     │  │  │  ├─ components
│     │  │  │  ├─ hooks
│     │  │  │  ├─ ProcessesPage.tsx
│     │  │  │  ├─ types.ts
│     │  │  │  └─ utils
│     │  │  ├─ settings
│     │  │  ├─ shared
│     │  │  └─ storage
│     │  ├─ hooks
│     │  │  └─ useSystemMonitor.ts
│     │  ├─ lib
│     │  │  ├─ electron.ts
│     │  │  ├─ ipc.ts
│     │  │  ├─ monitor.ts
│     │  │  ├─ system.ts
│     │  │  └─ utils.ts
│     │  ├─ main.tsx
│     │  ├─ types
│     │  │  └─ system.ts
│     │  └─ vite-env.d.ts
│     ├─ test-cpu.js
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