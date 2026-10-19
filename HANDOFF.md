# Life Tracker — Project Handoff

## Project
Life Tracker — intelligent personal life-management system for ambitious college students.

## Current Phase
Phase 3 — Screen Map, User Journeys, and Design System — COMPLETE

## Current Checkpoint
Checkpoint 3.4 — Impeccable Environment Verification & Design Critique — COMPLETE (Phase 3 Exit)

## Repository Status
- Repository: LFTR
- Git branch: `main` (tracked to `origin/main` on GitHub: `https://github.com/zeta-archives/LIFE-TRACKER.git`).
- Phase 1 baseline established (documentation structure, Depth Spell governance).
- Phase 2 complete: technology stack locked (React 19, Vite, TypeScript, Supabase, Vercel); Technical Design Specification formalized.
- Phase 3 complete:
  - Checkpoint 3.1: Screen map, workspace models, and user journeys formalized in `FEATURES.md` and `DESIGN.md`.
  - Checkpoint 3.2: Design system and visual language investigation completed.
  - Checkpoint 3.3: Visual design system formalized in `DESIGN.md` Section 6 (personality, color architecture, typography, spacing, shape/surface, components, motion, Soul Orb, Life Orbit, Life Map, accessibility, anti-patterns).
  - Checkpoint 3.4: Impeccable environment verification and design critique executed; `DESIGN.md` refined with tabular figures, hairline transparency, button radius harmony, and keyboard focus-visible rules.
- No application code has been written. No npm packages have been installed.
- No scaffolding has been created (`src/` does not exist).
- Application implementation has not yet begun.

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

- **Current Branch:** `master`
- **Git Security Baseline:** Verified. `.gitignore` actively protects `.env`, `.env.*`, `node_modules/`, `dist/`, `build/`, `coverage/`, and local caches, while allowing `!.env.example`. `.gitattributes` enforces `text=auto eol=lf`.
- **Secret Inspection:** Verified. No secrets, keys, or credentials are present or tracked.
- **Local Commit:** Checkpoint 2.4 commit created locally.
- **GitHub Remote:** No remote is currently configured (`git remote -v` returned empty). No GitHub CLI (`gh`) is installed in the environment.
- **Push Status:** No push was executed because no remote URL exists. The local repository is fully prepared and staged safely. Once a remote is added (`git remote add origin <url>`), it can be pushed immediately with `git push -u origin master`.

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
 
**Phase 4 / Checkpoint 4.1 — Application Scaffolding**
 
Initialize the application with the approved stack and established design system:
- Initialize Vite + React 19 + TypeScript project
- Configure Tailwind CSS with the approved design token structure (semantic CSS variables)
- Install and configure shadcn/ui + Radix UI with Life Tracker visual identity applied
- Load Instrument Serif + Plus Jakarta Sans via appropriate font loading strategy
- Establish `src/domain/` and `src/data/` directory structure and boundary enforcement
- Configure Supabase client connection (no schema yet)
- Configure `.gitignore` to protect secrets before first `npm install`
- Confirm TanStack Router or select routing approach
- Wire up Vitest for domain tests
- Verify development server runs and a baseline domain test passes
- **Remember:** No feature implementation until scaffolding and design system baseline are verified in the browser.
