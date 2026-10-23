# Aether — Project Handoff

> **Product name:** Aether (formerly Life Tracker). The GitHub repository and package.json retain the LFTR/life-tracker identifiers. Do NOT rename the GitHub repository or change the remote URL without explicit authorization.

## Project
Aether — intelligent personal life-management system for ambitious college students.

## Current Phase
Phase 4 — Application Implementation

## Current Checkpoint
Checkpoint 4.4 — Deploy Initial Application Shell & Verified Foundation — COMPLETE (Phase 4 Exit)

## Repository Status
- Repository: LFTR
- Git branch: `main` (tracked to `origin/main` on GitHub: `https://github.com/zeta-archives/LIFE-TRACKER.git`).
- Phase 1 baseline established (documentation structure, Depth Spell governance).
- Phase 2 complete: technology stack locked; Technical Design Specification formalized.
- Phase 3 complete: screen map, user journeys, visual design system, and Impeccable review formalized.
- Phase 4 complete (Checkpoints 4.1 – 4.4):
  - **4.1 Scaffolding:** React 19 + Vite 6 + TypeScript (strict mode) + Tailwind CSS with semantic CSS variables, Instrument Serif + Plus Jakarta Sans fonts, TanStack Router baseline, domain and data layer boundaries.
  - **4.2 Application Shell:** Product renamed to **Aether**; persistent desktop sidebar (`w-60`) strictly following `DESIGN.md §2.1` with Daily, Explore, Life Areas, Goals, Intelligence, and Settings/Profile; 10 workspace routes configured with authentic planned capabilities from `FEATURES.md`.
  - **4.3 Component Foundation:** Shared accessible UI primitives in `src/components/ui/` (buttons with amber primary, form controls, dialogs with focus trapping, confirmation dialogs, dropdowns, alerts with distinct warning amber, badges, skeletons, empty states, page headers, dividers, tooltips); comprehensive verification showcase at `/verify`.
  - **4.4 Deployment & Foundation Push:**
    - `vercel.json` configured with Vite framework and client-side SPA rewrites (`/(.*)` -> `/index.html`) to ensure direct URL navigation and browser refresh work across all workspace routes.
    - Verified live preview deployment created on Vercel: `https://express-maple-bzaoyci.tmp.now` (claim code available: `5a4d3c29-8cb2-4170-be46-5b79df011435`).
    - Direct navigation and asset serving verified with HTTP 200 on `/`, `/today`, `/calendar`, `/verify`, plus JS/CSS bundles.
    - Real browser verification executed via Microsoft Edge on desktop.
    - Full quality checks verified: `typecheck` (0 errors), `lint` (0 errors, 0 warnings), `build` (2087 modules transformed, 3.37s).
    - Verified entire application foundation staged and committed cleanly to GitHub `origin/main`.
- No feature dashboards, databases, or business logic implemented yet.



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
2. **Exact database schema:** Complete PostgreSQL table schemas, foreign keys, and indexes are deferred to Checkpoint 2.5 / database design.
3. **Calendar library selection:** Final choice of calendar component/timeline library deferred to the calendar feature implementation.
4. **Life Map graph/layout implementation:** Specific layout algorithm (dagre, elk, manual) behind `@xyflow/react` abstraction deferred to Life Map implementation.
5. **AI provider and model selection:** Vendor/model (Gemini, Claude, OpenAI) deferred to AI integration checkpoint; kept configurable behind server boundary.
6. **Supabase Edge Functions vs. Vercel Serverless Functions:** Allocation of specific server-side operations between Supabase and Vercel functions evaluated per operation.
7. **Exact routing implementation:** TanStack Router vs. alternative router to be confirmed during scaffolding.
8. **Node/CI version strategy:** Target Node 22 LTS vs. Node 24 Current aligned across local and Vercel environments.
9. **Performance and bundle optimization:** Dynamic imports and code-splitting for large visual modules (@xyflow/react, chart libraries) monitored as app scales.

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
 
**Checkpoint 4.5 — Today Workspace (Initial Feature Implementation)**

With the application shell navigable and shared component foundation established, proceed to:
- Implement the Today workspace as the first real feature workspace.
- Consume the shared UI primitives from `src/components/ui/` (buttons, forms, dialogs, badges, empty states).
- Establish initial Task and Schedule data models in `src/domain/`.
- Establish Supabase connection and data access layer setup in `src/data/`.
- Configure TanStack Query for data fetching/caching; Zustand for transient draft state.
- No other workspaces should be implemented ahead of Today.
- **Remember:** No Supabase migrations or schema changes until the Today workspace data model is defined.

