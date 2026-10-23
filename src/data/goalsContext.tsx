/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'
import {
  type Goal,
  type Milestone,
  type CreateGoalInput,
  type UpdateGoalInput,
  type CreateMilestoneInput,
  type UpdateMilestoneInput,
  fetchGoals,
  createGoal as apiCreateGoal,
  updateGoal as apiUpdateGoal,
  deleteGoal as apiDeleteGoal,
  createMilestone as apiCreateMilestone,
  updateMilestone as apiUpdateMilestone,
  toggleMilestone as apiToggleMilestone,
  reorderMilestones as apiReorderMilestones,
  deleteMilestone as apiDeleteMilestone,
} from './goals'
import { useAuth } from './authContext'

export interface GoalsContextValue {
  goals: Goal[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  createGoal: (
    input: CreateGoalInput,
  ) => Promise<{ success: boolean; data?: Goal; error?: string }>
  updateGoal: (
    input: UpdateGoalInput,
  ) => Promise<{ success: boolean; data?: Goal; error?: string }>
  deleteGoal: (id: string) => Promise<{ success: boolean; error?: string }>
  createMilestone: (
    input: CreateMilestoneInput,
  ) => Promise<{ success: boolean; data?: Milestone; error?: string }>
  updateMilestone: (
    input: UpdateMilestoneInput,
  ) => Promise<{ success: boolean; data?: Milestone; error?: string }>
  toggleMilestone: (
    goalId: string,
    milestoneId: string,
    currentStatus: 'pending' | 'completed',
  ) => Promise<{ success: boolean; error?: string }>
  reorderMilestones: (
    goalId: string,
    orderedIds: string[],
  ) => Promise<{ success: boolean; error?: string }>
  deleteMilestone: (
    goalId: string,
    milestoneId: string,
  ) => Promise<{ success: boolean; error?: string }>
}

const GoalsContext = React.createContext<GoalsContextValue | undefined>(undefined)

export function GoalsProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [goals, setGoals] = React.useState<Goal[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const loadGoals = React.useCallback(async () => {
    if (!isAuthenticated || !user) {
      setGoals([])
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)
    const result = await fetchGoals()
    if (result.error) {
      setError(result.error.message)
    } else {
      setGoals(result.data)
    }
    setIsLoading(false)
  }, [isAuthenticated, user])

  React.useEffect(() => {
    loadGoals()
  }, [loadGoals])

  const createGoal = React.useCallback(async (input: CreateGoalInput) => {
    setError(null)
    const result = await apiCreateGoal(input)
    if (result.error) {
      return { success: false, error: result.error.message }
    }
    if (result.data) {
      setGoals((prev) => [result.data!, ...prev])
    }
    return { success: true, data: result.data || undefined }
  }, [])

  const updateGoal = React.useCallback(async (input: UpdateGoalInput) => {
    setError(null)
    const result = await apiUpdateGoal(input)
    if (result.error) {
      return { success: false, error: result.error.message }
    }
    if (result.data) {
      const updated = result.data
      setGoals((prev) =>
        prev.map((g) => (g.id === updated.id ? { ...updated, milestones: g.milestones } : g)),
      )
    }
    return { success: true, data: result.data || undefined }
  }, [])

  const deleteGoal = React.useCallback(async (id: string) => {
    setError(null)
    const result = await apiDeleteGoal(id)
    if (result.error) {
      return { success: false, error: result.error.message }
    }
    setGoals((prev) => prev.filter((g) => g.id !== id))
    return { success: true }
  }, [])

  const createMilestone = React.useCallback(
    async (input: CreateMilestoneInput) => {
      setError(null)
      const result = await apiCreateMilestone(input)
      if (result.error) {
        return { success: false, error: result.error.message }
      }
      if (result.data) {
        const m = result.data
        setGoals((prev) =>
          prev.map((g) => {
            if (g.id === m.goalId) {
              const milestones = [...g.milestones, m].sort((a, b) => a.sortOrder - b.sortOrder)
              return { ...g, milestones }
            }
            return g
          }),
        )
      }
      return { success: true, data: result.data || undefined }
    },
    [],
  )

  const updateMilestone = React.useCallback(
    async (input: UpdateMilestoneInput) => {
      setError(null)
      const result = await apiUpdateMilestone(input)
      if (result.error) {
        return { success: false, error: result.error.message }
      }
      if (result.data) {
        const updated = result.data
        setGoals((prev) =>
          prev.map((g) => {
            if (g.id === updated.goalId) {
              const milestones = g.milestones
                .map((m) => (m.id === updated.id ? updated : m))
                .sort((a, b) => a.sortOrder - b.sortOrder)
              return { ...g, milestones }
            }
            return g
          }),
        )
      }
      return { success: true, data: result.data || undefined }
    },
    [],
  )

  const toggleMilestone = React.useCallback(
    async (
      goalId: string,
      milestoneId: string,
      currentStatus: 'pending' | 'completed',
    ) => {
      setError(null)
      // Optimistic update
      const newStatus: 'pending' | 'completed' =
        currentStatus === 'completed' ? 'pending' : 'completed'
      const newCompletedAt: string | null =
        newStatus === 'completed' ? new Date().toISOString() : null

      setGoals((prev) =>
        prev.map((g) => {
          if (g.id === goalId) {
            const milestones = g.milestones.map((m) =>
              m.id === milestoneId ? { ...m, status: newStatus, completedAt: newCompletedAt } : m,
            )
            return { ...g, milestones }
          }
          return g
        }),
      )

      const result = await apiToggleMilestone(milestoneId, currentStatus)
      if (result.error) {
        // Revert on error
        setGoals((prev) =>
          prev.map((g) => {
            if (g.id === goalId) {
              const milestones = g.milestones.map((m) =>
                m.id === milestoneId ? { ...m, status: currentStatus } : m,
              )
              return { ...g, milestones }
            }
            return g
          }),
        )
        return { success: false, error: result.error.message }
      }
      return { success: true }
    },
    [],
  )

  const reorderMilestones = React.useCallback(
    async (goalId: string, orderedIds: string[]) => {
      setError(null)
      // Optimistic reorder
      setGoals((prev) =>
        prev.map((g) => {
          if (g.id === goalId) {
            const map = new Map(g.milestones.map((m) => [m.id, m]))
            const reordered = orderedIds
              .map((id, index) => {
                const item = map.get(id)
                return item ? { ...item, sortOrder: index } : null
              })
              .filter(Boolean) as Milestone[]
            return { ...g, milestones: reordered }
          }
          return g
        }),
      )

      const result = await apiReorderMilestones(orderedIds)
      if (result.error) {
        // Reload on failure
        loadGoals()
        return { success: false, error: result.error.message }
      }
      return { success: true }
    },
    [loadGoals],
  )

  const deleteMilestone = React.useCallback(
    async (goalId: string, milestoneId: string) => {
      setError(null)
      const result = await apiDeleteMilestone(milestoneId)
      if (result.error) {
        return { success: false, error: result.error.message }
      }
      setGoals((prev) =>
        prev.map((g) => {
          if (g.id === goalId) {
            return {
              ...g,
              milestones: g.milestones.filter((m) => m.id !== milestoneId),
            }
          }
          return g
        }),
      )
      return { success: true }
    },
    [],
  )

  const value = React.useMemo<GoalsContextValue>(
    () => ({
      goals,
      isLoading,
      error,
      refetch: loadGoals,
      createGoal,
      updateGoal,
      deleteGoal,
      createMilestone,
      updateMilestone,
      toggleMilestone,
      reorderMilestones,
      deleteMilestone,
    }),
    [
      goals,
      isLoading,
      error,
      loadGoals,
      createGoal,
      updateGoal,
      deleteGoal,
      createMilestone,
      updateMilestone,
      toggleMilestone,
      reorderMilestones,
      deleteMilestone,
    ],
  )

  return <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>
}

export function useGoals(): GoalsContextValue {
  const context = React.useContext(GoalsContext)
  if (!context) {
    throw new Error('useGoals must be used within a GoalsProvider')
  }
  return context
}
