# Life Tracker — Project Reference

## Goal

An intelligent, unified personal life-management system for ambitious college students.
Connects long-term goals to daily actions across multiple life areas, with cross-domain
intelligence, scheduling awareness, and AI-assisted decision support.

## Platform

Desktop web application, Windows-focused, running in a desktop browser.
Native Android and native Windows application development are out of scope.
All older references to Android or cross-platform native application development are superseded.

---

## Approved Technology Stack (Checkpoint 2.4)

### Core Stack — LOCKED

| Concern | Decision | Notes |
|---|---|---|
| UI framework | React 19 | Client-first SPA, concurrent capabilities |
| Build tool | Vite | Fast dev server, ESM bundling |
| Language | TypeScript (strict mode) | `strict: true` in tsconfig, zero unvetted `any` |
| Client architecture | Windows-focused desktop web SPA | Large-screen layout, keyboard/mouse priority |
| Server / persisted state | TanStack Query | Query caching, background refetch, mutation invalidation |
| Transient / UI state | Zustand | Ephemeral state, modals, active selections, draft sessions |
| Styling | Tailwind CSS | Utility-first CSS, CSS variable design tokens |
| Component primitives | shadcn/ui + Radix UI | Accessible, owned unstyled components |
| Icons | Lucide icons | Cohesive icon set across life areas |
| Backend & database | Supabase (PostgreSQL) | Relational storage, RLS, Edge Functions, Storage |
| Authentication | Supabase Auth | User identity, session management, RLS integration |
| Deployment | Vercel | Vite SPA hosting, preview deployments, CI/CD |

### Platform Approvals & Reasoning

- **Supabase** is approved as the backend/data platform because the application requires:
  - PostgreSQL relational database storage for complex interconnected entities
  - Built-in authentication (Supabase Auth)
  - Row Level Security (RLS) guaranteeing user data isolation at the database layer
  - User-owned record enforcement (`auth.uid() = user_id`)
  - Future realtime subscriptions (e.g., active focus session sync across tabs)
  - Server-side functions (Edge Functions) where appropriate
- **Vercel** is approved for:
  - High-performance Vite SPA deployment and global CDN distribution
  - Automatic branch and preview deployments
  - Production hosting with zero-config SPA rewrite support
  - Server-side functions and API boundary where appropriate

### Provisional Libraries (To Be Confirmed When Actually Needed)

Do not treat provisional libraries as permanently locked until implemented:
- **@xyflow/react** — Life Map graph and node canvas visualization
- **Recharts** — Analytics and progress charting
- **Motion** (formerly Framer Motion) — Meaningful UI and state transitions
- **Calendar library** — Evaluated at calendar feature implementation
- **TanStack Router** — Client-side routing (provisional; evaluated at scaffolding)
- **Vitest** — Unit and domain logic testing runner

---

## Technical Design Specification

The full Technical Design Specification is in `docs/TECHNICAL_DESIGN.md`.
It is the authoritative technical reference for all architecture and implementation decisions.
This file (`PROJECT.md`) is the concise reference.

---

## Application Architecture

Approved at Checkpoint 2.2, specified at Checkpoint 2.3, locked at Checkpoint 2.4.

### Five Layers (Strict Downward Dependencies)

```
Presentation
      ↓
Application State & Orchestration
      ↓
Domain & Intelligence
      ↑
Data Access
      ↑
Persistence / Backend
```

1. **Presentation (`src/routes/`, `src/components/`, `src/features/`):** React components, layouts, interactions, visual presentation. No direct Supabase calls, no business logic.
2. **Application State & Orchestration (`src/queries/`, `src/stores/`, `src/hooks/`):** TanStack Query (server state), Zustand (transient/local state), URL search params (shareable view state), mutation coordination.
3. **Domain & Intelligence (`src/domain/`):** Pure TypeScript. Canonical models, business invariants, attendance/streak/progress calculations, scheduling logic, Life Sync trade-off engine. Zero infrastructure dependencies (no React, no Supabase, no browser APIs).
4. **Data Access (`src/data/`):** Repositories, database row-to-domain mappers, isolated Supabase client queries. UI never touches Supabase directly.
5. **Persistence / Backend:** Supabase (PostgreSQL, RLS, Auth, Edge Functions) and Vercel server-side API boundary.

---

## Core Development Conventions

