# Aether — Project Handoff

> **Product name:** Aether (formerly Life Tracker). The GitHub repository and package.json retain the LFTR/life-tracker identifiers. Do NOT rename the GitHub repository or change the remote URL without explicit authorization.

## Project
Aether — intelligent personal life-management system for ambitious college students.

## Current Phase
Phase 5 — Core Data Model & Feature Implementation

## Current Checkpoint
Checkpoint 5.4 — Verify Persistent Read and Write Operations — COMPLETE

## Repository Status
- Repository: LFTR
- Git branch: `main` (tracked to `origin/main` on GitHub: `https://github.com/zeta-archives/LIFE-TRACKER.git`).
- Phase 1 baseline established (documentation structure, Depth Spell governance).
- Phase 2 complete: technology stack locked; Technical Design Specification formalized.
- Phase 3 complete: screen map, user journeys, visual design system, and Impeccable review formalized.
- Phase 4 complete (Checkpoints 4.1 – 4.4): application scaffolding, desktop application shell, UI components, initial deployment baseline, and foundation pushed to GitHub (`06cc6a7`).
- Phase 5:
  - **Checkpoint 5.1:** Core Data Model specification formalized in `docs/CORE_DATA_MODEL.md`.
  - **Checkpoint 5.2:** Core schema migration (`supabase/migrations/20261023150000_core_schema.sql`) covering all 9 core entities, onboarding trigger `on_auth_user_created`, and strict RLS policies.
  - **Checkpoint 5.3 (Committed & Pushed in `5190755`):** Supabase authentication, session persistence, route protection, and sanctuary login UI.
  - **Checkpoint 5.4 — COMPLETE (Verify Persistent Read & Write Operations):**
    - **Data-layer vertical slice:** Implemented typed operations in `src/data/lifeAreas.ts` (`fetchLifeAreas`, `createLifeArea`, `updateLifeArea`, `deleteLifeArea`) querying existing PostgreSQL table `public.life_areas`.
    - **Reactive context & session isolation:** Created `src/data/lifeAreasContext.tsx` with `LifeAreasProvider` and `useLifeAreas()`. Bound directly to `useAuth()`; completely clears state on sign-out or session transition, preventing any stale cross-session record exposure.
    - **Frontend integration & UX refinement:**
      - Enhanced `src/routes/settings.tsx` with Life Areas management (listing, editing name/color/priority, and deletion with system default protection).
      - Refined Life Area creation UX per user feedback: positioned the compact, accessible `+` action trigger directly beside the "Life Areas" heading in the left sidebar (`src/components/layout/Sidebar.tsx`, `NavGroup.tsx`), powered by the shared `<CreateLifeAreaDialog />` (`src/components/life-areas/CreateLifeAreaDialog.tsx`), and completely removed the creation button/dialog from `src/routes/settings.tsx`.
      - Sidebar dynamically binds configured life areas with live accent dots and Lucide icons.
    - **Persistence & Security verified:**
      - Manual verification: creation, editing, deletion of custom areas, persistence across browser refresh and server restart, and system default protection confirmed working in browser.
      - Automated security tests: unauthenticated `SELECT` returns 0 rows (RLS enforced), unauthenticated `INSERT` rejected by RLS (code 42501), and unique constraint `uq_life_areas_user_slug_active` enforced.
    - **Quality suite:** `npm run typecheck` (exit 0), `npm run lint` (exit 0, 0 warnings), `npm run build` (exit 0, 2138 modules).
- Next Checkpoint: Checkpoint 5.5 — Core Domain Models & Today Workspace Slice.





---

## Approved Technology Stack (LOCKED)

- **UI Framework:** React 19 (client-first desktop web SPA)
- **Build Tool:** Vite
- **Language:** TypeScript with strict mode (`strict: true`)
- **Platform Target:** Windows-focused desktop web application (browser)
- **Server State / Cache:** TanStack Query
- **Transient / Ephemeral State:** Zustand
- **Styling:** Tailwind CSS (utility-first, CSS variable design tokens)
- **Component Primitives:** shadcn/ui + Radix UI (accessible, fully owned components)
- **Icon Library:** Lucide icons
- **Backend & Database:** Supabase (PostgreSQL relational storage, Row Level Security)
- **Authentication:** Supabase Auth (`auth.uid() = user_id`)
- **Deployment:** Vercel (Vite SPA hosting, preview deployments, CI/CD)

