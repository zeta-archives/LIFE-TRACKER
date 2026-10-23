import { describe, it, expect } from 'vitest'
import {
  isTaskTerminal,
  isTaskCompletionContributor,
  isTaskActive,
  deriveTaskProgress,
  deriveGoalTaskProgress,
  deriveMilestoneProgress,
  isGoalActive,
  reopenedTaskStatus,
  reopenedMilestoneStatus,
  reopenedGoalStatus,
  type LifecycleTask,
} from './lifecycle'

// ─── Task lifecycle ──────────────────────────────────────────────────────────

describe('isTaskTerminal', () => {
  it('returns true for completed tasks', () => {
    expect(isTaskTerminal('completed')).toBe(true)
  })
  it('returns true for cancelled tasks', () => {
    expect(isTaskTerminal('cancelled')).toBe(true)
  })
  it('returns false for todo', () => {
    expect(isTaskTerminal('todo')).toBe(false)
  })
  it('returns false for in_progress', () => {
    expect(isTaskTerminal('in_progress')).toBe(false)
  })
})

describe('isTaskCompletionContributor', () => {
  it('returns true only for completed', () => {
    expect(isTaskCompletionContributor('completed')).toBe(true)
  })
  it('returns false for cancelled — cancelled tasks do not count as progress', () => {
    expect(isTaskCompletionContributor('cancelled')).toBe(false)
  })
  it('returns false for todo', () => {
    expect(isTaskCompletionContributor('todo')).toBe(false)
  })
  it('returns false for in_progress', () => {
    expect(isTaskCompletionContributor('in_progress')).toBe(false)
  })
})

describe('isTaskActive', () => {
  it('returns true for todo', () => {
    expect(isTaskActive('todo')).toBe(true)
  })
  it('returns true for in_progress', () => {
    expect(isTaskActive('in_progress')).toBe(true)
  })
  it('returns false for completed', () => {
    expect(isTaskActive('completed')).toBe(false)
  })
  it('returns false for cancelled', () => {
    expect(isTaskActive('cancelled')).toBe(false)
  })
})

// ─── deriveTaskProgress ──────────────────────────────────────────────────────

const milestoneA = 'ms-a'
const milestoneB = 'ms-b'
const goalX = 'goal-x'
const goalY = 'goal-y'

function makeTask(
  id: string,
  status: LifecycleTask['status'],
  milestoneId: string | null = null,
  goalId: string | null = goalX,
): LifecycleTask {
  return { id, status, milestoneId, goalId }
}

describe('deriveTaskProgress — milestone scope', () => {
  const tasks: LifecycleTask[] = [
    makeTask('t1', 'completed', milestoneA),
    makeTask('t2', 'completed', milestoneA),
    makeTask('t3', 'todo', milestoneA),
    makeTask('t4', 'cancelled', milestoneA), // excluded from denominator
    makeTask('t5', 'completed', milestoneB), // different milestone, excluded
  ]

  it('counts only tasks scoped to the given milestone', () => {
    const result = deriveTaskProgress(tasks, milestoneA, goalX)
    // eligible: t1, t2, t3 (t4 cancelled, t5 wrong milestone)
    expect(result.eligibleCount).toBe(3)
    expect(result.completedCount).toBe(2)
    expect(result.percent).toBe(67) // Math.round(2/3 * 100)
  })

  it('excludes cancelled tasks from the denominator', () => {
    const tasks2: LifecycleTask[] = [
      makeTask('t1', 'completed', milestoneA),
      makeTask('t2', 'cancelled', milestoneA),
    ]
    const result = deriveTaskProgress(tasks2, milestoneA, null)
    expect(result.eligibleCount).toBe(1)
    expect(result.completedCount).toBe(1)
    expect(result.percent).toBe(100)
  })

  it('returns null percent when there are no eligible tasks', () => {
    const result = deriveTaskProgress([], milestoneA, goalX)
    expect(result.percent).toBeNull()
    expect(result.eligibleCount).toBe(0)
  })

  it('returns null percent when all tasks are cancelled', () => {
    const tasks3: LifecycleTask[] = [makeTask('t1', 'cancelled', milestoneA)]
    const result = deriveTaskProgress(tasks3, milestoneA, null)
    expect(result.percent).toBeNull()
  })
})

