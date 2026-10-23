# Life Tracker — Technical Design Specification

**Version:** 1.0
**Established:** Checkpoint 2.3
**Status:** Active — governs all implementation decisions

---

## How to Read This Document

Decisions are classified throughout using these labels:

- **LOCKED** — finalized; do not deviate without a documented architectural decision
- **PROVISIONAL** — direction is set but detail or library is confirmed at implementation time
- **DEFERRED** — deliberately not decided yet; the checkpoint where it belongs is noted
- **UNRESOLVED** — open question with a documented provisional stance

This document is the authoritative technical reference for Life Tracker.
`PROJECT.md` is the concise summary. This document is the full specification.

---

## 1. Project Overview

Life Tracker is a unified personal life-management system for ambitious college students.
It connects long-term goals to daily actions across multiple life areas, provides
cross-domain scheduling intelligence (Life Sync), and offers AI-assisted decision support.

**Platform:** Windows-focused desktop web application, running in a browser.
Native Android and native Windows application development are out of scope.
Older references to Android or cross-platform native development are superseded.

---

## 2. Technology Stack

### 2.1 Core Stack — LOCKED

| Concern | Technology | Notes |
|---|---|---|
| UI framework | React 19 | Client-first SPA, concurrent capabilities, modern React architecture |
| Build tool | Vite | Fast HMR dev server, ESM-native production bundling |
| Language | TypeScript — strict mode | `strict: true` in tsconfig; zero unvetted `any` |
| Client architecture | Windows-focused desktop web SPA | Large-screen layouts, keyboard/mouse priority, responsive desktop browser |
| Server state / cache | TanStack Query | Remote data fetching, query caching, background refetch, mutation invalidation |
| Transient / UI state | Zustand | Ephemeral UI state, session state, modals, transient draft sessions |
| Styling | Tailwind CSS | Utility-first; design tokens via CSS variables |
| Component primitives | shadcn/ui + Radix UI | Accessible unstyled primitives; components are fully owned in the repository |
| Icon library | Lucide icons | Cohesive icon family across all life areas |
| Backend & database | Supabase (PostgreSQL) | PostgreSQL relational storage, Row Level Security, Edge Functions, Storage |
| Authentication | Supabase Auth | User identity, session persistence, direct RLS integration |
| Deployment | Vercel | High-performance Vite SPA hosting, preview deployments, CI/CD |

Exact library versions are pinned at scaffolding time (Phase 3 / Checkpoint 3.1).

### 2.2 Backend & Deployment Platform Approval — LOCKED

#### Supabase Approval & Reasoning
Supabase is approved as the backend/data platform because Life Tracker requires:
- **PostgreSQL relational storage:** Complex relationships among life areas, goals, milestones, tasks, routines, and focus sessions demand strong relational consistency and foreign keys.
- **Supabase Auth:** Built-in secure user identity management and session persistence.
- **Row Level Security (RLS):** Absolute guarantee that user data is isolated at the database level (`auth.uid() = user_id`) across all tables.
- **User-owned records:** Native enforcement of data ownership policies.
- **Future realtime capability:** WebSockets/subscriptions for active focus session synchronization across multiple browser tabs.
- **Server-side functions:** Edge Functions for privileged operations and AI proxy execution.

#### Vercel Approval & Reasoning
Vercel is approved as the hosting and deployment platform for:
- **Vite SPA deployment:** Native static hosting with global CDN distribution and optimized asset caching.
- **Preview deployments:** Automated branch and pull-request preview environments for continuous visual and functional inspection.
- **Production hosting:** Seamless zero-configuration routing via `vercel.json` SPA rewrites.
- **Server-side functions:** Optional serverless API functions providing a server boundary where needed.

### 2.3 Platform Scope — LOCKED

- **Target:** Desktop web application intended primarily for Windows desktop browsers.
- **Scope limitation:** Native Android and native Windows application development are strictly out of scope.
- **Superseded references:** Any older references to Android or cross-platform native apps in earlier documentation are superseded.

### 2.4 Provisional Libraries — Evaluated When the Feature Is Built

These are the approved provisional directions to be evaluated and confirmed when the corresponding feature is implemented. Do NOT treat them as permanently locked until scaffolding or feature implementation:

