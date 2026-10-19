# Life Tracker — Design Rules

**Established:** Checkpoint 3.1 — Screen Map and User Journeys
**Updated:** Checkpoint 3.3 — Visual Design System
**Status:** Active — governs all UI/UX and visual implementation decisions

---

## How to Read This Document

This document records the approved interaction, navigation, and visual design principles
for Life Tracker. It is implementation-oriented: it tells a developer or AI agent what
to build and what to avoid.

Sections 1–5 and 7–10 cover interaction and navigation (established at Checkpoint 3.1).
Section 6 covers the full approved visual design system (established at Checkpoint 3.3).

For the full source visual design specification and inspiration references, see
`docs/DESIGN CHOICEES.md`. That document is the creative source; this document
is the implementation specification derived from it.

For the technical architecture that supports these rules, see `docs/TECHNICAL_DESIGN.md`.

For the workspace model (what each screen contains), see `FEATURES.md`.

---

## 1. Platform and Layout Principles

### 1.1 Target — LOCKED

Life Tracker is a **Windows-focused desktop web application** running in a desktop browser.

- Design for large-screen layouts with efficient keyboard and mouse interaction
- Prioritize information density appropriate for a desktop workspace
- The layout must remain usable across reasonable desktop browser-window resize
- Do NOT design separate mobile navigation systems or mobile-specific experiences
- Native Android and native Windows application development are out of scope

### 1.2 Application Shell Layout

The application uses a **persistent sidebar** as the primary navigation mechanism on desktop.

- The sidebar is always visible; it does not collapse or hide by default on desktop
- Navigation groups: Daily, Explore, Life Areas, Goals, Intelligence, then Settings/Profile at the bottom
- The sidebar communicates the user's current location with a clear active state
- The shell always shows the Quick Log trigger and the Active Focus Session indicator when a session is running
- No navigation state is stored in component-level state — active route comes from the URL

### 1.3 Information Hierarchy

Every screen must have a clear primary purpose and a hierarchy suited to that purpose.

- Important deadlines, required actions, conflicts, and meaningful recommendations must stand out
- Secondary information and decorative statistics must not compete with primary content
- Do not apply identical card-grid layouts to every screen — layout should serve the content
- Use open layouts, structured panels, dividers, and surface variation as appropriate
- Cards are appropriate when they establish a meaningful grouping or interactive boundary,
  not as the default container for every element

---

## 2. Navigation Architecture — LOCKED

### 2.1 Sidebar Navigation Groups

```
Daily
  ├── Today
  └── Calendar

Explore
  └── Life Orbit

Life Areas
  └── [configured life areas]

Goals
  ├── Goals & Milestones
  └── Streaks

Intelligence
  ├── Life Sync
  ├── Insights
  └── Life Map

─────────────
  Settings
  Profile
```

### 2.2 Navigation Rules

- Navigation state lives in the URL — workspace routes are bookmarkable and shareable
- Shareable filter/view state (active tab, selected item, active filter) lives in URL search params
- Navigating between workspaces does not lose unsaved form state — preserve drafts in Zustand
  until explicitly committed or discarded
- The sidebar active state reflects the current route — it is never manually managed in component state
- Deep links must work: a URL pointing to a specific goal or task must resolve directly to that record

### 2.3 Life Area Sub-Navigation

- Each configured life area has its own workspace reachable from the sidebar
- Life area workspaces share the same navigation shell but adapt their content to their domain
- The life area list in the sidebar may be collapsible if it grows long enough to crowd the sidebar

---

## 3. Interaction Principles

### 3.1 Quick Log — Universal Entry

The Quick Log surface (Log / Plan / Ask) is accessible from anywhere in the application.

- Opens as a compact overlay or sheet — does not navigate away from the current workspace
- Context-sensitive: suggested actions adapt to the user's current workspace
- Three modes: Log (record something past), Plan (commit to something future), Ask (AI with context)
- On save, the record is written to the canonical model and relevant query keys are invalidated
- If the user dismisses without saving, draft state is discarded (or preserved briefly in Zustand — PROVISIONAL)

### 3.2 Focus Session Surface

When a focus session is active, the session surface is always visible in the shell.

- Shows: task name, elapsed time (timestamp-derived, not a decrementing counter), Pause/Resume/Complete/Cancel
- Completing a focus session records the `FocusSession` — it does NOT automatically complete the Task
- Task completion is always an explicit, separate user action
- The session surface does not force the user to navigate away from their current workspace
- Placement (floating dock vs. shell element vs. full-screen zen mode) is an OPEN DECISION

### 3.3 Confirmation for Consequential Actions

The following actions require explicit user confirmation before being applied:

