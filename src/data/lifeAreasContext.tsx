/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'
import {
  type LifeArea,
  type CreateLifeAreaInput,
  type UpdateLifeAreaInput,
  fetchLifeAreas,
  fetchArchivedLifeAreas,
  createLifeArea,
  updateLifeArea,
  archiveLifeArea,
  restoreLifeArea,
  deleteLifeArea,
  ensureDefaultLifeAreas,
} from './lifeAreas'
import { useAuth } from './authContext'

export interface LifeAreasContextValue {
  lifeAreas: LifeArea[] // Active (non-archived) life areas
  archivedAreas: LifeArea[] // Archived life areas
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  createArea: (
    input: CreateLifeAreaInput,
  ) => Promise<{ success: boolean; data?: LifeArea; error?: string }>
  updateArea: (
    input: UpdateLifeAreaInput,
  ) => Promise<{ success: boolean; data?: LifeArea; error?: string }>
  archiveArea: (
    id: string,
  ) => Promise<{ success: boolean; data?: LifeArea; error?: string }>
  restoreArea: (
    id: string,
  ) => Promise<{ success: boolean; data?: LifeArea; error?: string }>
  deleteArea: (id: string) => Promise<{ success: boolean; error?: string }>
}

const LifeAreasContext = React.createContext<
  LifeAreasContextValue | undefined
>(undefined)

export function LifeAreasProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [lifeAreas, setLifeAreas] = React.useState<LifeArea[]>([])
  const [archivedAreas, setArchivedAreas] = React.useState<LifeArea[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Reload life areas whenever the active user changes
  const loadAreas = React.useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLifeAreas([])
      setArchivedAreas([])
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    const [activeRes, archivedRes] = await Promise.all([
      fetchLifeAreas(),
      fetchArchivedLifeAreas(),
    ])

    if (activeRes.error) {
      setError(activeRes.error.message)
      setIsLoading(false)
      return
    }

    let activeData = activeRes.data
    const archivedData = archivedRes.data || []

    // If tenant has zero areas total, seed default life areas safely
    if (activeData.length === 0 && archivedData.length === 0) {
      await ensureDefaultLifeAreas(user.id)
      const refetched = await fetchLifeAreas()
      if (!refetched.error && refetched.data.length > 0) {
        activeData = refetched.data
      }
    }

    setLifeAreas(activeData)
    setArchivedAreas(archivedData)
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
        const updated = result.data
        if (updated.archivedAt) {
          // If update set archived_at, move to archived
          setLifeAreas((prev) => prev.filter((item) => item.id !== updated.id))
          setArchivedAreas((prev) => [
            updated,
            ...prev.filter((item) => item.id !== updated.id),
          ])
        } else {
          // Update in active list
          setLifeAreas((prev) =>
            prev
              .map((item) => (item.id === updated.id ? updated : item))
              .sort((a, b) => a.priorityWeight - b.priorityWeight),
          )
          setArchivedAreas((prev) =>
            prev.filter((item) => item.id !== updated.id),
          )
        }
      }
      return { success: true, data: result.data || undefined }
    },
    [],
  )

  const archiveArea = React.useCallback(
    async (id: string) => {
      setError(null)
      const result = await archiveLifeArea(id)
      if (result.error) {
        return { success: false, error: result.error.message }
      }
      if (result.data) {
        const archived = result.data
        setLifeAreas((prev) => prev.filter((item) => item.id !== id))
        setArchivedAreas((prev) => [
          archived,
          ...prev.filter((item) => item.id !== id),
        ])
      }
      return { success: true, data: result.data || undefined }
    },
    [],
  )

  const restoreArea = React.useCallback(
    async (id: string) => {
      setError(null)
      const result = await restoreLifeArea(id)
      if (result.error) {
        return { success: false, error: result.error.message }
      }
      if (result.data) {
        const restored = result.data
        setArchivedAreas((prev) => prev.filter((item) => item.id !== id))
        setLifeAreas((prev) =>
          [...prev.filter((item) => item.id !== id), restored].sort(
            (a, b) => a.priorityWeight - b.priorityWeight,
          ),
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
      setArchivedAreas((prev) => prev.filter((item) => item.id !== id))
      return { success: true }
    },
    [],
  )

  const value = React.useMemo<LifeAreasContextValue>(
    () => ({
      lifeAreas,
      archivedAreas,
      isLoading,
      error,
      refetch: loadAreas,
      createArea,
      updateArea,
      archiveArea,
      restoreArea,
      deleteArea,
    }),
    [
      lifeAreas,
      archivedAreas,
      isLoading,
      error,
      loadAreas,
      createArea,
      updateArea,
      archiveArea,
      restoreArea,
      deleteArea,
    ],
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