| Purpose | Provisional Choice | Evaluate At |
|---|---|---|
| Graph / node canvas (Life Map) | @xyflow/react | Life Map implementation |
| Charts and data visualization | Recharts | First visualization feature |
| Animation / motion | Motion (formerly Framer Motion) | First animated feature |
| Calendar UI | TBD — evaluate at calendar feature | Calendar implementation |
| Client-side routing | TanStack Router (provisional) | Scaffolding; confirm or substitute |
| Unit / integration testing | Vitest | Scaffolding |

### 2.5 Superseded / Out of Scope

- Native Android application — out of scope
- Native Windows application — out of scope
- Cross-platform mobile frameworks — out of scope


---

## 3. Application Architecture — LOCKED

### 3.1 Layer Overview

```
┌─────────────────────────────────────────┐
│  Presentation                           │
│  src/routes/  src/components/           │
│  src/features/*/views/                  │
└──────────────┬──────────────────────────┘
               │ uses
┌──────────────▼──────────────────────────┐
│  Application State & Orchestration      │
│  src/queries/  src/stores/  src/hooks/  │
└──────────────┬──────────────────────────┘
               │ calls
┌──────────────▼──────────────────────────┐
│  Domain & Intelligence                  │
│  src/domain/                            │
│  Pure TypeScript only                   │
└──────────────┬──────────────────────────┘
               │ consumed by
┌──────────────▼──────────────────────────┐
│  Data Access                            │
│  src/data/                              │
│  Repositories, mappers, Supabase client │
└──────────────┬──────────────────────────┘
               │ queries
┌──────────────▼──────────────────────────┐
│  Persistence / Server Backend           │
│  Supabase (PostgreSQL, RLS, Auth,       │
│  Edge Functions)                        │
│  Vercel server-side API (privileged ops)│
└─────────────────────────────────────────┘
```

**Dependency direction (LOCKED):**

```
Presentation → State/Orchestration → Domain
Data Access  → Domain
Persistence  → Data Access boundary only
```

The Domain & Intelligence layer must remain independent of all infrastructure.
Data Access depends on Domain (for types/models) but nothing in Domain imports Data Access.

### 3.2 Layer 1 — Presentation

**Locations:** `src/routes/`, `src/components/`, `src/features/*/views/`

**Responsibilities:**
- Route definitions and screen-level layout
- React components, visual presentation, and animations
- User input handling and interaction feedback
- Rendering derived data supplied by the state/orchestration layer

**LOCKED prohibitions — never place in Presentation:**
- Direct Supabase client imports or `.from()` calls
- Business rule implementations (progress formulas, streak logic, attendance calculations)
- Duplicate domain models or local copies of server records
- Independent per-screen progress or streak calculations

### 3.3 Layer 2 — Application State & Orchestration

**Locations:** `src/queries/`, `src/stores/`, `src/hooks/`

**Responsibilities:**
- TanStack Query: all server state, caching, background refetch, optimistic updates
- Zustand: ephemeral UI state — open panels, modal state, active selections, transient form drafts
- Mutation execution and post-mutation cache invalidation
- Composing domain logic with fetched data before passing to Presentation
- URL search parameter state for shareable view/filter state

**State routing rules (LOCKED):**
- Server / persisted records → TanStack Query only
- High-frequency local / uncommitted UI state → Zustand
- Shareable view state (active tab, filters, selected item) → URL search params
- Never duplicate a server record in Zustand or React context
- Centralize mutation invalidation — do not scatter `queryClient.invalidateQueries` across components

### 3.4 Layer 3 — Domain & Intelligence

**Location:** `src/domain/`

**Responsibilities:**
- Canonical domain model types and interfaces — shared across the entire application
- All shared business rules and invariants
- Deterministic calculations: goal progress, streak status, attendance percentage, trajectory
- Scheduling logic and conflict detection
- Life Sync trade-off analysis and scoring
- Derived selectors and computed views over domain data