- Accepting a Life Sync schedule adjustment
- Bulk rescheduling tasks
- Deleting a goal, milestone, or task (with confirmation of impact on dependent records)
- Accepting an AI-proposed change to any record
- Pausing or archiving a goal

No consequential schedule or data change is applied silently.

### 3.4 Destructive Actions

- Destructive actions (delete, archive, irreversible state change) must require confirmation
- Where reversible (soft delete / archive), offer an undo mechanism or clear recovery path
- Never silently delete or mutate records as a side effect of another action

### 3.5 Empty and Loading States

Every screen that fetches data must have:
- A loading state (skeleton or spinner — consistent with the design system)
- An empty state that explains what will appear here and offers a relevant primary action
- An error state with a clear message and a retry or recovery option

Never render a blank screen as a valid state.

---

## 4. Data Display Rules

### 4.1 Derived Values

Progress percentages, streak counts, attendance rates, and conflict indicators are
calculated on demand from canonical records. They are never stored as mutable counters.

- Display "—" or "No data yet" rather than 0% when there are insufficient records to calculate
- Distinguish insufficient data from zero performance
- Do not present "0 focus sessions" and "0% progress" as identical states

### 4.2 AI and Life Sync Recommendations

- All recommendations are presented as proposals, not instructions
- The source of a recommendation must be traceable (e.g., "Based on your assignment deadline on Friday")
- Never display a recommendation that is not grounded in actual user records
- Clearly distinguish confirmed conflicts from possible risks
- The user accepts, modifies, or rejects every recommendation — nothing is applied automatically

### 4.3 No Universal Life Score

Do not display a single metric purporting to measure how successfully the user is living.
Progress indicators exist per life area and per goal — not as an aggregate score across all areas.

### 4.4 Streak Display

- Always distinguish: active streak / intentionally paused streak / broken streak
- Never present an intentional pause as failure
- At-risk streaks (a qualifying activity is due today) must surface in Today and Streaks workspaces
- Streak counts are derived — never read from a mutable `current_streak` column

---

## 5. Workspace Interaction Rules

### 5.1 Today

- Tasks shown here are read from the canonical Task model filtered by today's date
- Today does NOT maintain its own task list — it is a filtered view over canonical records
- Completing a task from Today updates the canonical record — it reflects everywhere

### 5.2 Calendar

- The calendar shows all scheduled canonical records — tasks, activities, routines, focus sessions
- It does not maintain a private event model
- Rescheduling a task from the calendar updates the canonical `Task` record's `scheduled_date`

### 5.3 Life Orbit

- Life Orbit is a navigation surface — it shows life area nodes and entry points
- It is NOT the relationship graph (that is Life Map)
- Node status indicators (at-risk attendance, overdue task, active streak) are derived from
  the domain layer — not independently calculated in the Life Orbit component

### 5.4 Life Map

- Life Map is a relationship exploration workspace — it visualizes connections between entities
- It does NOT manage goals or tasks (Goals & Milestones owns that)
- Selecting a node navigates to the detail workspace for that entity

### 5.5 Life Sync

- Life Sync displays derived conflict and risk information — nothing is stored as a conflict record
- Proposed adjustments are presented to the user; none are applied without confirmation
- Every alert must cite the actual records that produced it

### 5.6 Goals & Milestones

- This workspace owns goal and milestone creation and management
- Task completion here updates the canonical Task record — milestone and goal progress recalculate
- FocusSession completion does NOT automatically complete a task (see FEATURES.md Section 3)

---

## 6. Visual Design System

Established at Checkpoint 3.3. This section supersedes the stub that previously pointed
to `docs/DESIGN CHOICEES.md`. That file remains the creative source and inspiration
reference; this section is the implementation specification.

### 6.1 Visual Personality — LOCKED

Life Tracker must feel:

| Quality | What it means in practice |
|---|---|
| **Warm** | A welcoming personal environment — not corporate, not sterile |
| **Intelligent** | A system that helps users understand and navigate complexity |
| **Cinematic** | Visually atmospheric, carefully art-directed, sophisticated depth |
| **Subtly magical** | Distinctive details that create moments of wonder without being excessive |
| **Personal** | Feels like a reflection of the user's ambitions and way of life |

These qualities must coexist with clarity, accessibility, and practical usability.
A screen is not finished because it looks impressive in a screenshot.
The interface must work — it must be understandable and efficient under real interaction.

**Must NOT feel:**
- Corporate or sterile
- Childish or excessively playful
- Like a generic AI-generated interface
- Overloaded with decorative effects
- Visually impressive but confusing or slow

---

### 6.2 Color Architecture

#### Design Philosophy

The color palette must serve the product's warm, cinematic identity while remaining
accessible and avoiding the generic purple-to-blue gradients that characterize
AI-generated interfaces.

