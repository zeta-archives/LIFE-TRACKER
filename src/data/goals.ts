import { supabase, isSupabaseConfigured } from './supabaseClient'

export type GoalStatus =
  | 'not_started'
  | 'in_progress'
  | 'paused'
  | 'achieved'
  | 'abandoned'

export type GoalPriority = 'low' | 'medium' | 'high' | 'critical'
export type GoalMeasurementType = 'milestones' | 'numeric_metric' | 'habitual'

export interface Milestone {
  id: string
  userId: string
  goalId: string
  title: string
  description: string | null
  targetDate: string | null
  sortOrder: number
  status: 'pending' | 'completed'
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Goal {
  id: string
  userId: string
  lifeAreaId: string
  title: string
  description: string | null
  targetDate: string | null
  status: GoalStatus
  priority: GoalPriority
  measurementType: GoalMeasurementType
  targetValue: number | null
  unit: string | null
  completedAt: string | null
  archivedAt: string | null
  createdAt: string
  updatedAt: string
  milestones: Milestone[]
}

export interface CreateGoalInput {
  lifeAreaId: string
  title: string
  description?: string | null
  targetDate?: string | null
  priority?: GoalPriority
  measurementType?: GoalMeasurementType
  targetValue?: number | null
  unit?: string | null
  status?: GoalStatus
}

export interface UpdateGoalInput {
  id: string
  lifeAreaId?: string
  title?: string
  description?: string | null
  targetDate?: string | null
  status?: GoalStatus
  priority?: GoalPriority
  measurementType?: GoalMeasurementType
  targetValue?: number | null
  unit?: string | null
  completedAt?: string | null
  archivedAt?: string | null
}

export interface CreateMilestoneInput {
  goalId: string
  title: string
  description?: string | null
  targetDate?: string | null
  sortOrder?: number
}

export interface UpdateMilestoneInput {
  id: string
  title?: string
  description?: string | null
  targetDate?: string | null
  sortOrder?: number
  status?: 'pending' | 'completed'
  completedAt?: string | null
}

interface GoalRow {
  id: string
  user_id: string
  life_area_id: string
  title: string
  description: string | null
  target_date: string | null
  status: GoalStatus
  priority: GoalPriority
  measurement_type: GoalMeasurementType
  target_value: number | null
  unit: string | null
  completed_at: string | null
  archived_at: string | null
  created_at: string
  updated_at: string
}

interface MilestoneRow {
  id: string
  user_id: string
  goal_id: string
  title: string
  description: string | null
  target_date: string | null
  sort_order: number
  status: 'pending' | 'completed'
  completed_at: string | null
  created_at: string
  updated_at: string
}

function mapMilestoneRow(row: MilestoneRow): Milestone {
  return {
    id: row.id,
    userId: row.user_id,
    goalId: row.goal_id,
    title: row.title,
    description: row.description,
    targetDate: row.target_date,
    sortOrder: row.sort_order,
    status: row.status,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapGoalRow(row: GoalRow, milestones: Milestone[] = []): Goal {
  return {
    id: row.id,
    userId: row.user_id,
    lifeAreaId: row.life_area_id,
    title: row.title,
    description: row.description,
    targetDate: row.target_date,
    status: row.status,
    priority: row.priority,
    measurementType: row.measurement_type,
    targetValue: row.target_value ? Number(row.target_value) : null,
    unit: row.unit,
    completedAt: row.completed_at,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    milestones,
  }
}

// ── Goal Queries & Mutations ──────────────────────────────────────────────────

/**
 * Fetch all goals for the authenticated user with their associated milestones.
 */
export async function fetchGoals(options?: {
  lifeAreaId?: string
  status?: GoalStatus | 'all'
  includeArchived?: boolean
}): Promise<{ data: Goal[]; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: [], error: new Error('Supabase credentials not configured.') }
  }

  let query = supabase.from('goals').select('*')

  if (!options?.includeArchived) {
    query = query.is('archived_at', null)
  }

  if (options?.lifeAreaId) {
    query = query.eq('life_area_id', options.lifeAreaId)
  }

  if (options?.status && options.status !== 'all') {
    query = query.eq('status', options.status)
  }

  query = query
    .order('created_at', { ascending: false })

  const { data: goalRows, error: goalError } = await query

  if (goalError) {
    return { data: [], error: new Error(goalError.message) }
  }

  if (!goalRows || goalRows.length === 0) {
    return { data: [], error: null }
  }

  const goalIds = (goalRows as GoalRow[]).map((g) => g.id)

  // Fetch associated milestones ordered by sort_order
  const { data: milestoneRows, error: milestoneError } = await supabase
    .from('milestones')
    .select('*')
    .in('goal_id', goalIds)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (milestoneError) {
    return { data: [], error: new Error(milestoneError.message) }
  }

  const milestonesByGoal = new Map<string, Milestone[]>()
  for (const mRow of (milestoneRows as MilestoneRow[]) || []) {
    const m = mapMilestoneRow(mRow)
    if (!milestonesByGoal.has(m.goalId)) {
      milestonesByGoal.set(m.goalId, [])
    }
    milestonesByGoal.get(m.goalId)!.push(m)
  }

  const mappedGoals = (goalRows as GoalRow[]).map((row) =>
    mapGoalRow(row, milestonesByGoal.get(row.id) || []),
  )

  return { data: mappedGoals, error: null }
}

/**
 * Create a new Goal record.
 */
export async function createGoal(
  input: CreateGoalInput,
): Promise<{ data: Goal | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase credentials not configured.') }
  }

