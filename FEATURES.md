# Life Tracker — Feature and Workspace Inventory

**Established:** Checkpoint 3.1 — Screen Map and User Journeys
**Status:** Specification only. No feature has been implemented.

---

## How to Read This Document

Each workspace entry documents:
- **Purpose** — what the workspace is for
- **Primary information** — what it displays
- **Primary actions** — what the user can do there
- **Connected records** — which canonical records it reads or writes
- **Navigation relationships** — where it links to/from
- **Does NOT contain** — explicit prohibitions against duplication

All workspaces consume the same canonical domain records from `src/domain/`.
No workspace maintains its own private task, progress, or streak system.

---

## 1. Application Shell

### 1.1 Persistent Desktop Sidebar Navigation

**Purpose:** Provide persistent, always-visible navigation across all workspaces on desktop.

**Navigation groups and items:**

```
Daily
  ├── Today
  └── Calendar

Explore
  └── Life Orbit

Life Areas
  └── [user's configured life areas — expandable list]

Goals
  ├── Goals & Milestones
  └── Streaks

Intelligence
  ├── Life Sync
  ├── Insights
  └── Life Map

──────────────
  Settings
  Profile
```

**Global surfaces always accessible from the shell:**
- Quick Log trigger (Log / Plan / Ask)
- Active Focus Session indicator (when a session is running)
- Notifications / alerts surface

**Does NOT contain:**
- Business logic
- Per-workspace data fetching
- Duplicate task or progress state

---

### 1.2 Quick Log — Universal Entry Surface

**Purpose:** Allow the user to record, plan, or ask from anywhere in the application
without navigating to a specific workspace first.

**Three modes:**

| Mode | What it does |
|---|---|
| **Log** | Record something that happened (attended a class, completed a workout, logged sleep, finished a task, completed a focus session) |
| **Plan** | Create a commitment or scheduled activity (add a task, schedule a session, create a routine, add a calendar event) |
| **Ask** | Open the AI assistant with the current context snapshot pre-loaded |

**Behavior:**
- Accessible via a persistent trigger in the shell (sidebar or top bar)
- Opens a compact overlay/sheet — does not navigate away
- Context-sensitive: suggested actions adapt to the user's current workspace
- On save, writes to the canonical record via the data-access layer and invalidates relevant TanStack Query keys
- Does NOT maintain its own data store — it is a write surface over the canonical model

**Does NOT contain:**
- Duplicate task lists
- Independent progress tracking
- A separate "log" data model — all records written here are canonical domain records

---

### 1.3 Active Focus Session Surface

**Purpose:** Provide ambient visibility and controls for a running focus session without
forcing the user to navigate away from their current workspace.

**When a session is active, the surface shows:**
- Task name being worked on
- Elapsed time (calculated from timestamps — not a decrementing counter)
- Pause / Resume / Complete / Cancel controls

**Placement:** OPEN DECISION — floating dock vs. persistent shell element vs. full-screen zen mode.

**Does NOT contain:**
- Timer logic (that lives in the domain layer)
- Task completion — completing a focus session does NOT automatically complete the linked task
  (see Section 6: Critical Domain Rule)

---

## 2. Workspaces

---

### 2.1 Today

**Purpose:** The user's daily operational view. Shows what matters today and provides
fast access to daily actions.

**Primary information:**
- Today's tasks (due today or scheduled today, from the canonical Task model)
- Today's scheduled activities and commitments
- Upcoming deadlines within a short horizon (configurable)
- Active streaks at risk today
- Attendance warnings surfaced from the domain layer
- Life Sync alerts relevant to today

**Primary actions:**
- Mark a task complete / incomplete
- Log an activity (opens Quick Log in Log mode)
- Start a focus session on a task
- Reschedule a task to another day
- Add a new task for today (opens Quick Log in Plan mode)

**Connected records:**
- `Task` (canonical — due_date, scheduled_date)
- `FocusSession` (active session state)
- `StreakRecord` (derived — at-risk streaks)
- `LifeSyncAlert` (derived — today-relevant conflicts)
- `AttendanceRecord` (derived — warnings)