Color decisions have three tiers: primitive → semantic → component.
Do not apply primitive color values directly to components — always go through the
semantic layer (CSS variables).

#### Primitive Color Palette — RECOMMENDED STARTING POINT

These are the approved starting values. Exact hex values are confirmed through
visual validation during implementation — treat them as recommendations, not
immutable contracts.

**Neutral scale (warm-tinted, not cold grey):**

| Token name (concept) | Role |
|---|---|
| neutral-950 | Deepest background — near-black with warmth |
| neutral-900 | Primary app background |
| neutral-800 | Elevated surface (cards, panels) |
| neutral-700 | Borders, dividers |
| neutral-600 | Muted / placeholder text |
| neutral-400 | Secondary text |
| neutral-200 | Primary text on dark backgrounds |
| neutral-50 | Near-white — headings, high-emphasis text |

**Primary accent — Amber:**
A restrained amber/warm-gold accent for primary interactive elements, active states,
and meaningful highlights. Amber was chosen because it:
- Avoids the generic AI blue/purple default
- Pairs naturally with a warm dark background
- Reads as warm and personal rather than corporate

| Token name (concept) | Role |
|---|---|
| amber-400 | Primary accent — buttons, active nav, focus rings |
| amber-300 | Hover state for amber elements |
| amber-500 | Pressed/active state |
| amber-900/30 | Subtle amber tint for selected surfaces |

**Status colors — accessibility-conscious:**
Status colors must not rely on hue alone. Always pair with an icon or text label.

| Status | Recommended hue | Notes |
|---|---|---|
| Success / on-track | Green (muted, not neon) | Never rely on color alone; pair with check icon |
| Warning / at-risk | Amber (aligned with primary accent) | Must use icon + subtle tinted wash/badge; never style as a solid button to avoid confusing warnings with primary interactive actions |
| Danger / overdue | Rose/red (desaturated) | Pair with text confirmation |
| Info / neutral | Blue-grey | Avoid bright blue (too generic) |

#### Semantic Color Layer — LOCKED PRINCIPLE

All component styles must reference semantic tokens, not primitive values.

Semantic tokens to establish at implementation:

| Semantic token | Maps to | Notes |
|---|---|---|
| `--color-bg` | neutral-900 | Base application canvas |
| `--color-bg-elevated` | neutral-800 | Panels, drawers, dialog containers |
| `--color-bg-overlay` | neutral-800 with opacity | Elevated popovers, tooltips |
| `--color-border` | neutral-700 / `rgba(255, 255, 255, 0.08)` | Hairline dividers and container boundaries (alpha transparency preferred for natural blending) |
| `--color-border-subtle` | `rgba(255, 255, 255, 0.05)` | Table row and list item hairlines |
| `--color-text-primary` | neutral-50 | High contrast off-white for titles and primary labels |
| `--color-text-secondary` | neutral-400 | Cool grey for descriptions and body content |
| `--color-text-muted` | neutral-600 | Subdued slate for timestamps, shortcuts, and captions |
| `--color-accent` | amber-400 | Solid amber fill for primary interactive CTAs |
| `--color-accent-hover` | amber-300 | Interactive hover state |
| `--color-accent-subtle` | amber-900/30 | Subtle amber tint for selected states and active pill backgrounds |
| `--color-status-success` | green (muted) | Forest emerald for verified completions |
| `--color-status-warning` | amber-500 | Tuscan amber for deadline warnings and at-risk alerts |
| `--color-status-danger` | rose (desaturated) | Cinnabar crimson for critical conflicts and overdue items |

Exact token file organization (CSS variables vs. Tailwind config vs. both) is
**DEFERRED** to the scaffolding checkpoint when the Tailwind configuration is established.

#### Life Area Accent Colors — RECOMMENDED STARTING POINT

Each life area has a contextual accent color that distinguishes it visually
within the unified design language. These are starting recommendations — validate
through visual implementation.

| Life Area | Accent hue direction | Character |
|---|---|---|
| Academics | Blue (cool, focused) | Precise and structured |
| Health & Fitness | Green (energetic) | Active and purposeful |
| Skills & Career | Purple/violet (exploratory) | Progressive and forward-looking |
| Sleep & Recovery | Indigo/deep blue (calm) | Restful and atmospheric |
| Relationships & Social | Rose/warm pink (personal) | Warm and human |
| Personal & Recreation | Teal/cyan (expressive) | Open and exploratory |
| Custom areas | User-defined or assigned from palette | Flexible |

Life area accents must:
- Share the same dark neutral backgrounds — only the accent color changes
- Never override the primary amber accent for interactive elements
- Never be the only means of identifying an area (pair with label and icon)
- Remain accessible against the dark backgrounds

#### Open Color Decisions

