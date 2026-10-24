import { supabase, isSupabaseConfigured } from './supabaseClient'

export interface ProgressRecord {
  id: string
  userId: string
  lifeAreaId: string
  goalId: string | null
  recordedDate: string // 'YYYY-MM-DD'
  metricName: string
  numericValue: number
  unit: string | null
  notes: string | null
  createdAt: string
}

export interface CreateProgressRecordInput {
  lifeAreaId: string
  goalId?: string | null
  recordedDate?: string
  metricName: string
  numericValue: number
  unit?: string | null
  notes?: string | null
}

interface ProgressRecordRow {
  id: string
  user_id: string
  life_area_id: string
  goal_id: string | null
  recorded_date: string
  metric_name: string
  numeric_value: number
  unit: string | null
  notes: string | null
  created_at: string
}

function mapProgressRecordRow(row: ProgressRecordRow): ProgressRecord {
  return {
    id: row.id,
    userId: row.user_id,
    lifeAreaId: row.life_area_id,
    goalId: row.goal_id,
    recordedDate: row.recorded_date,
    metricName: row.metric_name,
    numericValue: Number(row.numeric_value),
    unit: row.unit,
    notes: row.notes,
    createdAt: row.created_at,
  }
}

/**
 * Fetch progress records for the user.
 */
export async function fetchProgressRecords(options?: {
  lifeAreaId?: string
  goalId?: string
}): Promise<{ data: ProgressRecord[]; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: [], error: new Error('Supabase credentials not configured.') }
  }

  let query = supabase.from('progress_records').select('*')
  if (options?.lifeAreaId) {
    query = query.eq('life_area_id', options.lifeAreaId)
  }
  if (options?.goalId) {
    query = query.eq('goal_id', options.goalId)
  }
  query = query.order('recorded_date', { ascending: false }).order('created_at', { ascending: false })

  const { data, error } = await query
  if (error) {
    return { data: [], error: new Error(error.message) }
  }
  return { data: (data as ProgressRecordRow[]).map(mapProgressRecordRow), error: null }
}

/**
 * Create a new progress record.
 */
export async function createProgressRecord(
  input: CreateProgressRecordInput,
): Promise<{ data: ProgressRecord | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase credentials not configured.') }
  }

  const trimmedMetric = input.metricName.trim()
  if (!trimmedMetric) {
    return { data: null, error: new Error('Metric name cannot be empty.') }
  }
  if (!input.lifeAreaId) {
    return { data: null, error: new Error('Please select a life domain.') }
  }
  if (isNaN(input.numericValue)) {
    return { data: null, error: new Error('Value must be a valid number.') }
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { data: null, error: new Error('Authenticated session required.') }
  }

  const recordedDate = input.recordedDate || new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('progress_records')
    .insert({
      user_id: user.id,
      life_area_id: input.lifeAreaId,
      goal_id: input.goalId || null,
      recorded_date: recordedDate,
      metric_name: trimmedMetric,
      numeric_value: input.numericValue,
      unit: input.unit?.trim() || null,
      notes: input.notes?.trim() || null,
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: new Error(error.message) }
  }

  return { data: mapProgressRecordRow(data as ProgressRecordRow), error: null }
}