**LOCKED constraints:**
- Pure TypeScript only — zero imports of React, Supabase, browser APIs, or Node built-ins
- Must be fully testable with Vitest in isolation — no browser, no running backend required
- No infrastructure dependency of any kind
- Domain functions that involve dates/times must accept an explicit `referenceDate` parameter so they are deterministic in tests

### 3.5 Layer 4 — Data Access

**Location:** `src/data/`

**Contents:**
- One Supabase browser client instance (created once, imported by repositories)
- Repository modules — one per domain area (e.g., `taskRepository`, `goalRepository`, `attendanceRepository`)
- Mapper functions: database row → domain model (explicit, not implicit)
- Authentication access helpers
- AI API client (calls the server-side boundary, not an LLM directly)
- Any other external API communication

**LOCKED boundary rule:**
- All `.from()`, `.rpc()`, `.auth.*` calls live exclusively in `src/data/`
- UI components and hooks must never import the Supabase client directly
- Repository methods return mapped domain models — never raw PostgREST rows
- Normalize Supabase errors into typed application-level errors before they leave this layer
- Avoid N+1 query patterns; prefer workspace-level coarse queries + domain selectors

### 3.6 Layer 5 — Persistence / Server Backend

**Technology:** Supabase (PostgreSQL) + Vercel server-side API

**Responsibilities:**
- PostgreSQL schema, data integrity, foreign keys
- Row Level Security (RLS) on every user-owned table — mandatory, not optional
- Ownership policies using `auth.uid()` — `WHERE user_id = auth.uid()`
- Supabase Auth for authentication
- PostgreSQL RPC functions for operations requiring atomic multi-record transactions
- Supabase Edge Functions (or Vercel API routes) for privileged server-side operations
- All AI/LLM calls — the server-side AI boundary (see Section 8)

---

## 4. Canonical Domain Model — LOCKED

### 4.1 One Source of Truth

Aether has a single canonical domain model.
Today, Calendar, Goals, Focus, Insights, Life Map, Life Sync, and AI all consume
the same underlying record types and the same shared business logic.

For the detailed entity inventory, relationship definitions, cardinality, RLS constraints, and future entity boundaries, see the authoritative specification in `docs/CORE_DATA_MODEL.md` (established at Checkpoint 5.1).

**Prohibited patterns:**
- A separate task system for Academics disconnected from the main Task model
- A separate task system for Goals disconnected from the main Task model
- Calendar maintaining an unrelated duplicate commitment model
- Progress recalculated differently on each screen
- Streak counters incremented independently by different features

### 4.2 Conceptual Hierarchy — LOCKED

```
LifeArea
  └── Goal
        └── Milestone
              └── Task
                    └── FocusSession
```

- A **LifeArea** is a top-level domain of the user's life (Academics, Health, Skills, etc.)
- A **Goal** belongs to a LifeArea and represents a meaningful outcome
- A **Milestone** breaks a Goal into verifiable intermediate outcomes
- A **Task** is an actionable unit of work; it belongs to a Milestone or directly to a Goal
- A **FocusSession** is a recorded time block linked to a Task

Cross-domain relationships (e.g., a Task that affects both Academics and Skills) use a
lightweight relationship model rather than separate duplicated entity types.

### 4.2a FocusSession and Task Completion Are Independent — LOCKED

**A completed FocusSession does NOT automatically complete its linked Task.**

These are separate domain events with separate records and separate completion states.

| Event | Record written | Domain effect |
|---|---|---|
| Focus session completed | `FocusSession` with `completed_at` timestamp | Time logged; effort recorded; may contribute to streak-qualifying activity |
| Task marked complete | `Task` with `completed_at` timestamp | Task done; milestone progress recalculates; goal progress recalculates |

**Valid user scenarios that must all be supported:**
- Complete a task without ever starting a focus session
- Run one or more focus sessions against a task and still leave the task incomplete
- Run multiple focus sessions across several days before marking the task complete
- Save a partial focus session (interrupted work) without completing the task
- Postpone a task after a focus session — work is recorded, task remains open
- Intentionally skip or pause a recurring routine — recorded as paused, not failed

**Implementation constraints:**
- The `FocusSession` completion mutation must NOT trigger a task-completion mutation
- Task completion is always an explicit, separate user action
- Domain logic that calculates goal or milestone progress must treat focus session records
  as effort signals only — not as task-completion signals