describe('deriveGoalTaskProgress', () => {
  const tasks: LifecycleTask[] = [
    makeTask('t1', 'completed', milestoneA, goalX),
    makeTask('t2', 'todo', milestoneB, goalX),
    makeTask('t3', 'cancelled', null, goalX),
    makeTask('t4', 'completed', null, goalY), // different goal
  ]

  it('includes tasks from all milestones under the goal', () => {
    const result = deriveGoalTaskProgress(tasks, goalX)
    // Eligible under goalX: t1, t2 (t3 cancelled excluded)
    expect(result.eligibleCount).toBe(2)
    expect(result.completedCount).toBe(1)
    expect(result.percent).toBe(50)
  })

  it('does not count tasks from other goals', () => {
    const result = deriveGoalTaskProgress(tasks, goalY)
    expect(result.eligibleCount).toBe(1)
    expect(result.completedCount).toBe(1)
    expect(result.percent).toBe(100)
  })

  it('returns null percent when goal has no tasks at all', () => {
    const result = deriveGoalTaskProgress(tasks, 'goal-empty')
    expect(result.percent).toBeNull()
  })
})

// ─── deriveMilestoneProgress ──────────────────────────────────────────────────

describe('deriveMilestoneProgress', () => {
  it('returns null percent for a goal with no milestones', () => {
    const result = deriveMilestoneProgress([])
    expect(result.percent).toBeNull()
    expect(result.totalMilestones).toBe(0)
  })

  it('calculates correct percent for mixed statuses', () => {
    const result = deriveMilestoneProgress([
      { id: 'ms1', status: 'completed' },
      { id: 'ms2', status: 'pending' },
      { id: 'ms3', status: 'completed' },
      { id: 'ms4', status: 'pending' },
    ])
    expect(result.totalMilestones).toBe(4)
    expect(result.completedMilestones).toBe(2)
    expect(result.percent).toBe(50)
  })

  it('returns 100% when all milestones are completed', () => {
    const result = deriveMilestoneProgress([
      { id: 'ms1', status: 'completed' },
      { id: 'ms2', status: 'completed' },
    ])
    expect(result.percent).toBe(100)
  })

  it('returns 0% when no milestones are completed (but total > 0)', () => {
    const result = deriveMilestoneProgress([
      { id: 'ms1', status: 'pending' },
    ])
    expect(result.percent).toBe(0)
    expect(result.percent).not.toBeNull() // 0 is a valid number when milestones exist
  })
})

// ─── Goal lifecycle ───────────────────────────────────────────────────────────

describe('isGoalActive', () => {
  it('returns true for in_progress', () => {
    expect(isGoalActive('in_progress')).toBe(true)
  })
  it('returns true for not_started', () => {
    expect(isGoalActive('not_started')).toBe(true)
  })
  it('returns false for achieved', () => {
    expect(isGoalActive('achieved')).toBe(false)
  })
  it('returns false for paused', () => {
    expect(isGoalActive('paused')).toBe(false)
  })
  it('returns false for abandoned', () => {
    expect(isGoalActive('abandoned')).toBe(false)
  })
})

// ─── Reopening rules ──────────────────────────────────────────────────────────

describe('reopening lifecycle rules', () => {
  it('reopened task always returns to todo, not in_progress', () => {
    expect(reopenedTaskStatus()).toBe('todo')
  })

  it('reopened milestone always returns to pending', () => {
    expect(reopenedMilestoneStatus()).toBe('pending')
  })

  it('reopened goal always returns to in_progress', () => {
    expect(reopenedGoalStatus()).toBe('in_progress')
  })
})
