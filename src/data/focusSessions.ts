import { supabase, isSupabaseConfigured } from './supabaseClient'

export type FocusSessionStatus = 'active' | 'paused' | 'completed' | 'abandoned'

export interface FocusSession {
  id: string
  userId: string
  lifeAreaId: string
  taskId: string | null
  startedAt: string
  endedAt: string | null
  targetDurationSeconds: number
  activeDurationSeconds: number
  pausedDurationSeconds: number
  status: FocusSessionStatus
  distractionCount: number
  reflectionNote: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateCompletedFocusSessionInput {
  lifeAreaId: string
  taskId?: string | null
  durationMinutes: number
  reflectionNote?: string | null
  startedAt?: string
}

interface FocusSessionRow {
  id: string
  user_id: string
  life_area_id: string
  task_id: string | null
  started_at: string
  ended_at: string | null
  target_duration_seconds: number
  active_duration_seconds: number
  paused_duration_seconds: number
  status: FocusSessionStatus
  distraction_count: number
  reflection_note: string | null
  created_at: string
  updated_at: string
}

function mapFocusSessionRow(row: FocusSessionRow): FocusSession {
  return {
    id: row.id,
    userId: row.user_id,
    lifeAreaId: row.life_area_id,
    taskId: row.task_id,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    targetDurationSeconds: row.target_duration_seconds,
    activeDurationSeconds: row.active_duration_seconds,
    pausedDurationSeconds: row.paused_duration_seconds,
    status: row.status,
    distractionCount: row.distraction_count,
    reflectionNote: row.reflection_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/**
 * Fetch focus sessions for the user.
 */
export async function fetchFocusSessions(options?: {
  lifeAreaId?: string
  taskId?: string
}): Promise<{ data: FocusSession[]; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: [], error: new Error('Supabase credentials not configured.') }
  }

  let query = supabase.from('focus_sessions').select('*')
  if (options?.lifeAreaId) {
    query = query.eq('life_area_id', options.lifeAreaId)
  }
  if (options?.taskId) {
    query = query.eq('task_id', options.taskId)
  }
  query = query.order('started_at', { ascending: false })

  const { data, error } = await query
  if (error) {
    return { data: [], error: new Error(error.message) }
  }
  return { data: (data as FocusSessionRow[]).map(mapFocusSessionRow), error: null }
}

/**
 * Log a completed focus session directly.
 */
export async function logCompletedFocusSession(
  input: CreateCompletedFocusSessionInput,
): Promise<{ data: FocusSession | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase credentials not configured.') }
  }

  if (!input.lifeAreaId) {
    return { data: null, error: new Error('Please select a life domain.') }
  }
  if (!input.durationMinutes || input.durationMinutes <= 0) {
    return { data: null, error: new Error('Duration must be greater than 0 minutes.') }
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { data: null, error: new Error('Authenticated session required.') }
  }

  const durationSeconds = Math.round(input.durationMinutes * 60)
  const endedDate = new Date()
  const startedDate = input.startedAt
    ? new Date(input.startedAt)
    : new Date(endedDate.getTime() - durationSeconds * 1000)

  const { data, error } = await supabase
    .from('focus_sessions')
    .insert({
      user_id: user.id,
      life_area_id: input.lifeAreaId,
      task_id: input.taskId || null,
      started_at: startedDate.toISOString(),
      ended_at: endedDate.toISOString(),
      target_duration_seconds: durationSeconds,
      active_duration_seconds: durationSeconds,
      paused_duration_seconds: 0,
      status: 'completed',
      distraction_count: 0,
      reflection_note: input.reflectionNote?.trim() || null,
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: new Error(error.message) }
  }

  return { data: mapFocusSessionRow(data as FocusSessionRow), error: null }
}