- A focus session record's presence does not imply its linked task is complete

### 4.3 Shared Task Model

Academics assignments, Goal sub-tasks, Fitness sessions, and Skills practice sessions
all resolve to the canonical **Task** model. They are not separate systems.
Domain-specific metadata is stored as typed extensions on the shared model.

### 4.4 Derived Data Rule — LOCKED

Do not store mutable derived values as authoritative state.
The following must be calculated deterministically from raw records:

| Derived value | Calculated from |
|---|---|
| Goal progress percentage | Completed milestones / total milestones + task completion signals |
| Streak status | Ordered activity records + reference date |
| Attendance percentage | Attended sessions / total sessions for a subject |
| Trajectory (on track / at risk) | Progress rate vs. remaining time to deadline |
| Life Sync conflicts | Canonical schedule + priorities + domain rules |

Historical records must support deterministic recalculation.
Do not allow edits that would make past records inconsistent without recording the revision.

---

## 5. State Management — LOCKED

| State type | Tool | Rule |
|---|---|---|
| Remote / persisted data | TanStack Query | All server records live here; never duplicated elsewhere |
| Ephemeral UI state | Zustand | Modals, drawers, active selections, transient drafts |
| Shareable view state | URL search params | Filters, active tab, selected item — survives page share |
| Form draft state | Local React state or controlled Zustand slice | Committed on save |

Mutations must invalidate the relevant TanStack Query keys centrally.
Do not scatter invalidation logic across unrelated components.

---

## 6. Data Access Rules — LOCKED

- One Supabase browser client, created once in `src/data/supabaseClient.ts`
- All database interaction goes through repository functions in `src/data/`
- Repository functions return typed domain models, not raw rows
- Supabase errors are normalized to typed `AppError` before crossing into the application
- N+1 queries are prohibited — fetch coarsely and filter/select with domain logic
- Auth state is accessed through a dedicated helper, not directly scattered across components

### 6.1 Initial Schema & RLS Policy Baseline (Checkpoint 5.2)

- **Migration File:** `supabase/migrations/20261023150000_core_schema.sql`
- **Core Entities:** `profiles`, `life_areas`, `goals`, `milestones`, `tasks`, `routines`, `calendar_events`, `focus_sessions`, `progress_records`
- **User Ownership:** All 9 tables carry foreign keys referencing `auth.users(id)`.
- **Mandatory RLS:** Enabled on all 9 tables. Strict tenant isolation requires `auth.uid() = user_id`.
- **Relational Ownership Checks:** Insert and update policies validate that foreign key references (`life_area_id`, `goal_id`, `milestone_id`, `task_id`) also belong to `auth.uid()`, preventing cross-user attachment attacks.
- **Automatic User Onboarding:** Trigger `on_auth_user_created` on `auth.users` creates the initial `profile` and populates the 6 standard system default life areas upon user registration.


---

## 7. Authentication & Security — LOCKED

- **Authentication:** Supabase Auth (email/password initially; social providers PROVISIONAL)
- **Protected routes:** All authenticated routes must check session state before rendering
- **RLS:** Every user-owned table must have RLS enabled with an owner policy
- **Ownership:** `user_id = auth.uid()` on all user-owned records
- **User-scoped cache:** TanStack Query cache must be keyed and cleared per user session; one user must never see another user's cached data

### 7.1 Secret Protection — PERMANENT RULE

These rules apply to every session, every tool, every commit:

- Never commit `.env`, `.env.local`, or any file containing real secrets to git
- `.env.example` may contain placeholder values only (e.g., `VITE_SUPABASE_URL=your-url-here`)
- `VITE_` prefixed variables are exposed to the browser bundle — only use them for values that are genuinely safe to expose (Supabase project URL and anon key are safe; service-role key is not)
- Supabase service-role key, LLM API keys, and all privileged credentials must remain server-side only
- Before every commit: inspect `git status` and `git diff --staged` to confirm no secret-bearing files are staged
- Add `.env.local`, `.env.*.local`, and other secret-bearing patterns to `.gitignore` before the first `npm install`
- Do not print, log, or include secret values in reports, prompts, screenshots, or generated documentation

