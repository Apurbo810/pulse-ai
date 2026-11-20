
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