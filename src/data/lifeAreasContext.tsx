/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'
import {
  type LifeArea,
  type CreateLifeAreaInput,
  type UpdateLifeAreaInput,
  fetchLifeAreas,
  createLifeArea,
  updateLifeArea,
  deleteLifeArea,
} from './lifeAreas'
import { useAuth } from './authContext'

export interface LifeAreasContextValue {
  lifeAreas: LifeArea[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  createArea: (
    input: CreateLifeAreaInput,
  ) => Promise<{ success: boolean; data?: LifeArea; error?: string }>
  updateArea: (
    input: UpdateLifeAreaInput,
  ) => Promise<{ success: boolean; data?: LifeArea; error?: string }>
  deleteArea: (id: string) => Promise<{ success: boolean; error?: string }>
}

const LifeAreasContext = React.createContext<
  LifeAreasContextValue | undefined
>(undefined)

export function LifeAreasProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [lifeAreas, setLifeAreas] = React.useState<LifeArea[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Reload life areas whenever the active user changes
  const loadAreas = React.useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLifeAreas([])
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)
    const result = await fetchLifeAreas()
    if (result.error) {
      setError(result.error.message)
    } else {
      setLifeAreas(result.data)
    }
    setIsLoading(false)
  }, [isAuthenticated, user])

  React.useEffect(() => {
    loadAreas()
  }, [loadAreas])

  const createArea = React.useCallback(
    async (input: CreateLifeAreaInput) => {
      setError(null)
      const result = await createLifeArea(input)
      if (result.error) {
        return { success: false, error: result.error.message }
      }
      if (result.data) {
        setLifeAreas((prev) =>
          [...prev, result.data!].sort(
            (a, b) => a.priorityWeight - b.priorityWeight,
          ),
        )
      }
      return { success: true, data: result.data || undefined }
    },
    [],
  )

  const updateArea = React.useCallback(
    async (input: UpdateLifeAreaInput) => {
      setError(null)
      const result = await updateLifeArea(input)
      if (result.error) {
        return { success: false, error: result.error.message }
      }
      if (result.data) {
        setLifeAreas((prev) =>
          prev
            .map((item) => (item.id === result.data!.id ? result.data! : item))
            .sort((a, b) => a.priorityWeight - b.priorityWeight),
        )
      }
      return { success: true, data: result.data || undefined }
    },
    [],
  )

  const deleteArea = React.useCallback(
    async (id: string) => {
      setError(null)
      const result = await deleteLifeArea(id)
      if (result.error) {
        return { success: false, error: result.error.message }
      }
      setLifeAreas((prev) => prev.filter((item) => item.id !== id))
      return { success: true }
    },
    [],
  )

  const value = React.useMemo<LifeAreasContextValue>(
    () => ({
      lifeAreas,
      isLoading,
      error,
      refetch: loadAreas,
      createArea,
      updateArea,
      deleteArea,
    }),
    [lifeAreas, isLoading, error, loadAreas, createArea, updateArea, deleteArea],
  )

  return (
    <LifeAreasContext.Provider value={value}>
      {children}
    </LifeAreasContext.Provider>
  )
}

export function useLifeAreas(): LifeAreasContextValue {
  const context = React.useContext(LifeAreasContext)
  if (!context) {
    throw new Error('useLifeAreas must be used within a LifeAreasProvider')
  }
  return context
}