---

## 8. AI Architecture — LOCKED

The client never communicates directly with an LLM using privileged credentials.

### 8.1 Boundary

```
Client (browser)
    │  authenticated request + structured context snapshot
    ▼
Server-side boundary (Supabase Edge Function or Vercel API route)
    │  constructs prompt + injects grounded context
    ▼
LLM provider (model/provider is PROVISIONAL and configurable)
    │  returns structured proposal / action set
    ▼
Server validates and returns to client
    │
Client presents proposal — user reviews and confirms
    │
Client submits confirmed action → Data Access layer → Supabase
```

### 8.2 Rules

- The client provides: user message + deterministic domain context snapshot (pre-built server-side)
- The AI receives grounded, structured context — not unrestricted database access
- The AI returns structured proposals or action sets — it does not directly write to the database
- The user reviews and confirms AI-suggested changes before they are written
- AI has no unrestricted write access to application data
- The LLM provider and model are configurable and not locked to any one vendor

---

## 9. Focus Timer Architecture — LOCKED

Focus sessions use timestamp-based state. A decrementing UI counter is a display aid only.

### 9.1 State Machine

```
idle → running → paused → running → completed
                                  → cancelled
```

### 9.2 Rules

- Record `started_at` (ISO timestamp) when a session begins
- Record `paused_at` / `resumed_at` intervals as an array of pause records
- Elapsed time = `(now - started_at) - sum(paused intervals)`
- The UI counter reads from this calculation on each render tick — it does not drive state
- Timer state must survive page refresh (persisted to Supabase before page close or on interval)
- React render frequency is never the source of truth for elapsed time
- Do not store decrement state in Zustand as the authoritative timer record

---

## 10. Scheduling Architecture — LOCKED PRINCIPLES, PROVISIONAL DETAIL

### 10.1 Commitment Priority

| Priority | Meaning | Rescheduling |
|---|---|---|
| Must | Fixed commitments — classes, exams, confirmed appointments | Effectively immovable |
| Should | Important goals and routines | Can be proposed for rescheduling with user confirmation |
| Could | Optional activities | Can be moved freely by the scheduling engine |

Protected sleep time is treated as Must by default.

### 10.2 User Confirmation

The scheduling engine proposes changes. The user confirms or rejects them.
No consequential schedule change is applied silently.

### 10.3 Day Boundary — UNRESOLVED (Provisional Stance)

**Provisional:** Use local midnight as the logical day boundary for simplicity and consistency.
This keeps day-boundary calculations predictable and testable without timezone complexity.
Document this decision; revisit only if product requirements later justify a configurable rollover time.

---

## 11. Derived Calculations — LOCKED

All calculations must be:
- **Deterministic:** same input always produces same output
- **Testable:** domain functions accept explicit `referenceDate` so tests do not depend on `Date.now()`
- **Honest about data gaps:** distinguish "insufficient data" from "zero performance"

### 11.1 Attendance

```
attendancePercentage(records, referenceDate) → number
```

Calculated from attended / total for the subject up to `referenceDate`.
Never fabricate attendance records. Never infer attendance from assumptions.

### 11.2 Streaks

```
currentStreak(activityRecords, referenceDate) → StreakResult
```

Calculated from ordered activity records. A streak breaks when a required period has no qualifying activity.
Intentional pauses are recorded explicitly and do not automatically break a streak.
Do not increment a `current_streak` counter as a mutable field — derive it.

### 11.3 Goal Progress

Derived from milestone and task completion signals against the goal's structure.
Not stored as a mutable `progress_percent` column.

### 11.4 Life Sync Conflict Detection

Derived from the canonical schedule, task deadlines, priorities, and domain rules.
Results are computed on demand — not persisted as a separate conflict table.

---

## 12. Testing — LOCKED PRINCIPLES

| Scope | Tool | Status |
|---|---|---|
| Domain & Intelligence layer | Vitest | Mandatory from scaffolding |
| Data Access layer (repository mappers) | Vitest | Mandatory |
| Component rendering | Vitest + React Testing Library | PROVISIONAL |
| Full browser E2E | Playwright / Cypress | DEFERRED — justified when needed |

