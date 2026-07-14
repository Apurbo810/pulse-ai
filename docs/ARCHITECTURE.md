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
UI Components
        │
        ▼
Features



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
│     │  │  ├─ optimizer
│     │  │  ├─ processes
│     │  │  └─ settings
│     │  ├─ hooks
│     │  ├─ index.css
│     │  ├─ lib
│     │  │  ├─ ai.ts
│     │  │  ├─ electron.ts
│     │  │  ├─ ipc.ts
│     │  │  ├─ system.ts
│     │  │  └─ utils.ts
│     │  ├─ main.tsx
│     │  ├─ styles
│     │  ├─ types
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
├─ package.json
├─ packages
│  ├─ ai
│  ├─ database
│  ├─ monitoring
│  ├─ optimizer
│  ├─ shared
│  └─ ui
└─ README.md

```