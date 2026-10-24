import { supabase, isSupabaseConfigured } from './supabaseClient'

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled'

export type TaskPriorityCategory = 'must_happen' | 'should_happen' | 'could_happen'

export type TaskSourceType = 'manual' | 'routine' | 'academic' | 'quick_log'

export interface Task {
  id: string
  userId: string
  lifeAreaId: string
  goalId: string | null
  milestoneId: string | null
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriorityCategory
  persistedPriority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate: string | null // 'YYYY-MM-DD'
  scheduledDate: string | null // 'YYYY-MM-DD'
  estimatedDurationMinutes: number | null
  completedAt: string | null
  sourceType: TaskSourceType
  sourceId: string | null
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface CreateTaskInput {
  lifeAreaId: string
  title: string
  description?: string | null
  goalId?: string | null
  milestoneId?: string | null
  priority?: TaskPriorityCategory
  dueDate?: string | null
  scheduledDate?: string | null
  estimatedDurationMinutes?: number | null
  status?: TaskStatus
  sourceType?: TaskSourceType
}

export interface UpdateTaskInput {
  id: string
  lifeAreaId?: string
  title?: string
  description?: string | null
  goalId?: string | null
  milestoneId?: string | null
  priority?: TaskPriorityCategory
  dueDate?: string | null
  scheduledDate?: string | null
  estimatedDurationMinutes?: number | null
  status?: TaskStatus
  completedAt?: string | null
}

interface TaskRow {
  id: string
  user_id: string
  life_area_id: string
  goal_id: string | null
  milestone_id: string | null
  title: string
  description: string | null
  status: TaskStatus
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string | null
  scheduled_date: string | null
  estimated_duration_minutes: number | null
  completed_at: string | null
  source_type: TaskSourceType
  source_id: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export function toPersistedPriority(p: TaskPriorityCategory): 'low' | 'medium' | 'high' {
  switch (p) {
    case 'must_happen':
      return 'high'
    case 'should_happen':
      return 'medium'
    case 'could_happen':
      return 'low'
    default:
      return 'medium'
  }
}

export function fromPersistedPriority(p: string): TaskPriorityCategory {
  switch (p) {
    case 'urgent':
    case 'high':
      return 'must_happen'
    case 'medium':
      return 'should_happen'
    case 'low':
      return 'could_happen'
    default:
      return 'should_happen'
  }
}

function normalizeDateOnly(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null
  return dateStr.includes('T') ? dateStr.split('T')[0] : dateStr
}

function mapTaskRow(row: TaskRow): Task {
  return {
    id: row.id,
    userId: row.user_id,
    lifeAreaId: row.life_area_id,
    goalId: row.goal_id,
    milestoneId: row.milestone_id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: fromPersistedPriority(row.priority),
    persistedPriority: row.priority,
    dueDate: normalizeDateOnly(row.due_date),
    scheduledDate: normalizeDateOnly(row.scheduled_date),
    estimatedDurationMinutes: row.estimated_duration_minutes,
    completedAt: row.completed_at,
    sourceType: row.source_type,
    sourceId: row.source_id,
    metadata: row.metadata || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/**
 * Fetch tasks for the current authenticated user with optional filtering.
 */
export async function fetchTasks(options?: {
  lifeAreaId?: string
  goalId?: string
  milestoneId?: string
  status?: TaskStatus | 'active' | 'all'
}): Promise<{ data: Task[]; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: [], error: new Error('Supabase credentials not configured.') }
  }

  let query = supabase.from('tasks').select('*')

  if (options?.lifeAreaId) {
    query = query.eq('life_area_id', options.lifeAreaId)
  }

  if (options?.goalId) {
    query = query.eq('goal_id', options.goalId)
  }

  if (options?.milestoneId) {
    query = query.eq('milestone_id', options.milestoneId)
  }

  if (options?.status) {
    if (options.status === 'active') {
      query = query.in('status', ['todo', 'in_progress'])
    } else if (options.status !== 'all') {
      query = query.eq('status', options.status)
    }
  }

  query = query
    .order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    return { data: [], error: new Error(error.message) }
  }