- **Framework-independent domain logic:** `src/domain/` contains pure TypeScript only. All domain calculations accept an explicit `referenceDate` so they are 100% deterministic and testable without mocks.
- **Data access boundary:** Supabase is accessed exclusively through `src/data/`. Direct Supabase imports or queries inside UI components or presentation hooks are strictly prohibited.
- **Server state vs. transient state:** Server state lives exclusively in TanStack Query; transient/uncommitted state lives in Zustand; shareable filter/view state lives in URL search parameters. Server records are never duplicated in client stores.
- **One canonical Task model:** All tasks (academics, assignments, milestones, routines, custom) share the single canonical Task domain model. No screen-specific task duplicates.
- **Derived calculations over mutable counters:** Progress percentages, streaks, attendance rates, and Life Sync conflicts are computed dynamically from canonical raw records—never stored as mutable authoritative counter columns.
- **Timestamp-based focus timing:** Focus timer state is driven by start and pause timestamps. Wall-clock elapsed time is calculated dynamically. UI countdowns are display aids only.
- **Server-side AI boundary:** AI interactions pass through a secure server-side boundary with grounded context snapshots. AI is assistive and proposal-based; user confirms all changes before persistence.
- **No duplicated business logic:** Today, Calendar, Goals, Focus, Insights, and Life Sync all consume the exact same domain functions from `src/domain/`.
- **Windows desktop web only:** Responsive desktop browser layout with keyboard/mouse efficiency. Native mobile is out of scope.

---

## Security Rules (Permanent Project Policy)

- **Never commit `.env`, `.env.local`**, or any secret-bearing environment files to git.
- **`.env.example` may contain placeholders only** (e.g., `VITE_SUPABASE_URL=your-project-url`).
- **Never expose Supabase service-role keys or AI/LLM API secrets** to the browser.
- **Never expose secrets** in logs, reports, screenshots, documentation, or commits.
- **Inspect staged files before every commit** (`git status`, `git diff --staged`) to guarantee no secrets or unintended files are tracked.

---

## Remaining Technical Risks & Future Decisions

The following items are explicitly recorded as pending decisions or risks; they must be resolved at their designated checkpoints without premature or invented solutions:

1. **OneDrive repository location:** The local repository is in a OneDrive-synced folder (`C:\Users\zetax\OneDrive\...`). Syncing `node_modules` causes severe I/O slowdown and lock conflicts. Must exclude `node_modules` from sync or move repo to a dedicated dev directory prior to `npm install`.
2. **Exact database schema:** Complete PostgreSQL table schemas, foreign keys, and indexes are deferred to Checkpoint 2.5 / database design.
3. **Calendar library selection:** Final choice of calendar component/timeline library deferred to the calendar feature implementation.
4. **Life Map graph/layout implementation:** Specific layout algorithm (dagre, elk, manual) behind the `@xyflow/react` abstraction deferred to Life Map implementation.
5. **AI provider and model selection:** Specific LLM vendor/model (Gemini, Claude, OpenAI) deferred to AI integration checkpoint; kept configurable behind server boundary.
6. **Supabase Edge Functions vs. Vercel Serverless Functions:** Allocation of specific server-side operations between Supabase and Vercel functions evaluated per operation.
7. **Exact routing implementation:** TanStack Router vs. alternative router to be confirmed during scaffolding.
8. **Node/CI version strategy:** Target Node 22 LTS vs. Node 24 Current aligned across local and Vercel environments.
9. **Performance and bundle optimization:** Dynamic imports, code-splitting for large modules (@xyflow/react, chart libraries) monitored as app scales.

---

## Current Status (Phase 3 Complete — Checkpoint 3.4 Complete)

- **Approved Stack:** React 19 + Vite + TypeScript (strict) + TanStack Query + Zustand + Tailwind CSS + shadcn/ui + Radix UI + Lucide + Supabase + Vercel.
- **Approved Architecture:** Five-layer architecture with pure domain layer, isolated data access, and canonical models.
- **Screen Map and User Journeys:** Formalized in `FEATURES.md` and `DESIGN.md` (Sections 1–5, 7–10).
- **Visual Design System:** Formalized in `DESIGN.md` Section 6 — personality, color (amber primary, semantic tokens, life area accents), typography (Instrument Serif + Plus Jakarta Sans), spacing, shape/surface language, component language, motion, Soul Orb direction (Atmospheric Luminous Ember — recommended), Life Orbit and Life Map visual language, accessibility, anti-patterns.
- **Design Review & Refinement:** Checkpoint 3.4 complete via Impeccable environment verification and design critique; `DESIGN.md` refined.
- **Next Checkpoint:** Phase 4 / Checkpoint 4.1 — Application Scaffolding.
- **Implementation State:** No application code written. No npm packages installed. No database migrations created.