- Whether to add subtle ambient grain/noise texture over flat gradients, or keep surfaces flat — **OPEN DECISION**
- Whether a daylight/high-contrast mode is needed — **OPEN DECISION**

---

### 6.3 Typography — LOCKED

The typeface pairing is locked. Detailed sizing is confirmed through visual validation.

#### Typeface Pairing

**Instrument Serif + Plus Jakarta Sans**

#### Instrument Serif — Expressive / Display Use

Use Instrument Serif for carefully selected expressive moments:

- Prominent page headings (Today's greeting, Life Orbit section title, goal names)
- Important goal and milestone titles when displayed prominently
- Selected reflective or editorial messages
- Large dashboard-level headings where warmth and personality matter

**Do NOT use Instrument Serif for:**
- Navigation items
- Buttons or form controls
- Data tables, task lists, attendance figures
- Body copy or supporting text
- Any dense functional UI

#### Plus Jakarta Sans — Functional Interface Use

Use Plus Jakarta Sans as the primary functional typeface for everything else:

- Navigation and menu items
- Buttons, form controls, and inputs
- Task rows and list items
- Academic records, tables, and data grids
- Calendar information
- Supporting and secondary text
- Interface labels and status indicators
- All numerical data

Readability is especially important in dense academic views, data tables, and dashboards.

#### Typography Scale — RECOMMENDED STARTING POINT

These are starting values to validate through visual implementation.
Do not treat them as immutable until confirmed in context.

| Role | Family | Size guidance | Weight guidance |
|---|---|---|---|
| Display / hero heading | Instrument Serif | 36–48px | Regular (400) |
| Section heading | Instrument Serif | 24–32px | Regular (400) |
| Card / panel heading | Plus Jakarta Sans | 16–20px | Semibold (600) |
| Body / primary text | Plus Jakarta Sans | 14–16px | Regular (400) |
| Supporting / secondary | Plus Jakarta Sans | 12–14px | Regular (400) |
| Label / caption | Plus Jakarta Sans | 11–12px | Medium (500) |
| Navigation items | Plus Jakarta Sans | 13–14px | Medium (500) |
| Button text | Plus Jakarta Sans | 13–14px | Medium (500) |
| Numerical / data display | Plus Jakarta Sans | 12–16px (tabular) | Semibold (600) / Regular |

#### Typography Rules

- Establish a consistent typographic hierarchy through Tailwind utility classes or CSS variables
- Use Instrument Serif selectively — it should create moments, not be the default heading style
- Do not introduce additional typefaces from shadcn/ui or component libraries
- Always enable tabular figures (`font-variant-numeric: tabular-nums` / Tailwind `tabular-nums`) for focus timers, clock countdowns, attendance percentages, dates, and numerical tables to prevent layout shift during updates
- Evaluate both typefaces at intended sizes in actual browser rendering before finalizing

---

### 6.4 Spacing and Layout — LOCKED PRINCIPLES

#### Spacing Scale

Use a coherent spacing scale based on a 4px base unit. Recommended scale to explore:

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`

These are recommendations derived from standard 4px-grid practice.
Exact scale is confirmed at Tailwind configuration time.

#### Layout Principles

- **Desktop-first:** Layout decisions prioritize large-screen browser windows
- **Comfortable density:** Information-dense but not cramped — give content room to breathe
  without wasting space on empty padding
- **Consistent rhythm:** Vertical spacing between elements should feel consistent and deliberate
- **Sidebar width:** Approximate range to explore: 220–260px collapsed, content fills remaining space.
  Exact dimensions are **RECOMMENDATIONS**, confirmed through visual implementation.
- **Content max-width:** Consider capping the main content area at a readable maximum
  (e.g., 1200–1400px) on very wide displays — exact value confirmed at implementation

#### Density Guidance by Workspace

| Workspace | Density guidance |
|---|---|
| Today | Moderate — task list should be scannable without scrolling for a typical day |
| Calendar | Dense — timeline/grid layout, space is the organizing principle |
| Goals & Milestones | Moderate — goal hierarchy needs visual breathing room |
| Academics | Dense — tables and attendance data benefit from compact rows |
| Life Orbit | Open — the constellation needs space to feel atmospheric |
| Life Map | Open — graph/node layout needs spatial freedom |
| Life Sync | Moderate — conflict cards need emphasis and separation |
| Insights | Moderate to dense — charts need adequate size to be readable |

---

### 6.5 Shape and Surface Language — LOCKED PRINCIPLES

#### Anti-Card Principle

Do not place every element inside a rounded card.

A card is appropriate when it:
- Establishes a meaningful interactive boundary
- Groups clearly related information that belongs together
- Provides a surface that the user can act on as a unit

A card is NOT appropriate as:
- The default wrapper for every piece of information
- A way to fill whitespace
- A substitute for considered layout and hierarchy

**Concrete alternative for lists and feeds:**
- Render items (daily tasks, calendar timeline entries, streak checklists, timetable rows) as open linear rows directly on the canvas or panel plane, separated by subtle hairlines (`rgba(255, 255, 255, 0.05)`).
- On hover, rows apply a quiet background wash (`rgba(255, 255, 255, 0.03)`) and reveal contextual actions.
- Avoid boxing each individual task or event item into a separate rounded card.

#### Surface Hierarchy

Use a deliberate combination of:

| Surface type | When to use |
|---|---|
| Open layout (no container) | Prose content, editorial moments, primary workspace headings |
| Structural panel | Persistent sidebar, secondary content pane, filter panels |
| Divider / separator | Grouping without enclosure |
| Subtle elevation (card) | Interactive units, grouped records, overlays |
| High elevation (overlay/modal) | Dialogs, sheets, Quick Log surface |

#### Border and Elevation

- Use borders and dividers as organizational tools, not decoration
- Elevation (shadow) communicates layering — reserve for interactive surfaces and overlays
- Do not apply drop shadows to every card; most content lives on a flat surface plane
- Shadows should be dark and warm (not blue-tinted CSS defaults)

#### Radius Hierarchy — RECOMMENDED STARTING POINT

| Element type | Recommended radius | Notes |
|---|---|---|
| Compact controls (chips, badges, micro buttons) | 6–8px | Tags, keyboard shortcut chips |
| Standard components (buttons, inputs, cards) | 10–12px | Maintains geometric harmony between inputs and buttons |
| Large panels and modals | 16–20px | Structured panels, dialog containers, quick log sheet |
| Fully circular elements (avatar, Soul Orb, icon buttons, pill tags) | 9999px (full round) | Circular indicators, status pills, avatar containers |

These are starting values, not mandates. Confirmed through visual implementation.

---

### 6.6 Component Visual Language — LOCKED PRINCIPLES

Components must express the Life Tracker visual identity.
Do not use shadcn/ui defaults without applying the design system.

#### Buttons

| Variant | Use | Visual treatment |
|---|---|---|
| Primary | Main CTA per surface | Solid amber fill, dark text (`#0B0C0E`), standard 10–12px radius matching form controls |
| Secondary | Supporting actions | Neutral border (`rgba(255, 255, 255, 0.12)`), transparent fill, 10–12px radius |
| Ghost | Low-emphasis actions | No border, subtle hover wash (`rgba(255, 255, 255, 0.05)`), 10–12px radius |
| Destructive | Delete / irreversible | Muted rose/red wash, requires confirmation |

All buttons must have: hover, active, disabled, and keyboard focus states.
Focus rings: 2px amber ring with 2px offset applied strictly via `:focus-visible` (keyboard navigation only), preventing distracting outlines on mouse clicks.

#### Inputs and Form Controls

- Background: slightly elevated neutral (neutral-800)
- Border: neutral-700 / `rgba(255, 255, 255, 0.08)`, transitions to amber on focus
- Focus ring: 2px amber ring with 2px offset via `:focus-visible`
- Error state: rose border + error message below
- Placeholder text: neutral-600 (muted, not competing with entered text)

#### Task Rows

Task rows are one of the most frequently rendered elements in the application.
They must be:
- Compact and scannable
- Clear about status (incomplete / in-progress / complete / overdue)
- Consistent across all workspaces (Today, Goals, Life Area workspaces)
- Never styled differently per workspace — they come from the shared component

Status is communicated with both color AND an icon or text indicator — never color alone.

#### Overlays, Sheets, and Modals

- Background: neutral-800 or higher elevation surface
- Backdrop: dark overlay with opacity (not blurred unless a specific atmospheric moment justifies it)
- Always include a clear dismiss target (close button or Escape key)
- Focus management: focus must move into the overlay on open, return on close
- Quick Log opens as a sheet or compact modal — not a full-page navigation

#### Feedback States

Every interactive surface must handle:

| State | Visual requirement |
|---|---|
| Loading | Skeleton or subtle spinner — consistent with design system, not per-component invention |
| Empty | Explain what appears here; offer a relevant primary action |
| Error | Clear message; retry or recovery option; never a blank screen |
| Success | Brief confirmation (toast or inline) — not a disruptive full-screen state |
| Disabled | Visually muted; cursor: not-allowed; never invisible |

---

### 6.7 Motion and Animation — LOCKED PRINCIPLES

#### Core Rule

Every animation must earn its place. Motion should communicate cause and effect,
not decorate the interface.

#### Permitted Uses

- Communicating a state change (task marked complete, session started, alert dismissed)
- Providing interaction feedback (button press, hover, drag)
- Revealing additional information (accordion expand, panel slide)
- Explaining relationships (node selection in Life Map, Life Orbit transition)
- Reinforcing the Soul Orb's ambient presence and response to interaction

#### Prohibited Uses

- Animating ordinary buttons, table rows, and form controls for visual interest
- Adding entrance animations to every element on page load
- Motion that delays access to information or interaction
- Motion that cannot be turned off when `prefers-reduced-motion` is set

#### Timing — RECOMMENDED STARTING POINT

| Interaction type | Recommended duration |
|---|---|
| Micro-interactions (hover, press) | 100–150ms |
| Small state changes (checkbox, toggle) | 150–200ms |
| Panel / sheet open/close | 200–280ms |
| Page / workspace transition | 250–350ms |
| Soul Orb ambient cycle | Slow — 3–8 seconds per cycle |
| Life Orbit node selection | 300–500ms |

These are starting values. Confirm through visual testing. Do not treat them as
immutable until they have been validated in the browser.

#### Easing

- Use ease-out for elements entering the screen (fast start, slow finish)
- Use ease-in for elements leaving the screen (slow start, fast finish)
- Use ease-in-out for internal state transitions
- Avoid linear easing for visible UI motion — it reads as mechanical

#### Reduced Motion

When `prefers-reduced-motion: reduce` is active:
- Disable or minimize all transitions and animations
- Replace animated reveals with instant state changes
- The Soul Orb and Life Orbit should still function but without animation
- No information or feature may be inaccessible when motion is disabled

---

### 6.8 Soul Orb — Visual Direction

#### Concept

The Soul Orb is Life Tracker's signature visual element. It represents the application's
intelligence and its role as the connecting layer between the user's life areas.
It must feel alive and distinctive without being cartoonish or excessive.

#### Recommended Visual Direction — Atmospheric Luminous Ember

**This is the recommended direction, not a locked implementation contract.**

The approved direction for exploration is an **Atmospheric Luminous Ember**:

- A luminous, softly glowing sphere with internal depth and warmth
- Rich amber/gold light at the core, transitioning to deeper, atmospheric tones at the edges
- Subtle internal movement — a slow, breathing quality that reads as alive
- Carefully controlled highlights that give the orb a sense of dimension and surface
- Restrained outer glow — present but not blooming across the entire screen
- A sense of contained energy, not an explosion of particles

**What it should feel like:** The warmth of an ember or a captured flame, refined into
an intelligent visual object. Not a cartoon eye. Not a generic glowing ball. Not a
particle system explosion. A presence.

#### Soul Orb Roles

The Soul Orb may serve three roles (not all need to be active simultaneously):

1. **Visual identity anchor** — present in Life Orbit, representing the intelligence layer
2. **Interaction point** — entry to AI assistant (Ask mode) when tapped/clicked
3. **Contextual feedback** — subtle state changes for meaningful application events
   (e.g., a new Life Sync insight available)

The orb must not indicate emotional states it cannot determine from actual data.
The orb must not dominate every screen — it lives primarily in Life Orbit.

#### Implementation — OPEN DECISION

The rendering approach is not locked:
- CSS + box-shadow + radial gradients (simplest, most performant)
- Canvas 2D (more control over animation)
- WebGL/Three.js fragment shader (richest depth, highest cost)

Confirm the implementation technology through visual prototyping.
Prioritize a result that achieves the Atmospheric Luminous Ember quality
over fidelity to any particular technology.

**Ambient grain texture** over the orb surface: **OPEN DECISION** — may enhance depth
or introduce undesired noise depending on implementation. Validate visually.

---

### 6.9 Life Orbit — Visual and Conceptual Language

#### Concept

Life Orbit is the application's primary home-screen experience.
It presents the user's configured life areas as interactive nodes arranged
around the Soul Orb — a visual constellation, not a linear list.

The objective is for the user to understand their life areas at a glance,
perceive their interconnection, and navigate to any area quickly.

#### Visual Language

- Life area nodes arranged spatially around the Soul Orb
- Subtle visual connections or spatial relationships between nodes
  (weight or proximity may reflect relationship strength — PROVISIONAL)
- Each node carries the life area's accent color and icon
- Contextual status indicators on nodes (overdue, at-risk, active streak)
  derived from the domain layer
- A sense of atmospheric depth — the composition should feel spatial,
  not like a flat icon grid
- The Soul Orb at the center provides the visual and interactive anchor

#### Interaction

- Selecting a node focuses it and reveals a compact preview panel
- The compact preview shows area-relevant key metrics and a primary CTA
  (open full workspace)
- The overall composition remains navigable even while a node is focused

#### Rendering Technology — OPEN DECISION

The implementation technology for Life Orbit is not locked:
- SVG with CSS animations
- HTML/CSS with transform-based positioning
- Canvas 2D
- WebGL

Evaluate at Life Orbit implementation time. The criterion is:
does the result feel atmospheric and spatially dimensional while remaining
performant and accessible?

Life Orbit is NOT Life Map. See Section 6.10.

---

### 6.10 Life Map — Visual and Conceptual Language

#### Concept

Life Map is an analytical workspace for understanding relationships.
It visualizes the connections among goals, milestones, tasks, routines,
and life areas as an interactive graph.

#### Visual Language

- Nodes: goals, milestones, tasks, life areas — visually differentiated by type and life area accent
- Edges: relationships and dependencies between entities
- Visual weight or line style may reflect relationship strength or activity recency (PROVISIONAL)
- The overall tone is analytical and structured — deliberate composition rather than organic scatter
- Background: the same dark neutral as the rest of the application
- Nodes should be readable at a comfortable zoom level without crowding

#### Distinction from Life Orbit — LOCKED

| | Life Orbit | Life Map |
|---|---|---|
| Question | "What are my life areas?" | "How are my goals and activities connected?" |
| Visual metaphor | Constellation of life areas | Relationship graph of goals/tasks/milestones |
| Scope | Top-level navigation | Detailed cross-entity relationships |
| Tone | Atmospheric / navigational | Analytical / exploratory |
| Interaction | Navigate into a life area | Explore and understand connections |

These two workspaces serve different purposes. They must not be merged or confused
during implementation.

#### Layout — PROVISIONAL

Deterministic automatic layout (dagre-style hierarchical layout) isolated behind
a `LifeMapLayout` abstraction. See `docs/TECHNICAL_DESIGN.md` Section 14.
Provisional library: `@xyflow/react`. Confirmed at Life Map implementation.

---

### 6.11 Life Area Visual Identity — LOCKED PRINCIPLES

#### Unified Baseline

All life area workspaces share:
- The same dark neutral background family
- The same typography pairing (Instrument Serif + Plus Jakarta Sans)
- The same spacing rules and component library
- The same navigation shell and interaction patterns
- The same status conventions and accessibility requirements

Life areas must feel like parts of one coherent application,
not separate mini-apps with incompatible visual systems.

#### Contextual Accents

Each life area applies its accent color to:
- Section headings and active states within its workspace
- Its node in Life Orbit
- Its records in cross-workspace views (Today, Calendar, Life Sync)
- Charts and visualizations specific to that area

Accents do NOT change:
- Button styles (primary amber remains primary everywhere)
- Form controls (consistent across all areas)
- Navigation (sidebar uses the global accent, not per-area colors)
- Status semantics (success/warning/danger colors are application-wide)

#### No Separate Mini-App Visual Systems

Do not design or implement separate color systems, typography scales,
or interaction patterns for individual life areas.
Variation lives in the accent color and area-specific content structure only.

---

### 6.12 Data Visualization — LOCKED PRINCIPLES

#### Purpose

Every visualization must help the user answer a meaningful question.
Visualizations exist for reflection and understanding, not to create
a productivity performance score.

#### Rules

- Select the chart type based on what the user needs to understand —
  not because it looks impressive
- Do not default to circular progress rings for every metric
- Use accurate data and clearly defined calculations — never invent statistics
- Apply color consistently across all charts — a life area's accent color
  should be consistent across all views that reference that area
- Never use color as the only means of distinguishing data series
- Provide readable labels, units, useful comparisons, and sufficient contrast
- Use filtering and progressive disclosure when complexity increases
- Present correlations as observations, never as established causes when
  the data cannot establish causation

#### Prohibited Visualization Patterns

- A universal "Life Score" or aggregate productivity score across all areas
- Circular progress rings on every metric regardless of appropriateness
- Charts that look impressive but answer no meaningful question
- Fabricated statistics or inferred data presented as measured data
- Guilt-driven visualizations (framing rest, pauses, or off-days as failure)
- Streak counts as the primary measure of goal success

#### Honest Data Display

- If there is insufficient data to calculate a metric, display "—" or "No data yet"
- Do not display 0% when the correct answer is "not enough data"
- Do not treat a gap in records as a failure — it may reflect a paused goal,
  a vacation, or an intentional change of priorities

---

### 6.13 Accessibility — LOCKED

These rules are non-negotiable. They apply to every component and every workspace.

#### Contrast

- Body text against background: minimum WCAG AA (4.5:1)
- Large text and UI components: minimum WCAG AA (3:1)
- The dark background palette requires careful validation — warm neutrals
  can have lower contrast than they appear visually
- Validate contrast programmatically during implementation, not by eye

#### Keyboard Navigation

- Every interactive element must be reachable and operable by keyboard alone
- Tab order must be logical and follow visual reading order
- Focus indicators must be clearly visible (amber focus ring on dark backgrounds)
- Modals, sheets, and overlays must trap focus while open and restore it on close
- The Quick Log surface must be keyboard-operable

#### Color Independence

- Never use color as the only means of communicating information
- Status (success/warning/danger) must always pair color with an icon AND text label
- Life area identification must always pair the accent color with a label or icon
- Chart data series must be distinguishable without color (pattern, label, shape)

#### Reduced Motion

- Respect `prefers-reduced-motion: reduce` for all animations and transitions
- The Soul Orb ambient animation must stop or minimize when reduced motion is active
- Life Orbit transitions must minimize when reduced motion is active
- No feature or information may be inaccessible when motion is disabled
- Test with reduced motion enabled as part of every animated feature implementation

#### Screen Reader Support

- All icon-only buttons must have accessible labels (`aria-label` or `sr-only` text)
- Images and decorative SVGs must use `aria-hidden="true"` where appropriate
- Form inputs must have associated labels (not just placeholder text)
- Dynamic content updates (toasts, alerts) must use `aria-live` regions

---

### 6.14 Anti-Patterns — LOCKED

These patterns are explicitly prohibited regardless of how easy they are
for AI tools to generate or how common they are in generic UI frameworks.

- **Repetitive card grids** as the default layout for every workspace
- **Identical dashboard layouts** across workspaces with different content purposes
- **Unnecessary purple-to-blue gradients** applied as a default dark theme
- **Excessive neon effects and glassmorphism** without deliberate purpose
- **Decorative glowing borders** on every component
- **Generic typography** without a considered hierarchy (no unstyled shadcn defaults)
- **Charts that look impressive but communicate little** — every chart must answer a question
- **Decorative statistics** without meaningful backing data
- **Components copied from libraries without adaptation** to the Life Tracker visual identity
- **Interfaces that look good in screenshots but fail under real interaction**
- **Color-only status communication** — always pair with icon and text
- **A universal life score** — never create an aggregate productivity metric

Every significant visual decision must have a reason. Challenge defaults.

---

## 7. Accessibility Rules

(See Section 6.13 for the full accessibility specification established at Checkpoint 3.2.)

Core rules summary for quick reference:
- All interactive elements must have keyboard focus states
- Never use color as the only means of communicating critical information
- Maintain accessible contrast ratios for all text and interactive elements
- Keyboard navigation must cover all common actions
- Focus management must be correct for modals, sheets, and overlay surfaces
- Respect `prefers-reduced-motion` for all animations
- Accessible labels on icon-only buttons and controls

---

## 8. Data Visualization Rules

(See Section 6.12 for the full data visualization specification established at Checkpoint 3.2.)

Core rules summary for quick reference:
- Every visualization must help the user answer a meaningful question
- Select visualization type according to purpose — not appearance
- Use accurate data; never invent statistics
- Apply color consistently; never rely on color alone
- No universal life score

---

## 9. Keyboard and Mouse Interaction

- Design for efficient mouse and keyboard use
- Provide clear hover, focus, selected, active, loading, and error states for interactive elements
- Common actions should be keyboard-accessible
- Ctrl+K behavior: OPEN DECISION (command palette vs. AI assistant vs. both)
- Resizable content areas where they provide usability value

---

## 10. Open Design Decisions

These are explicitly not locked. Do not prematurely implement one option without a
documented decision review.

| Decision | Options under consideration | Resolved at |
|---|---|---|
| Focus Timer presentation | Floating dock / full-screen zen mode / persistent shell element | Focus feature implementation |
| Life Orbit rendering technology | SVG / canvas / CSS 3D / WebGL | Life Orbit implementation |
| Soul Orb rendering technology | CSS + gradients / Canvas 2D / WebGL | Soul Orb implementation |
| Ambient grain / texture | Grain over gradients vs. flat surfaces | Visual prototyping |
| Ctrl+K behavior | Command palette / AI assistant entry / both | UX design review |
| Day-boundary rollover | Local midnight (provisional) / configurable | Revisit if product requires it |
| Daylight / high-contrast mode | Single dark theme vs. light/high-contrast alternative | Post-MVP or accessibility review |
| Calendar library | Multiple candidates | Calendar feature implementation |
| Exact token file organization | CSS variables vs. Tailwind config extension vs. both | Scaffolding checkpoint |
| Exact sidebar width | ~220–260px recommended range | Visual implementation validation |
| Exact animation timings | Starting values in Section 6.7 | Visual implementation validation |
| Exact radius values | Starting values in Section 6.5 | Visual implementation validation |
| Exact typography sizes | Starting values in Section 6.3 | Visual implementation validation |
