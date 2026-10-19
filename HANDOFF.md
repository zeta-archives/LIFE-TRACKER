# Life Tracker — Project Handoff

## Project
Life Tracker — intelligent personal life-management system for ambitious college students.

## Current Phase
Phase 2 — Technology Stack and Technical Architecture

## Current Checkpoint
Checkpoint 2.4 — Approve and Record Technology Stack — COMPLETE

## Repository Status
- Repository: LFTR
- Git initialized and working.
- Checkpoint 2.4 git commit created locally.
- Phase 1 baseline established (documentation structure, Depth Spell governance).
- Checkpoint 1.3 complete: `.kiro/steering/depth-spell.md` established.
- Checkpoint 2.2 complete: approved application architecture formalized in `PROJECT.md`.
- Checkpoint 2.3 complete: full Technical Design Specification created in `docs/TECHNICAL_DESIGN.md`.
- Checkpoint 2.4 complete: approved technology stack and conventions recorded; Git security baseline established (.gitignore, .gitattributes); local checkpoint commit created.
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
2. `docs/TECHNICAL_DESIGN.md` — full approved Technical Design Specification
3. `docs/TDS.md` — Depth Spell governance protocol (untouched)
4. `.kiro/steering/depth-spell.md` — active Kiro steering file
5. `docs/PRODUCT BLUEPRINT.md` — complete master product specification
6. `docs/DESIGN CHOICEES.md` — complete visual design specification
7. `FEATURES.md` — feature inventory (to be populated during feature development)
8. `DESIGN.md` — design rules (to be populated during design system setup)

---

## Next Roadmap Checkpoint

**Phase 3 / Checkpoint 3.1 — Application Scaffolding**

- Initialize Vite + React 19 + TypeScript project.
- Establish `src/domain/` and `src/data/` directory boundaries.
- Configure Tailwind CSS, shadcn/ui, Radix UI.
- Wire Supabase client connection (without migrations).
- Verify dev server runs and baseline domain test passes.
- **Remember:** No feature implementation until scaffolding and tooling are verified.
