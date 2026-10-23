/**
 * Aether — Domain Lifecycle Module
 *
 * Pure, side-effect-free functions that compute derived progress and enforce
 * lifecycle rules for the Life Area → Goal → Milestone → Task hierarchy.
 *
 * Design principles:
 *  - No fabrication: if there is no basis for a meaningful calculation, the
 *    function returns null rather than 0 or a misleading value.
 *  - Canonical decoupling: completing every task under a milestone does NOT
 *    automatically complete the milestone; completing all milestones does NOT
 *    automatically achieve a goal. These transitions are always explicit user
 *    actions. Calculations reflect current state — they do not mutate it.
 *  - Distinct dimensions: task-completion progress, milestone-completion
 *    progress, and goal achievement are tracked independently and never
 *    collapsed into a single universal score.
 *  - Division-by-zero safety: all ratio calculations guard against an empty
 *    denominator and return null instead of NaN or Infinity.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Shared domain types (minimal, local — components import from their contexts)
// ─────────────────────────────────────────────────────────────────────────────

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled'
export type MilestoneStatus = 'pending' | 'completed'
export type GoalStatus =
  | 'not_started'
  | 'in_progress'
  | 'achieved'
  | 'paused'
  | 'abandoned'

/** Minimal shape required for task lifecycle calculations. */
export interface LifecycleTask {
  id: string
  status: TaskStatus
  milestoneId: string | null
  goalId: string | null
}

/** Minimal shape required for milestone lifecycle calculations. */
export interface LifecycleMilestone {
  id: string
  status: MilestoneStatus
}

/** Minimal shape required for goal lifecycle calculations. */
export interface LifecycleGoal {
  id: string
  status: GoalStatus
  milestones: LifecycleMilestone[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Task lifecycle helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns true when a task status represents a terminal/completed state.
 * Cancelled tasks are terminal but NOT counted as completed progress.
 */
export function isTaskTerminal(status: TaskStatus): boolean {
  return status === 'completed' || status === 'cancelled'
}

/**
 * Returns true when a task contributes positively to completion-based progress.
 * Only 'completed' tasks count — 'cancelled' tasks do not.
 */
export function isTaskCompletionContributor(status: TaskStatus): boolean {
  return status === 'completed'
}

/**
 * Returns true when a task is eligible to appear in active work views.
 * 'todo' and 'in_progress' are both active. Completed and cancelled are not.
 */
export function isTaskActive(status: TaskStatus): boolean {
  return status === 'todo' || status === 'in_progress'
}

// ─────────────────────────────────────────────────────────────────────────────
// Milestone progress derived from tasks
// ─────────────────────────────────────────────────────────────────────────────

export interface TaskDerivedProgress {
  /** Total tasks associated with this parent (excludes cancelled). */
  eligibleCount: number
  /** Tasks with status === 'completed'. */
  completedCount: number
  /**
   * Percentage (0–100, integer) derived from task completion.
   * null when there are no eligible tasks — avoids misleading 0%.
   */
  percent: number | null
}

/**
 * Derives task-completion progress for a given milestone or goal.
 *
 * Pass all tasks belonging to the user and the milestoneId or goalId to scope
 * the calculation. Cancelled tasks are excluded from the denominator so they
 * do not dilute progress after being abandoned.
 *
 * @param tasks     All tasks visible to the caller (already scoped to user).
 * @param milestoneId  Filter tasks by this milestone. Pass null to scope by goal only.
 * @param goalId       Filter tasks by this goal (used when milestoneId is null).
 */
export function deriveTaskProgress(
  tasks: LifecycleTask[],
  milestoneId: string | null,
  goalId: string | null,
): TaskDerivedProgress {
  // Select tasks in scope
  const scoped = tasks.filter((t) => {
    if (milestoneId !== null) return t.milestoneId === milestoneId
    if (goalId !== null) return t.goalId === goalId && t.milestoneId === null
    return false
  })

  // Exclude cancelled — they should not count against progress
  const eligible = scoped.filter((t) => t.status !== 'cancelled')
  const completed = eligible.filter((t) => isTaskCompletionContributor(t.status))

  if (eligible.length === 0) {
    return { eligibleCount: 0, completedCount: 0, percent: null }
  }

  const percent = Math.round((completed.length / eligible.length) * 100)
  return { eligibleCount: eligible.length, completedCount: completed.length, percent }
}

/**
 * Derives task-completion progress across ALL tasks linked to a goal
 * (regardless of which milestone they belong to, if any).
 */
export function deriveGoalTaskProgress(
  tasks: LifecycleTask[],
  goalId: string,
): TaskDerivedProgress {
  const scoped = tasks.filter((t) => t.goalId === goalId)
  const eligible = scoped.filter((t) => t.status !== 'cancelled')
  const completed = eligible.filter((t) => isTaskCompletionContributor(t.status))

  if (eligible.length === 0) {
    return { eligibleCount: 0, completedCount: 0, percent: null }
  }

  const percent = Math.round((completed.length / eligible.length) * 100)
  return { eligibleCount: eligible.length, completedCount: completed.length, percent }
}

// ─────────────────────────────────────────────────────────────────────────────
// Milestone-completion progress (explicitly set by user)
// ─────────────────────────────────────────────────────────────────────────────

export interface MilestoneDerivedProgress {
  totalMilestones: number
  completedMilestones: number
  /**
   * Percentage (0–100, integer) of milestones explicitly marked completed.
   * null when the goal has no milestones — avoids fabricating progress.
   */
  percent: number | null
}

/**
 * Computes milestone-completion progress for a goal.
 * This is DISTINCT from task-derived progress.
 *
 * Returns null for `percent` when the goal has no milestones — the caller
 * should surface a "no milestones defined" message rather than "0% progress".
 */
export function deriveMilestoneProgress(milestones: LifecycleMilestone[]): MilestoneDerivedProgress {
  const total = milestones.length
  const completed = milestones.filter((m) => m.status === 'completed').length

  if (total === 0) {
    return { totalMilestones: 0, completedMilestones: 0, percent: null }
  }

  const percent = Math.round((completed / total) * 100)
  return { totalMilestones: total, completedMilestones: completed, percent }
}

// ─────────────────────────────────────────────────────────────────────────────
// Goal lifecycle helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns true when a goal is in a state that permits active work.
 * Achieved, abandoned, and paused goals are not "active" for progress purposes.
 */
export function isGoalActive(status: GoalStatus): boolean {
  return status === 'in_progress' || status === 'not_started'
}

/**
 * Returns a human-readable label for a goal status suitable for display.
 */
export function goalStatusLabel(status: GoalStatus): string {
  switch (status) {
    case 'not_started':
      return 'Not Started'
    case 'in_progress':
      return 'In Progress'
    case 'achieved':
      return 'Achieved'
    case 'paused':
      return 'Paused'
    case 'abandoned':
      return 'Abandoned'
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Reopening / Cancellation lifecycle rules (documentation of business rules)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Determines what status a task should transition to when "reopened"
 * (i.e. uncompleted or un-cancelled).
 *
 * A reopened task always returns to 'todo' — it must be re-prioritised
 * by the user. We do not infer 'in_progress' automatically.
 */
export function reopenedTaskStatus(): TaskStatus {
  return 'todo'
}

/**
 * Determines what status a milestone should transition to when "reopened"
 * (i.e. un-completed by the user).
 */
export function reopenedMilestoneStatus(): MilestoneStatus {
  return 'pending'
}

/**
 * Determines what goal status should be applied when a user explicitly
 * reopens an achieved goal.
 */
export function reopenedGoalStatus(): GoalStatus {
  return 'in_progress'
}