Domain logic tests must be deterministic and require no browser or running backend.
Test files for domain logic live adjacent to the modules they test (`*.test.ts`).

---

## 13. Deployment Architecture — LOCKED PRINCIPLES

| Concern | Decision |
|---|---|
| Frontend hosting | Vercel |
| Build output | Vite SPA |
| SPA routing fallback | Vercel `rewrites` config: all paths → `index.html` |
| Server-side API | Vercel API routes or Supabase Edge Functions |
| Privileged secrets | Server-side only; never in Vite bundle |
| Database | Supabase (PostgreSQL) |
| CI/CD | Vercel GitHub integration |

Exact Vercel project configuration, environment variable structure, and branch deployment
rules are DEFERRED to the deployment checkpoint.

---

## 14. Life Map Architecture — PROVISIONAL

Life Map visualizes relationships among goals, milestones, tasks, routines, and life areas.

**Provisional library:** `@xyflow/react` — confirm at implementation time.

**Layout approach (UNRESOLVED — Provisional Stance):**
Use deterministic automatic layout initially (e.g., a hierarchical/dagre-style algorithm)
isolated behind a `LifeMapLayout` abstraction. Do not hard-code the product architecture
to one graph-layout library. The abstraction allows the algorithm to be swapped without
rewriting the rest of Life Map.

Exact layout algorithm and library are confirmed at the Life Map implementation checkpoint.

---

## 15. Database Schema — DEFERRED

**The complete PostgreSQL database schema is intentionally not finalized here.**

This decision belongs to the database-design checkpoint (Checkpoint 2.4+).

What is established now:
- The conceptual hierarchy: LifeArea → Goal → Milestone → Task → FocusSession
- All user-owned tables require RLS with `user_id = auth.uid()` ownership policies
- Multi-record atomic operations use PostgreSQL RPC functions
- Mutable derived values (streak, progress_percent) must not be stored as authoritative columns
- Exact table names, column names, and foreign key structure are DEFERRED

---

## 16. Multi-Record Atomic Writes — UNRESOLVED (Provisional Stance)

**Provisional:** Use PostgreSQL RPC functions (Supabase `.rpc()`) for operations that
genuinely require atomic multi-record transactions (e.g., completing a milestone and
updating related task statuses in one operation).

Ordinary single-record CRUD remains repository/PostgREST based.
Do not prematurely wrap all writes in RPC functions.

---

## 17. Demo / Seed Data — UNRESOLVED (Provisional Stance)

**Provisional:** Use deterministic, realistic student demo/seed data so the application
can be demonstrated and developed without manually entering all records.

Seed data is scripted, reproducible, and representative of real usage.
It does not substitute for actual user data in production.
Seed data implementation is DEFERRED to the scaffolding/testing checkpoint.

---

## 18. Product Principles — LOCKED

These principles constrain feature design and implementation decisions.

- **Whole-person system:** Life Tracker is not a productivity score. It recognizes multiple dimensions of a person's life.
- **Sustainable progress:** The application must never make users feel guilty for resting. Breaks and pauses are valid.
- **Intentionality over blind consistency:** Streaks must not override intentional pauses. Distinguish abandoned, paused, changed, and interrupted goals.
- **No universal life score:** Do not create a single metric purporting to measure how well someone is living.
- **AI assists; user decides:** AI recommends; the user confirms. AI never silently mutates data.
- **Grounded recommendations:** AI and Life Sync recommendations must be based on actual records. Never fabricate attendance, deadlines, or progress data.
- **No guilt-based streak logic:** An intentional break must not be presented as failure.

---

## 19. Architectural Risks and Mitigations