### Provisional Libraries (To Be Confirmed When Actually Needed)
- **Life Map Graph:** `@xyflow/react`
- **Charts & Analytics:** `Recharts`
- **Animation / Transitions:** `Motion` (formerly Framer Motion)
- **Calendar UI:** Evaluated during calendar feature implementation
- **Client-Side Routing:** `TanStack Router` (evaluated at scaffolding)
- **Testing:** `Vitest` (evaluated at scaffolding)

---

## Architecture & Technical Design Specification Status

- **Architecture:** Approved. Five-layer architecture (Presentation → Application State & Orchestration → Domain & Intelligence ← Data Access ← Persistence / Backend) with strict downward dependencies.
- **TDS:** Approved. Full Technical Design Specification is maintained in `docs/TECHNICAL_DESIGN.md`.
- **Depth Spell Governance:** Preserved intact in `docs/TDS.md` and wired into Kiro via `.kiro/steering/depth-spell.md`.

---

## Git & Push Status
 
- **Current Branch:** `main`
- **GitHub Remote:** `origin` -> `https://github.com/zeta-archives/LIFE-TRACKER.git`
- **Git Security Baseline:** Verified. `.gitignore` actively protects `.env`, `.env.*`, `node_modules/`, `dist/`, `build/`, `.vercel/`, `coverage/`, and local caches, while allowing `!.env.example`. `.gitattributes` enforces `text=auto eol=lf`.
- **Secret Inspection:** Verified. No secrets, keys, or credentials are present or tracked.
- **Commit & Push Status:** Checkpoint 4.4 commit pushed to `origin/main`.

---

---

## Approved Design System (Checkpoint 3.3)

Formalized in `DESIGN.md` Section 6. Key decisions:

- **Visual personality:** Warm, intelligent, cinematic, subtly magical, personal
- **Color:** Dark neutral backgrounds (warm-tinted) + restrained amber primary accent. Semantic CSS variable token layer between primitives and components. Life area contextual accents: blue (Academics), green (Health), purple (Skills), indigo (Sleep), rose (Relationships), teal (Personal).
- **Typography:** Instrument Serif (expressive/display) + Plus Jakarta Sans (all functional UI) — **LOCKED pairing**. Scale values are starting recommendations, confirmed at implementation.
- **Shape/surface:** Anti-card principle — cards only where they establish meaningful grouping. Open layouts, structural panels, and dividers preferred over card-grid defaults.
- **Component language:** Amber primary buttons; amber focus rings on inputs; consistent task rows across all workspaces; overlay/modal focus management required.
- **Motion:** Restrained and purposeful. Starting timing recommendations: micro 100–150ms, panel 200–280ms, workspace transitions 250–350ms. All respect `prefers-reduced-motion`.
- **Soul Orb:** Recommended direction is **Atmospheric Luminous Ember** — warm amber/gold luminous sphere with internal depth and subtle breathing motion. Implementation technology is an **OPEN DECISION**.
- **Life Orbit:** Visual constellation of life area nodes around the Soul Orb. Rendering technology **OPEN DECISION**.
- **Life Map:** Analytical relationship graph — distinct from Life Orbit. Provisional `@xyflow/react`, dagre-style layout behind abstraction.
- **Life Area identity:** Unified baseline + contextual accent color per area. No separate mini-app visual systems.
- **Data visualization:** Reflection, not scoring. No universal life score. No guilt-driven charts.
- **Accessibility:** WCAG AA contrast, keyboard focus (amber ring), color independence (icon + text always paired with color), `prefers-reduced-motion` support.

### Open Design Decisions (Checkpoint 3.3)

| Decision | Status |
|---|---|
| Soul Orb rendering technology | OPEN — CSS / Canvas / WebGL |
| Ambient grain vs. flat gradients | OPEN — validate visually |
| Life Orbit rendering technology | OPEN — SVG / Canvas / CSS 3D / WebGL |
| Daylight / high-contrast mode | OPEN — post-MVP or accessibility review |
| Exact token file organization | DEFERRED to scaffolding checkpoint |
| Exact sidebar/component dimensions | Starting recommendations in DESIGN.md — confirmed at implementation |
| Exact animation timings | Starting recommendations in DESIGN.md — confirmed at implementation |
| Ctrl+K behavior | OPEN — command palette / AI assistant / both |

