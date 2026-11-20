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

<!-- pulse-ai/docs/ARCHITECTURE.md  (new section, insert before "## Storage Architecture") -->

## Diagnostics Architecture

Diagnostics records how the PC behaves over a short session so Pulse AI can explain why it is slow. It runs in the Electron main process. A button starts it today, and the AI assistant will call the same API in Week 8.

```text
window.diagnostics (preload)
        │
        ▼
IPC: diagnostics:start / stop / status / list / getSamples / remove
        │
        ▼
Recorder (one sampler, fixed schedule)
        │
        ├── Poller: memory          (os module)
        ├── Poller: GPU             (nvidia-smi)
        ├── Poller: network         (primary adapter)
        ├── Poller: top processes   (si.processes + GPU/disk counters)
        └── CounterStream           (one long-running PowerShell process:
                                     CPU clock, page file, disk queue, disk time)
        │
        ▼
Sample[] every 2 s  ──►  JsonlSessionStore  (userData/diagnostics)
                              ├── <id>.samples.jsonl   (append-only)
                              └── <id>.meta.json       (progress, sensors, timing)
```

Design rules:

- **Sampling never waits for a sensor.** Slow reads run in their own loop and a sample copies the latest value. A reading older than three intervals is stored as `null`.
- **Unavailable is `null`, not `0`.** An idle GPU really is 0%, so 0 and "unknown" must stay different. The session records which sensors worked.
- **Crash-safe storage.** Samples are appended line by line, metadata is written to a temp file and renamed (with retries on Windows file locks), and a session left unfinished by a crash is repaired from its samples at startup.
- **Timing is recorded.** Each session stores per-sensor read times, skipped slots and tick lag.
- **Input is validated in the main process.** Session ids cannot contain path parts, and recordings started from the UI are always `manual`.

Analysis signals (`features/diagnostics/signals.ts`) decode NVIDIA throttle reasons and detect CPU clock throttling under load. The diagnosis engine (planned) will combine them into a report with causes, evidence, confidence and suggested actions.

Limits:

- CPU temperature and voltage need a hardware library and are not collected.
- GPU temperature, power and throttle reasons need an NVIDIA GPU.
- The Windows counters use English names.


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
│     │     ├─ diagnostics
│     │     │  ├─ counters.ts
│     │     │  ├─ index.ts
│     │     │  ├─ parsers.ts
│     │     │  ├─ recorder.ts
│     │     │  ├─ recovery.ts
│     │     │  ├─ sensors.ts
│     │     │  ├─ storage.ts
│     │     │  └─ __tests__
│     │     │     ├─ parsers-extra.test.ts
│     │     │     ├─ recorder.test.ts
│     │     │     ├─ recovery.test.ts
│     │     │     └─ storage.test.ts
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
│     ├─ scripts
│     │  ├─ probe-result.json
│     │  └─ probe-sensors.mjs
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
│     │  │  │  └─ ai.ts
│     │  │  ├─ analysis
│     │  │  │  ├─ AnalysisPage.tsx
│     │  │  │  ├─ components
│     │  │  │  │  ├─ AnalysisCard.tsx
│     │  │  │  │  ├─ EmptyState.tsx
│     │  │  │  │  ├─ HealthScoreCard.tsx
│     │  │  │  │  ├─ InsightPanel.tsx
│     │  │  │  │  └─ PriorityList.tsx
│     │  │  │  ├─ hooks
│     │  │  │  │  ├─ useAnalysis.ts
│     │  │  │  │  └─ useInsights.ts
│     │  │  │  ├─ insights
│     │  │  │  │  ├─ buildInsights.ts
│     │  │  │  │  ├─ explanations.ts
│     │  │  │  │  ├─ healthScore.ts
│     │  │  │  │  ├─ priority.ts
│     │  │  │  │  ├─ recommendations.ts
│     │  │  │  │  ├─ types.ts
│     │  │  │  │  └─ __tests__
│     │  │  │  │     ├─ buildInsights.test.ts
│     │  │  │  │     ├─ healthScore.test.ts
│     │  │  │  │     ├─ priority.test.ts
│     │  │  │  │     └─ recommendations.test.ts
│     │  │  │  └─ SeverityBadge.tsx
│     │  │  ├─ dashboard
│     │  │  │  ├─ components
│     │  │  │  │  └─ StatCard.tsx
│     │  │  │  └─ DashboardPage.tsx
│     │  │  ├─ diagnostics
│     │  │  │  ├─ signals.ts
│     │  │  │  └─ __tests__
│     │  │  │     └─ signals.test.ts
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
│     │  │  │  │  ├─ analysisEngine.ts
│     │  │  │  │  ├─ cpuAnalyzer.ts
│     │  │  │  │  ├─ diskAnalyzer.ts
│     │  │  │  │  ├─ gpuAnalyzer.ts
│     │  │  │  │  ├─ index.ts
│     │  │  │  │  ├─ memoryAnalyzer.ts
│     │  │  │  │  ├─ shared.ts
│     │  │  │  │  ├─ suspiciousAnalyzer.ts
│     │  │  │  │  ├─ types.ts
│     │  │  │  │  └─ __tests__
│     │  │  │  │     ├─ analysisEngine.test.ts
│     │  │  │  │     ├─ analyzers.test.ts
│     │  │  │  │     └─ shared.test.ts
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
│     │  ├─ test
│     │  │  └─ helpers.ts
│     │  ├─ types
│     │  │  ├─ diagnostics.ts
│     │  │  ├─ electron-diagnostics.d.ts
│     │  │  └─ system.ts
│     │  ├─ utils
│     │  └─ vite-env.d.ts
│     ├─ test-cpu.js
│     ├─ tsconfig.json
│     ├─ tsconfig.node.json
│     ├─ tsconfig.node.tsbuildinfo
│     ├─ tsconfig.tsbuildinfo
│     ├─ vite.config.d.ts
│     ├─ vite.config.js
│     ├─ vite.config.ts
│     ├─ vite.config.ts.timestamp-1784449007718-571f3bd1253da.mjs
│     ├─ vite.config.ts.timestamp-1793547160027-44dc9258262ad.mjs
│     └─ vitest.config.ts
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