| Risk | Mitigation / Future Decision Boundary |
|---|---|
| Domain layer contamination — React or Supabase imports creeping into `src/domain/` | Import boundary lint rule (e.g., `eslint-plugin-import` boundary config) enforced at scaffolding time |
| Supabase query sprawl — components importing Supabase client directly | Data-access boundary rule; enforced by lint and code review |
| Duplicate business logic — multiple screens computing the same derived value differently | Single domain layer; shared selectors; code review rejects duplicates |
| Timer drift on page refresh | Timestamp-based timing; state persisted to Supabase; UI counter is display only |
| AI data exposure — LLM receiving raw unfiltered user data from the browser | Server-side AI boundary; structured context passed explicitly |
| N+1 database queries | Repository-level design; prefer coarse queries + domain selectors |
| Secret leakage via committed .env files | `.gitignore` configured before first install; pre-commit check |
| OneDrive repository location & dependency-sync conflict | Repository is currently in OneDrive sync root (`C:\Users\zetax\OneDrive\...`). Syncing `node_modules` causes severe disk I/O lockup and potential install corruption. Must exclude `node_modules` from sync or move repo to a dedicated non-synced folder prior to `npm install` |
| Exact database schema lock-in | Complete PostgreSQL table definitions, column types, foreign keys, and indexes are intentionally deferred to Checkpoint 2.5 |
| Calendar library selection | Calendar component/timeline library deferred to the calendar feature implementation |
| Life Map graph and layout implementation | Layout algorithm (dagre, elk, or manual positioning) isolated behind a `LifeMapLayout` abstraction; library `@xyflow/react` is provisional |
| AI provider and model selection | Vendor (Gemini, Claude, OpenAI) and model parameters remain configurable behind the server-side boundary |
| Supabase Edge Functions vs. Vercel server-side functions | Choice between Supabase Edge Functions and Vercel serverless functions evaluated per operation |
| Exact routing implementation | TanStack Router vs. alternative router to be confirmed during scaffolding |
| Node/CI version alignment | Target Node 22 LTS vs. Node 24 Current aligned across local development and Vercel deployment environments |
| Performance and bundle optimization as app grows | Code-splitting, dynamic imports for heavy visual libraries (@xyflow/react, chart libraries) monitored during growth |

---

## 20. Decisions Summary

### Locked (Approved at Checkpoint 2.4)

- Core Technology Stack: React 19, Vite, TypeScript (strict mode), Windows-focused desktop web SPA, TanStack Query, Zustand, Tailwind CSS, shadcn/ui + Radix UI, Lucide icons, Supabase (PostgreSQL, Supabase Auth, RLS), Vercel
- Five-layer architecture and strict downward dependency direction
- `src/domain/` = pure TypeScript, zero infrastructure imports, fully deterministic domain calculations
- `src/data/` = all Supabase access; UI never touches Supabase directly
- One canonical Task model; conceptual hierarchy: LifeArea → Goal → Milestone → Task → FocusSession
- Derived-data rule — progress, streaks, attendance, and conflicts computed dynamically; no mutable counter columns
- Timestamp-based focus timer architecture
- Server-side AI boundary with proposal-based user confirmation
- RLS on all user-owned tables with `auth.uid() = user_id` ownership
- Permanent secret protection rules (`.env`, `.env.local` never committed; service-role keys never exposed to browser)
- Platform scope: Windows desktop web application only; native Android/Windows out of scope

### Provisional (To Be Confirmed When Actually Needed)

- @xyflow/react for Life Map
- Recharts for analytics and charting
- Motion for meaningful UI transitions
- Calendar library (evaluated at calendar implementation)
- TanStack Router (evaluated at scaffolding)
- Vitest for unit and domain testing (evaluated at scaffolding)
- Social auth providers in Supabase Auth
- React Testing Library for component testing
- Life Map layout algorithm (dagre, elk, or manual)

### Deferred (Belongs to Later Checkpoints)

- Complete PostgreSQL database schema and column names (Checkpoint 2.5)
- Exact Supabase table names, foreign keys, and index configurations (Checkpoint 2.5)
- TanStack Query key hierarchy and query organization
- Zustand store shape and slice boundaries
- Vercel project configuration and environment variable structure
- E2E testing strategy and tooling
- Exact `src/` directory structure beyond `domain/` and `data/`
- Seed data implementation

### Unresolved (Provisional Stance Documented)

- Day boundary: local midnight (Section 10.3)
- Multi-record atomic writes: PostgreSQL RPC for genuine transactions (Section 16)
- Demo/seed data: deterministic realistic student data (Section 17)
- Life Map layout: deterministic automatic layout behind abstraction (Section 14)

