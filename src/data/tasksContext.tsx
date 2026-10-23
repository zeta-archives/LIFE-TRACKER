/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'
import {
  type Task,
  type TaskStatus,
  type CreateTaskInput,
  type UpdateTaskInput,
  fetchTasks,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  toggleTask as apiToggleTask,
  deleteTask as apiDeleteTask,
} from './tasks'
import { useAuth } from './authContext'

export interface TasksContextValue {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  createTask: (
    input: CreateTaskInput,
  ) => Promise<{ success: boolean; data?: Task; error?: string }>
  updateTask: (
    input: UpdateTaskInput,
  ) => Promise<{ success: boolean; data?: Task; error?: string }>
  toggleTask: (
    id: string,
    currentStatus: TaskStatus,
  ) => Promise<{ success: boolean; error?: string }>
  deleteTask: (id: string) => Promise<{ success: boolean; error?: string }>
}

const TasksContext = React.createContext<TasksContextValue | undefined>(undefined)

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [tasks, setTasks] = React.useState<Task[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const loadTasks = React.useCallback(async () => {
    if (!isAuthenticated || !user) {
      setTasks([])
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)
    const result = await fetchTasks()
    if (result.error) {
      setError(result.error.message)
    } else {
      setTasks(result.data)
    }
    setIsLoading(false)
  }, [isAuthenticated, user])

  React.useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const createTask = React.useCallback(async (input: CreateTaskInput) => {
    setError(null)
    const result = await apiCreateTask(input)
    if (result.error) {
      return { success: false, error: result.error.message }
    }
    if (result.data) {
      setTasks((prev) => [result.data!, ...prev])
    }
    return { success: true, data: result.data || undefined }
  }, [])

  const updateTask = React.useCallback(async (input: UpdateTaskInput) => {
    setError(null)
    const result = await apiUpdateTask(input)
    if (result.error) {
      return { success: false, error: result.error.message }
    }
    if (result.data) {
      const updated = result.data
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    }
    return { success: true, data: result.data || undefined }
  }, [])

  const toggleTask = React.useCallback(
    async (id: string, currentStatus: TaskStatus) => {
      setError(null)
      // Optimistic update
      const newStatus: TaskStatus = currentStatus === 'completed' ? 'todo' : 'completed'
      const newCompletedAt = newStatus === 'completed' ? new Date().toISOString() : null

      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status: newStatus, completedAt: newCompletedAt } : t,
        ),
      )

      const result = await apiToggleTask(id, currentStatus)
      if (result.error) {
        // Revert on error
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: currentStatus } : t)),
        )
        return { success: false, error: result.error.message }
      }
      return { success: true }
    },
    [],
  )

  const deleteTask = React.useCallback(async (id: string) => {
    setError(null)
    const result = await apiDeleteTask(id)
    if (result.error) {
      return { success: false, error: result.error.message }
    }
    setTasks((prev) => prev.filter((t) => t.id !== id))
    return { success: true }
  }, [])

  const value = React.useMemo<TasksContextValue>(
    () => ({
      tasks,
      isLoading,
      error,
      refetch: loadTasks,
      createTask,
      updateTask,
      toggleTask,
      deleteTask,
    }),
    [tasks, isLoading, error, loadTasks, createTask, updateTask, toggleTask, deleteTask],
  )

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}

export function useTasks(): TasksContextValue {
  const context = React.useContext(TasksContext)
  if (!context) {
    throw new Error('useTasks must be used within a TasksProvider')
  }
  return context
}
