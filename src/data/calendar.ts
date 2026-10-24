import { supabase, isSupabaseConfigured } from './supabaseClient'

export type CalendarEventType =
  | 'class_timetable'
  | 'study_block'
  | 'exam'
  | 'personal'
  | 'task_block'

export interface CalendarEvent {
  id: string
  userId: string
  lifeAreaId: string
  taskId: string | null
  title: string
  description: string | null
  startTime: string // ISO string
  endTime: string // ISO string
  isAllDay: boolean
  eventType: CalendarEventType
  location: string | null
  isRecurring: boolean
  recurrenceRule: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export interface CreateCalendarEventInput {
  lifeAreaId: string
  title: string
  description?: string | null
  startTime: string
  endTime: string
  isAllDay?: boolean
  eventType?: CalendarEventType
  location?: string | null
  taskId?: string | null
}

export interface UpdateCalendarEventInput {
  id: string
  lifeAreaId?: string
  title?: string
  description?: string | null
  startTime?: string
  endTime?: string
  isAllDay?: boolean
  eventType?: CalendarEventType
  location?: string | null
  taskId?: string | null
}

interface CalendarEventRow {
  id: string
  user_id: string
  life_area_id: string
  task_id: string | null
  title: string
  description: string | null
  start_time: string
  end_time: string
  is_all_day: boolean
  event_type: CalendarEventType
  location: string | null
  is_recurring: boolean
  recurrence_rule: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

function mapCalendarEventRow(row: CalendarEventRow): CalendarEvent {
  return {
    id: row.id,
    userId: row.user_id,
    lifeAreaId: row.life_area_id,
    taskId: row.task_id,
    title: row.title,
    description: row.description,
    startTime: row.start_time,
    endTime: row.end_time,
    isAllDay: row.is_all_day,
    eventType: row.event_type,
    location: row.location,
    isRecurring: row.is_recurring,
    recurrenceRule: row.recurrence_rule,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/**
 * Fetch calendar events for the authenticated user, optionally bounded by time.
 */
export async function fetchCalendarEvents(options?: {
  startDate?: string
  endDate?: string
  lifeAreaId?: string
}): Promise<{ data: CalendarEvent[]; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: [], error: new Error('Supabase credentials not configured.') }
  }

  let query = supabase.from('calendar_events').select('*')

  if (options?.lifeAreaId) {
    query = query.eq('life_area_id', options.lifeAreaId)
  }

  if (options?.startDate) {
    query = query.gte('end_time', options.startDate)
  }

  if (options?.endDate) {
    query = query.lte('start_time', options.endDate)
  }

  query = query.order('start_time', { ascending: true })

  const { data, error } = await query

  if (error) {
    return { data: [], error: new Error(error.message) }
  }

  const mapped = (data as CalendarEventRow[]).map(mapCalendarEventRow)
  return { data: mapped, error: null }
}

/**
 * Create a new calendar event.
 */
export async function createCalendarEvent(
  input: CreateCalendarEventInput,
): Promise<{ data: CalendarEvent | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase credentials not configured.') }
  }

  const trimmedTitle = input.title.trim()
  if (!trimmedTitle) {
    return { data: null, error: new Error('Event title cannot be empty.') }
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { data: null, error: new Error('Authenticated session required.') }
  }

  const { data, error } = await supabase
    .from('calendar_events')
    .insert({
      user_id: user.id,
      life_area_id: input.lifeAreaId,
      task_id: input.taskId || null,
      title: trimmedTitle,
      description: input.description?.trim() || null,
      start_time: input.startTime,
      end_time: input.endTime,
      is_all_day: input.isAllDay || false,
      event_type: input.eventType || 'personal',
      location: input.location?.trim() || null,
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: new Error(error.message) }
  }

  return { data: mapCalendarEventRow(data as CalendarEventRow), error: null }
}

/**
 * Delete a calendar event.
 */
export async function deleteCalendarEvent(id: string): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { error: new Error('Supabase credentials not configured.') }
  }

  const { error } = await supabase.from('calendar_events').delete().eq('id', id)
  if (error) {
    return { error: new Error(error.message) }
  }
  return { error: null }
}