---

## Remaining Technical Risks

1. **OneDrive repository location:** The repository is located inside `C:\Users\zetax\OneDrive\...`. Syncing `node_modules` causes severe I/O lag and potential lock errors. Must exclude `node_modules` from OneDrive sync or move repo before running `npm install`.
2. **`.env.local` credentials not yet populated:** File exists but contains placeholder values. The application cannot connect to Supabase until real `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are entered. See Manual Actions in Checkpoint 5.2 status.
3. **Live database connectivity unverified:** Migration applied and tables confirmed by user. However, no application-level query has been made to the live database. End-to-end connectivity must be confirmed manually before 5.3 begins.
4. **RLS enforcement and onboarding trigger untested:** The `on_auth_user_created` trigger and all RLS policies have not been exercised against the live database. Requires a test user signup after credentials are configured.
5. **Supabase CLI not installed / project not linked:** No `supabase/config.toml` exists. Install the CLI and run `supabase link` if CLI-managed migrations are desired for future checkpoints.
6. **Calendar library selection:** Final choice of calendar component/timeline library deferred to the calendar feature implementation.
7. **Life Map graph/layout implementation:** Specific layout algorithm (dagre, elk, manual) behind `@xyflow/react` abstraction deferred to Life Map implementation.
8. **AI provider and model selection:** Vendor/model (Gemini, Claude, OpenAI) deferred to AI integration checkpoint; kept configurable behind server boundary.
9. **Supabase Edge Functions vs. Vercel Serverless Functions:** Allocation of specific server-side operations between Supabase and Vercel functions evaluated per operation.
10. **Exact routing implementation:** TanStack Router vs. alternative router to be confirmed during scaffolding.
11. **Node/CI version strategy:** Target Node 22 LTS vs. Node 24 Current aligned across local and Vercel environments.
12. **Performance and bundle optimization:** Dynamic imports and code-splitting for large visual modules (@xyflow/react, chart libraries) monitored as app scales.

---

## Preserved Project References

1. `PROJECT.md` — concise approved stack, architecture summary, conventions, and risks
2. `FEATURES.md` — approved workspace model, screen map, user journeys, record ownership rules, open decisions
3. `DESIGN.md` — approved interaction, navigation, and visual design system (Checkpoints 3.1 + 3.3)
4. `docs/TECHNICAL_DESIGN.md` — full approved Technical Design Specification (includes FocusSession/Task independence rule added at Checkpoint 3.1)
5. `docs/TDS.md` — Depth Spell governance protocol (untouched)
6. `.kiro/steering/depth-spell.md` — active Kiro steering file
7. `docs/PRODUCT BLUEPRINT.md` — complete master product specification
8. `docs/DESIGN CHOICEES.md` — complete visual design specification

---

## Next Roadmap Checkpoint
 
**Checkpoint 5.3 — Today Workspace Implementation & Data Access Integration**

**Prerequisites before starting 5.3:**
1. Populate `.env.local` with real credentials from the Aether Soul Supabase project dashboard (Settings → API → `anon`/`public` key only — never the service-role key).
2. Run `npm run dev` and confirm in the browser dev console that the Supabase connection warning does not appear and no network errors are present.
3. Optionally: create a test user via Supabase Dashboard → Authentication → Add User to verify the onboarding trigger fires correctly (profile + 6 default life areas created).

With prerequisites satisfied and core data model specified in `docs/CORE_DATA_MODEL.md` and UI primitives ready in `src/components/ui/`, proceed to:
- Implement the Today workspace as the first real feature workspace.
- Establish initial pure TypeScript domain types in `src/domain/task.ts` and `src/domain/schedule.ts`.
- Connect Supabase client and data-access repositories in `src/data/`.
- Configure TanStack Query for server state caching and Zustand for local draft interactions.
- No other workspaces should be implemented ahead of Today.
- **Remember:** No Supabase schema changes or migrations until the Today workspace data model is validated in pure TypeScript domain logic.