  const mapped = (data as TaskRow[]).map(mapTaskRow)
  return { data: mapped, error: null }
}

/**
 * Create a new Task record.
 */
export async function createTask(
  input: CreateTaskInput,
): Promise<{ data: Task | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase credentials not configured.') }
  }

  const trimmedTitle = input.title.trim()
  if (!trimmedTitle || trimmedTitle.length < 2) {
    return { data: null, error: new Error('Task title must be at least 2 characters.') }
  }

  if (trimmedTitle.length > 200) {
    return { data: null, error: new Error('Task title cannot exceed 200 characters.') }
  }

  if (!input.lifeAreaId) {
    return { data: null, error: new Error('A life area must be selected for the task.') }
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { data: null, error: new Error('Authenticated session required.') }
  }

  const priorityCategory = input.priority || 'should_happen'
  const persistedPriority = toPersistedPriority(priorityCategory)
  const status = input.status || 'todo'

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      life_area_id: input.lifeAreaId,
      goal_id: input.goalId || null,
      milestone_id: input.milestoneId || null,
      title: trimmedTitle,
      description: input.description?.trim() || null,
      status,
      priority: persistedPriority,
      due_date: input.dueDate || null,
      scheduled_date: input.scheduledDate || null,
      estimated_duration_minutes: input.estimatedDurationMinutes || null,
      completed_at: status === 'completed' ? new Date().toISOString() : null,
      source_type: input.sourceType || 'manual',
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: new Error(error.message) }
  }

  return { data: mapTaskRow(data as TaskRow), error: null }
}

/**
 * Update an existing Task.
 */
export async function updateTask(
  input: UpdateTaskInput,
): Promise<{ data: Task | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase credentials not configured.') }
  }

  const updates: Partial<TaskRow> = {}

  if (input.title !== undefined) {
    const trimmed = input.title.trim()
    if (!trimmed || trimmed.length < 2) {
      return { data: null, error: new Error('Task title must be at least 2 characters.') }
    }
    updates.title = trimmed
  }

  if (input.description !== undefined) {
    updates.description = input.description ? input.description.trim() : null
  }

  if (input.lifeAreaId !== undefined) {
    updates.life_area_id = input.lifeAreaId
  }

  if (input.goalId !== undefined) {
    updates.goal_id = input.goalId || null
  }

  if (input.milestoneId !== undefined) {
    updates.milestone_id = input.milestoneId || null
  }

  if (input.priority !== undefined) {
    updates.priority = toPersistedPriority(input.priority)
  }

  if (input.dueDate !== undefined) {
    updates.due_date = input.dueDate || null
  }

  if (input.scheduledDate !== undefined) {
    updates.scheduled_date = input.scheduledDate || null
  }

  if (input.estimatedDurationMinutes !== undefined) {
    updates.estimated_duration_minutes = input.estimatedDurationMinutes
  }

  if (input.status !== undefined) {
    updates.status = input.status
    if (input.status === 'completed') {
      updates.completed_at = input.completedAt || new Date().toISOString()
    } else {
      updates.completed_at = null
    }
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', input.id)
    .select()
    .single()

  if (error) {
    return { data: null, error: new Error(error.message) }
  }

  return { data: mapTaskRow(data as TaskRow), error: null }
}

/**
 * Toggle task between completed and todo.
 */
export async function toggleTask(
  id: string,
  currentStatus: TaskStatus,
): Promise<{ data: Task | null; error: Error | null }> {
  const newStatus: TaskStatus = currentStatus === 'completed' ? 'todo' : 'completed'
  return updateTask({
    id,
    status: newStatus,
    completedAt: newStatus === 'completed' ? new Date().toISOString() : null,
  })
}

/**
 * Permanently delete a task.
 */
export async function deleteTask(id: string): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { error: new Error('Supabase credentials not configured.') }
  }

  const { error } = await supabase.from('tasks').delete().eq('id', id)

  if (error) {
    return { error: new Error(error.message) }
  }

  return { error: null }
}
