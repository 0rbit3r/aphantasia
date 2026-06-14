# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aphantasia is a virtual graph-based social space where users explore and associate colorful text fragments called "thoughts". It is a monorepo with a SolidJS frontend and a .NET 10 backend.

## Commands

### Frontend (`aphantasia_web/`)
```bash
npm run dev       # Start Vite dev server
npm run build     # Type-check + build for production
npm run preview   # Preview production build
```

### Backend (`aphantasia_server/`)
```bash
dotnet build                          # Build solution
dotnet run --project Aphant.Boot.WebServer     # Run REST API
dotnet run --project Aphant.Boot.LayoutDaemon  # Run graph layout background service
dotnet test Aphant.Boot.Tester                 # Run xunit tests (uses SQLite, no Postgres needed)
dotnet test Aphant.Boot.Tester --filter "FullyQualifiedName~ThoughtTester"  # Run a single test class
dotnet ef migrations add <Name> --project Aphant.Impl.Database  # No DB needed, no prompt
dotnet ef database update -- --apply           # Reads migrationsettings.json, prompts y/n before applying
```

## Architecture

### Frontend (SolidJS + Vite)

The frontend is built around a **mode system** — each screen state is a `ModeContract` (`src/stateManager/modes/modeContract.ts`). Every mode implements `initialize`, `handleFocusChange`, `dispose`, `grafikaSettings`, and `contextBanner` to configure the graph renderer and UI. Modes are instantiated and managed by `AphantasiaContainer.tsx`, which owns the exploration history stack.

**Key layers:**
- `src/stateManager/aphantasiaStore.ts` — central Solid.js store; holds exploration history, current context, UI layout state
- `src/stateManager/modes/` — one file per mode: Welcome, WelcomeCreate, Epoch, Explore, Create, Settings, Inbox, Concept, Chat, Profile
- `src/components/coreUI/` — `GraphExplorer` wraps the external `grafika` graph library; `SplitUI` handles layout; `ModeBar` drives mode transitions
- `src/contexts/` — `AuthContext` (JWT + user identity), `StoreContext` (store access), `ScreenOrientationContext`
- `src/api/` — thin fetch/post/delete wrappers that attach JWT tokens from `AuthContext`; all responses unwrap the backend `Result<T>` envelope (`{ isSuccess, payload, error }`)
- `src/model/dto/` — TypeScript interfaces mirroring backend DTOs (Thought, Concept, Epoch, User, Notifications)

The graph is rendered by the **grafika** library (external package); `GraphExplorer.tsx` bridges between mode state and grafika's API.

#### Exploration state and navigation history

The exploration state is `ExplorationStateDescriptor = { mode: ModeType, focus?: string }`. The store holds `explorationHistory: ExplorationStateDescriptor[]` + `explorationIndex`, enabling back/forward navigation.

**`handleForwardExploration(store, newState)`** is the entry point for all user-initiated navigation — it transitions state, truncates forward history, and appends the new entry. Call it on deliberate user actions (node clicks, mode switches). Do not call it for incidental grafika events like viewport pan/zoom.

**`hangleFocusChange(store, focusId)`** on `ModeContract` is where all visual changes tied to focus live (node highlight, side-panel data load). It is called after every `handleForwardExploration`.

**`grafika.focusOn(node | null)`** only controls the grafika camera — it is separate from the Aphantasia exploration state and does not trigger `hangleFocusChange`. A `viewportMoved` handler should only call `focusOn(null)`; any visual cleanup that depends on the previous focus belongs in `hangleFocusChange`.

#### ModeContract fields

Every mode object must define:
- **`grafikaInitType`** (`'main' | 'welcome' | 'chat' | 'build'`) — when transitioning to a mode whose `grafikaInitType` differs from the current one, grafika is fully disposed and reinitialized with the settings from `GRAFIKA_INITIALIZERS`.
- **`entryPoint?: ExplorationStateDescriptor`** — if set and the current `grafikaInitType` differs from the target's, `handleForwardExploration` inserts this state as a real history step first (e.g. epoch before create when leaving chat). This keeps grafika context meaningful.
- **`contextBanner`** — object with `text`, `color`, `onClick`, and optional `skipLoadingOverride`. Each mode owns its banner logic here; there is no central if-chain. Set `skipLoadingOverride: true` for modes whose banner state is always locally available (e.g. create), bypassing the global "Loading..." override.
- **`iconModeBar`** — icon shown in the center mode button of `ModeBar`.
- **`iconMenu?`** — icon shown in `ModeMenu`; undefined means the mode has no menu entry.

### Backend (.NET 10 — Clean Architecture)

Projects and their roles:
| Project | Role |
|---|---|
| `Aphant.Boot.WebServer` | ASP.NET Core entry point; DI wiring, middleware, CORS |
| `Aphant.Boot.LayoutDaemon` | Background worker; runs force-directed layout on stored graphs |
| `Aphant.Client.WebApi` | Controllers: Auth, Thought, User, Epoch, Notifications, Concept |
| `Aphant.Client.Chat` | SignalR `ChatHub` for real-time chat |
| `Aphant.Impl.Logic` | Business logic services (ThoughtLogicService, UserLogicService, …) |
| `Aphant.Impl.Database.Repo` | Repository implementations (Repository pattern) |
| `Aphant.Impl.Database` | EF Core `AphantasiaDataContext`, entities, migrations |
| `Aphant.Impl.Auth` | JWT utilities, Login/Register services |
| `Aphant.Impl.FdlLayout` | Force-directed layout physics simulation |
| `Aphant.Core.Contract` | Interface contracts shared across layers |
| `Aphant.Core.Dto` | DTOs shared across layers |

**Database** is PostgreSQL via EF Core with snake_case naming. Core entities: `Thought`, `User`, `Concept`, `ThoughtReference`, `ThoughtConcept`, `Notification`, `Bookmark`, `UserFollow`, `ConceptFollow`, `Epoch`.

**Result pattern** — all service methods and controllers return `Result` / `Result<T>` from `Aphant.Core.Dto.Results`. The HTTP layer serializes this to `{ isSuccess, payload, error }`. The frontend `apiBase.ts` unwraps it automatically.

**Layout Daemon** is a separate executable (`Aphant.Boot.LayoutDaemon`) that runs two independent layout passes per cycle: one for the thought graph and one for the chat graph. It reads positions from the database, runs `FdlLayoutService` physics simulation, and writes back updated positions — decoupled from the HTTP request cycle.

### Environment Configuration

Frontend uses Vite env files (`.env.development`, `.env.production`, `.env.aphantdev`). Backend uses `appsettings.{Environment}.json`. CORS is open in development and locked to `aphant.dev` in production.

**Do not read `appsettings.Production.json` or any `appsettings.*.json` file other than `appsettings.Development.json` and `appsettings.Template.json` / `appsettings.DevTemplate.json`.** Production config files contain live secrets (DB credentials, JWT signing key). Use the `*Template.json` files as the reference for config structure instead.