**Navigation relationships:**
- Task → Goals & Milestones (task's parent goal)
- Life Sync alert → Life Sync workspace
- Attendance warning → relevant Life Area workspace

**Does NOT contain:**
- A private task data model separate from the canonical Task
- Progress calculations — reads derived values from `src/domain/`
- Calendar management (that is Calendar's responsibility)

---

### 2.2 Calendar

**Purpose:** Time-oriented view of the user's schedule — what is planned across days,
weeks, and potentially months.

**Primary information:**
- Scheduled tasks and activities plotted on a time grid
- Fixed commitments (classes, exams, appointments — Must priority)
- Focus sessions (planned and completed)
- Recurring routines
- Upcoming deadlines as timeline markers
- Life Sync conflicts visible in context

**Primary actions:**
- Create a scheduled activity or task (Plan mode)
- Reschedule an item by editing its scheduled time
- View a day, week, or month
- Navigate to the detail of any item

**Connected records:**
- `Task` (scheduled_date, due_date, duration_estimate)
- `RecurringRoutine`
- `FocusSession` (completed sessions shown in history)
- `LifeArea` (color/identity coding per area)

**Navigation relationships:**
- Any item → its source workspace (e.g., an academic task → Academics workspace)
- Conflict indicator → Life Sync workspace

**Does NOT contain:**
- A private event or commitment model — all items are canonical records
- Attendance tracking (that is the Academics workspace's responsibility)
- Goal management

---

### 2.3 Life Orbit

**Purpose:** The primary home-screen experience. A visual, interactive constellation of
the user's life areas organized around the Soul Orb. Provides high-level orientation
and fast navigation into individual life areas.

**Primary information:**
- All configured life areas as interactive nodes
- Contextual status indicators per node (e.g., at-risk attendance, overdue task, active streak)
- The Soul Orb as the central visual anchor
- A compact preview panel when a life area node is selected

**Compact preview panel (on node selection):**
- Key metrics for the selected area (e.g., for Academics: attendance %, upcoming deadline)
- Recent activity summary
- Quick action to open the full workspace

**Primary actions:**
- Select a life area node → see preview
- Open a life area → navigate to its full workspace
- Access the AI assistant (Ask mode)

**Rendering technology:** OPEN DECISION — exact implementation (SVG, canvas, CSS 3D, WebGL) evaluated at implementation time.

**Connected records:**
- `LifeArea` (all user-configured areas)
- `Goal` (active goal count per area)
- `Task` (overdue/due-today counts per area — derived)
- `AttendanceRecord` (risk indicators for Academics)
- `StreakRecord` (active streaks per area — derived)

**Navigation relationships:**
- Node selection → Life Area workspace
- Soul Orb / Ask button → AI assistant (Ask mode)
- Life Orbit is NOT Life Map — see Section 5

**Does NOT contain:**
- Detailed task lists
- Goal editing
- The relationship graph between goals/milestones (that is Life Map)

---

### 2.4 Life Areas

**Purpose:** Each configured life area has a dedicated workspace. These are not identical
dashboard clones — each adapts to the information and actions relevant to its domain.

**Default life areas:**
- Academics
- Health & Fitness
- Skills & Career
- Sleep & Recovery
- Relationships & Social
- Personal & Recreation

Users may create custom life areas with user-defined goals, activities, and measurements.

#### Per-Life-Area Workspace

**Purpose:** Deep workspace for one life area — goals, tasks, records, and domain-specific views.

**Primary information (common across areas):**
- Active goals and their derived progress
- Active milestones within those goals
- Tasks belonging to this area (from canonical Task model)
- Upcoming deadlines
- Recent activity and focus session history
- Streak status where applicable

**Primary information (area-specific extensions):**

| Area | Domain-specific information |
|---|---|
| Academics | Subject list, attendance % per subject, assignment deadlines, exam schedule, grade records |
| Health & Fitness | Workout history, training schedule, user-defined measurements, weekly volume |
| Skills & Career | Skill categories, practice session history, project milestones, portfolio items |
| Sleep & Recovery | Sleep log (times, duration), consistency trends, subjective quality ratings |
| Relationships & Social | Social commitments, important occasions, relationship-defined goals |
| Personal & Recreation | Hobby logs, reading list, personal projects, entertainment records |

**Primary actions (common):**
- Log an activity for this area (Quick Log — Log mode)
- Add a task or schedule something (Quick Log — Plan mode)
- Create or edit a goal
- View full goal or milestone detail
- Start a focus session on a task

**Connected records:**
- `LifeArea` (this area's record)
- `Goal` (goals belonging to this area)
- `Milestone` (milestones within goals)
- `Task` (tasks within milestones/goals)
- `FocusSession` (sessions linked to tasks in this area)
- Area-specific records: `AttendanceRecord`, `SleepRecord`, `WorkoutRecord`, etc.

**Navigation relationships:**
- Goal → Goals & Milestones workspace (full goal detail)
- Task → Today (if due today)
- Focus session → Active Focus Session surface
- Attendance warning → surfaced by domain layer, not duplicated

**Does NOT contain:**
- A private task model — all tasks are canonical Tasks
- Independent progress calculations — reads from `src/domain/`
- Duplicate attendance or streak counters

---

### 2.5 Goals & Milestones

**Purpose:** The primary workspace for managing the user's long-term intentions.
Provides a structured view across all life areas for goals and their breakdown.

**Primary information:**
- All active goals, grouped by life area
- Goal status (on track / at risk / paused / completed) — derived, not stored
- Milestone list per goal with completion status
- Task list per milestone
- Progress indicators (derived from canonical records)
- Deadline visibility

**Primary actions:**
- Create a new goal (linked to a life area)
- Add a milestone to a goal
- Add a task to a milestone
- Mark a milestone complete
- Mark a task complete / incomplete
- Pause or archive a goal
- Start a focus session on a task

**Connected records:**
- `Goal`
- `Milestone`
- `Task`
- `FocusSession` (session history per task)
- `LifeArea` (goal's parent area)

**Navigation relationships:**
- Task → Today (if due today or scheduled today)
- Life Area link → Life Area workspace
- Focus session → Active Focus Session surface

**Does NOT contain:**
- Attendance tracking
- Calendar scheduling (Calendar's responsibility)
- A private goal-progress counter — all derived from domain calculations

---

### 2.6 Streaks

**Purpose:** Surface the user's active and recent streaks across life areas and goals.
Encourage consistency without guilt-based mechanics.

**Primary information:**
- Active streaks per life area or goal (derived from activity records)
- Streak history and longest recorded streaks
- At-risk streaks (a qualifying activity is due today to continue the streak)
- Intentionally paused streaks (clearly distinguished from broken streaks)

**Primary actions:**
- Log a qualifying activity (Quick Log — Log mode)
- Pause a streak intentionally
- View streak history

**Critical rule:** Streaks are derived from activity records. There is no `current_streak`
mutable counter stored in the database. The domain function
`currentStreak(activityRecords, referenceDate)` calculates the current streak on demand.

**Connected records:**
- `Task` (completion records)
- `FocusSession` (session records contributing to streak-qualifying activity)
- `RecurringRoutine` (routine completion records)
- `LifeArea` / `Goal` (streak context)

**Does NOT contain:**
- A mutable streak counter — derived only
- Guilt-based messaging for missed days
- Automatic streak reset without user acknowledgement of intentional pauses

---

### 2.7 Life Sync

**Purpose:** The cross-domain intelligence workspace. Shows how the user's commitments
across life areas interact, conflict, and can be balanced. This is the product's primary
differentiating feature.

**Primary information:**
- Active conflicts and risks (e.g., assignment due tomorrow with insufficient planned study time)
- Trade-off previews (what happens if I attend this event vs. stay home to study)
- Weekly life review (planned vs. actual across areas)
- What-if scenarios the user has queried
- Upcoming risks across areas (attendance at risk, deadlines approaching, competing commitments)

**Primary actions:**
- Review and act on a Life Sync alert
- Run a what-if scenario (open the AI Ask mode with a specific trade-off context)
- Accept or reject a proposed schedule adjustment
- Navigate to the relevant workspace for any flagged item

**Domain rules:**
- All conflict detection is derived from canonical records via `src/domain/`
- Conflicts are never persisted as a separate table — computed on demand
- Recommendations are proposal-based; the user confirms all changes
- The engine must distinguish confirmed conflicts from possible risks

**Connected records:**
- All canonical records (cross-domain by design)
- `Task` (deadlines, priorities)
- `AttendanceRecord` (attendance risk)
- `ScheduledActivity` / `RecurringRoutine` (schedule conflicts)
- `FocusSession` (effort allocation)
- `Goal` (priority and trajectory)

**Navigation relationships:**
- Any flagged item → its source workspace
- What-if query → AI assistant (Ask mode with pre-loaded context)

**Does NOT contain:**
- A private conflict data model — derived from canonical records
- Unsupported warnings — only conflicts supported by actual data
- Silent schedule mutations — all changes require user confirmation

---

### 2.8 Insights

**Purpose:** Analytics and reflection workspace. Helps the user understand where their
time has gone, whether their behavior aligns with their stated priorities, and what
patterns emerge across life areas.

**Primary information:**
- Time allocation across life areas (from focus session and activity records)
- Planned vs. actual comparison (scheduled vs. completed tasks and sessions)
- Goal trajectory (on-track / at-risk / progressing slowly — derived)
- Attendance trends (Academics)
- Sleep trends (Sleep & Recovery)
- Weekly and monthly summaries

**Primary actions:**
- Filter by life area, goal, or time period
- Navigate to a specific goal or task from an insight
- Ask the AI to explain or explore an insight (Ask mode)

**Domain rules:**
- All visualizations are computed from canonical records
- Correlations are presented as observations, not established causes
- No universal productivity score is displayed
- Data gaps are represented honestly (insufficient data ≠ zero performance)

**Connected records:**
- All canonical records (cross-domain analytics)
- `FocusSession`, `Task`, `Goal`, `AttendanceRecord`, `SleepRecord`, etc.

**Does NOT contain:**
- A universal life score
- Fabricated statistics
- Independent data aggregation separate from the canonical model

---

### 2.9 Life Map

**Purpose:** An interactive visualization of the relationships among goals, milestones,
tasks, routines, and life areas. Helps the user understand how their activities and
ambitions are connected.

**Primary information:**
- Goals and milestones as nodes
- Relationships between connected entities (task → milestone → goal → life area)
- Cross-domain relationships (a skill practice task that contributes to both a Skills goal and an academic project)
- Relationship strength or activity recency (visual weight — PROVISIONAL)

**Primary actions:**
- Explore the graph interactively (pan, zoom, select node)
- Navigate to a node's detail workspace
- Filter by life area or time period

**Layout:** OPEN DECISION — deterministic automatic layout (dagre-style) behind a
`LifeMapLayout` abstraction, isolated so the algorithm can be swapped. See TDS Section 14.

**Provisional library:** `@xyflow/react` — confirmed at Life Map implementation.

**Life Map vs. Life Orbit distinction (LOCKED):**

| | Life Orbit | Life Map |
|---|---|---|
| **Question answered** | "What are my life areas and where do I go?" | "How are my goals and activities connected?" |
| **Visual metaphor** | Constellation of life areas around the Soul Orb | Graph of goals, milestones, tasks, and relationships |
| **Scope** | Top-level life area navigation | Detailed cross-entity relationship map |
| **Interaction** | Navigate into a life area | Explore and understand connections |

**Connected records:**
- `LifeArea`, `Goal`, `Milestone`, `Task`, `FocusSession`, `RecurringRoutine`
- Relationship metadata (cross-domain links)

**Does NOT contain:**
- Duplicate goal-management UI (Goals & Milestones workspace owns that)
- Navigation shell (that is Life Orbit's role)

---

### 2.10 Settings & Profile

**Purpose:** User configuration and account management.

**Primary information:**
- Account and authentication settings
- Life area configuration (add, edit, archive custom areas)
- Notification and reminder preferences
- Application theme preferences
- Data import / export (DEFERRED)

**Primary actions:**
- Edit profile
- Configure life areas
- Manage notification preferences
- Sign out

**Does NOT contain:**
- Any goal, task, or activity data
- Analytics or insights

---

## 3. Critical Product Journey

### Goal → Milestone → Task → Planned Activity → Focus Session → Saved Record → Derived Progress

This is the canonical user journey through the application. Every step is a distinct
operation. No step automatically implies completion of another step.

```
User creates a Goal (in a LifeArea)
    │
    ├─► User breaks the Goal into Milestones
    │         │
    │         └─► User breaks a Milestone into Tasks
    │                   │
    │                   └─► User schedules a Task (Planned Activity / Calendar entry)
    │                             │
    │                             └─► User starts a Focus Session on the Task
    │                                       │
    │                                       ├─► User completes the Focus Session
    │                                       │     → FocusSession record saved with timestamps
    │                                       │     → Elapsed time calculated from timestamps
    │                                       │     → Task is NOT automatically marked complete
    │                                       │
    │                                       └─► User separately marks the Task complete
    │                                             → Task completion record saved
    │                                             → Milestone progress recalculated (derived)
    │                                             → Goal progress recalculated (derived)
    │                                             → Streak recalculated (derived)
```

### Critical Domain Rule — Task and FocusSession Independence (LOCKED)

**A completed FocusSession does NOT automatically complete its linked Task.**

These are separate domain events with separate records:

| Event | Record | Effect |
|---|---|---|
| Focus session completed | `FocusSession` with `completed_at` timestamp | Time logged; effort recorded; streak-qualifying activity contributed |
| Task marked complete | `Task` with `completed_at` timestamp | Task done; milestone progress recalculated; goal progress recalculated |

**Valid user scenarios:**
- Complete a task without ever starting a focus session (quick completion)
- Run one or more focus sessions against a task and still leave the task incomplete
- Run multiple focus sessions over several days before marking the task complete
- Save a partial focus session (interrupted work) without completing the task
- Postpone a task after a focus session (work saved, decision deferred)
- Intentionally skip or pause a recurring routine (recorded as paused, not failed)

**Implementation rule:**
- The `FocusSession` completion mutation must NOT trigger a task-completion mutation
- The `Task` completion mutation is always an explicit user action
- Domain functions that calculate goal progress must treat "has focus session records" as
  an effort signal only, not as a completion signal

---

## 4. Universal Log / Plan / Ask Model

The Quick Log surface provides three universal interaction modes available from anywhere:

### Log
Records something that already happened.

Examples by context:
- Academics: mark a class attended, record a grade, log study time
- Skills: log a practice session, record a project milestone
- Health: log a completed workout, record a measurement
- Sleep: log sleep and wake times
- Relationships: record a social commitment fulfilled
- Custom: any user-defined activity log

### Plan
Creates a future commitment or scheduled item.

Examples:
- Create a task with a due date
- Schedule a focus session at a specific time
- Add a calendar event
- Create a recurring routine
- Schedule a workout

### Ask
Opens the AI assistant with the current workspace context pre-loaded.

Examples:
- "How am I doing on my machine learning goal this month?"
- "Can I fit a workout in tomorrow given my assignment deadline?"
- "Help me plan tomorrow around my classes."
- "Why does Life Sync think I have a conflict on Friday?"

The AI receives a structured domain context snapshot (built server-side).
It returns proposals. The user confirms before any data is written.
See TDS Section 8 for the full AI boundary specification.

---

## 5. Life Orbit vs Life Map — Distinction (LOCKED)

These are two distinct workspaces with different purposes. They must not be conflated
or merged during implementation.

**Life Orbit** is the homepage experience. It answers: *"What are my life areas?"*
It is a visual navigation surface — a constellation of the user's configured life areas,
organized around the Soul Orb, providing high-level orientation and fast entry into
any area.

**Life Map** is an intelligence workspace. It answers: *"How are my goals and activities
connected?"* It is a relationship graph — nodes represent goals, milestones, tasks, and
routines; edges represent the relationships between them.

They are complementary, not redundant:
- Life Orbit is for navigation and daily awareness
- Life Map is for understanding and exploring connections

---

## 6. Record Ownership and Canonical-Source Rules

### One Record, One Owner

| Record type | Owner workspace | All other workspaces... |
|---|---|---|
| `Task` | Goals & Milestones / Life Area (where it was created) | Read and display the same record |
| `Goal` | Goals & Milestones / Life Area | Read and display |
| `Milestone` | Goals & Milestones | Read and display |
| `FocusSession` | Active Focus Session surface | Read and display in Today, Insights, Life Area |
| `AttendanceRecord` | Academics workspace | Read by Today, Life Sync, Insights |
| `SleepRecord` | Sleep & Recovery workspace | Read by Insights, Life Sync |
| `StreakRecord` | Derived — no single owner | Calculated on demand by `src/domain/` |
| Conflict / alert | Derived — no owner | Calculated by Life Sync domain logic |

**No workspace duplicates a record owned by another workspace.**
All reads go through the canonical TanStack Query cache backed by `src/data/` repositories.

---

## 7. Open Decisions (Not Locked in Checkpoint 3.1)

The following decisions are explicitly preserved as open. They must not be prematurely
locked during implementation without a documented decision review.

| Decision | Current stance | Locked at |
|---|---|---|
| Focus Timer presentation | Floating dock vs. full-screen zen mode vs. persistent shell element | Focus feature implementation |
| Day-boundary rollover | Local midnight (provisional — TDS Section 10.3) | Revisit if product requires configurable rollover |
| Life Orbit rendering technology | SVG vs. canvas vs. CSS 3D vs. WebGL | Life Orbit implementation |
| Ctrl+K behavior | Command palette (global navigation) vs. AI assistant entry vs. both | UX design review before scaffolding |
| Exact visual dimensions and design tokens | Defined in design system checkpoint | Design system / Checkpoint 3.2+ |