  const trimmedTitle = input.title.trim()
  if (!trimmedTitle || trimmedTitle.length < 2) {
    return { data: null, error: new Error('Goal title must be at least 2 characters.') }
  }

  if (trimmedTitle.length > 150) {
    return { data: null, error: new Error('Goal title cannot exceed 150 characters.') }
  }

  if (!input.lifeAreaId) {
    return { data: null, error: new Error('A life area must be selected for the goal.') }
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { data: null, error: new Error('Authenticated session required.') }
  }

  const status = input.status || 'in_progress'
  const priority = input.priority || 'medium'
  const measurementType = input.measurementType || 'milestones'

  const { data, error } = await supabase
    .from('goals')
    .insert({
      user_id: user.id,
      life_area_id: input.lifeAreaId,
      title: trimmedTitle,
      description: input.description?.trim() || null,
      target_date: input.targetDate || null,
      status,
      priority,
      measurement_type: measurementType,
      target_value: input.targetValue ?? null,
      unit: input.unit?.trim() || null,
      completed_at: status === 'achieved' ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: new Error(error.message) }
  }

  return { data: mapGoalRow(data as GoalRow, []), error: null }
}

/**
 * Update an existing Goal.
 */
export async function updateGoal(
  input: UpdateGoalInput,
): Promise<{ data: Goal | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase credentials not configured.') }
  }

  const updates: Partial<GoalRow> = {}

  if (input.title !== undefined) {
    const trimmed = input.title.trim()
    if (!trimmed || trimmed.length < 2) {
      return { data: null, error: new Error('Goal title must be at least 2 characters.') }
    }
    updates.title = trimmed
  }

  if (input.description !== undefined) {
    updates.description = input.description ? input.description.trim() : null
  }

  if (input.lifeAreaId !== undefined) {
    updates.life_area_id = input.lifeAreaId
  }

  if (input.targetDate !== undefined) {
    updates.target_date = input.targetDate || null
  }

  if (input.status !== undefined) {
    updates.status = input.status
    if (input.status === 'achieved') {
      updates.completed_at = input.completedAt || new Date().toISOString()
    } else {
      updates.completed_at = null
    }
  }

  if (input.priority !== undefined) {
    updates.priority = input.priority
  }

  if (input.measurementType !== undefined) {
    updates.measurement_type = input.measurementType
  }

  if (input.targetValue !== undefined) {
    updates.target_value = input.targetValue
  }

  if (input.unit !== undefined) {
    updates.unit = input.unit ? input.unit.trim() : null
  }

  if (input.archivedAt !== undefined) {
    updates.archived_at = input.archivedAt
  }

  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', input.id)
    .select()
    .single()

  if (error) {
    return { data: null, error: new Error(error.message) }
  }

  // Preserve existing milestones
  const { data: milestoneRows } = await supabase
    .from('milestones')
    .select('*')
    .eq('goal_id', input.id)
    .order('sort_order', { ascending: true })

  const milestones = ((milestoneRows as MilestoneRow[]) || []).map(mapMilestoneRow)

  return { data: mapGoalRow(data as GoalRow, milestones), error: null }
}

/**
 * Permanently delete a goal and its associated milestones.
 */
export async function deleteGoal(id: string): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { error: new Error('Supabase credentials not configured.') }
  }

  const { error } = await supabase.from('goals').delete().eq('id', id)

  if (error) {
    return { error: new Error(error.message) }
  }

  return { error: null }
}

// ── Milestone Queries & Mutations ─────────────────────────────────────────────

/**
 * Create a new milestone within a goal.
 */
export async function createMilestone(
  input: CreateMilestoneInput,
): Promise<{ data: Milestone | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase credentials not configured.') }
  }

  const trimmedTitle = input.title.trim()
  if (!trimmedTitle || trimmedTitle.length < 2) {
    return { data: null, error: new Error('Milestone title must be at least 2 characters.') }
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { data: null, error: new Error('Authenticated session required.') }
  }

  // Calculate sort_order if not provided
  let sortOrder = input.sortOrder ?? 0
  if (input.sortOrder === undefined) {
    const { data: existing } = await supabase
      .from('milestones')
      .select('sort_order')
      .eq('goal_id', input.goalId)
      .order('sort_order', { ascending: false })
      .limit(1)

    if (existing && existing.length > 0) {
      sortOrder = (existing[0].sort_order ?? 0) + 1
    }
  }

  const { data, error } = await supabase
    .from('milestones')
    .insert({
      user_id: user.id,
      goal_id: input.goalId,
      title: trimmedTitle,
      description: input.description?.trim() || null,
      target_date: input.targetDate || null,
      sort_order: sortOrder,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: new Error(error.message) }
  }

  return { data: mapMilestoneRow(data as MilestoneRow), error: null }
}

/**
 * Update a milestone.
 */
export async function updateMilestone(
  input: UpdateMilestoneInput,
): Promise<{ data: Milestone | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase credentials not configured.') }
  }

  const updates: Partial<MilestoneRow> = {}

  if (input.title !== undefined) {
    const trimmed = input.title.trim()
    if (!trimmed || trimmed.length < 2) {
      return { data: null, error: new Error('Milestone title must be at least 2 characters.') }
    }
    updates.title = trimmed
  }

  if (input.description !== undefined) {
    updates.description = input.description ? input.description.trim() : null
  }

  if (input.targetDate !== undefined) {
    updates.target_date = input.targetDate || null
  }

  if (input.sortOrder !== undefined) {
    updates.sort_order = input.sortOrder
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
    .from('milestones')
    .update(updates)
    .eq('id', input.id)
    .select()
    .single()

  if (error) {
    return { data: null, error: new Error(error.message) }
  }

  return { data: mapMilestoneRow(data as MilestoneRow), error: null }
}

/**
 * Toggle milestone between pending and completed.
 */
export async function toggleMilestone(
  id: string,
  currentStatus: 'pending' | 'completed',
): Promise<{ data: Milestone | null; error: Error | null }> {
  const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
  return updateMilestone({
    id,
    status: newStatus,
    completedAt: newStatus === 'completed' ? new Date().toISOString() : null,
  })
}

/**
 * Reorder milestones by an array of milestone IDs.
 */
export async function reorderMilestones(
  orderedIds: string[],
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured || orderedIds.length === 0) {
    return { error: null }
  }

  // Update sort_order for each milestone
  const updates = orderedIds.map((id, index) =>
    supabase
      .from('milestones')
      .update({ sort_order: index })
      .eq('id', id),
  )

  const results = await Promise.all(updates)
  const failed = results.find((r) => r.error)

  if (failed?.error) {
    return { error: new Error(failed.error.message) }
  }

  return { error: null }
}

/**
 * Delete a milestone.
 */
export async function deleteMilestone(id: string): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { error: new Error('Supabase credentials not configured.') }
  }

  const { error } = await supabase.from('milestones').delete().eq('id', id)

  if (error) {
    return { error: new Error(error.message) }
  }

  return { error: null }
}
