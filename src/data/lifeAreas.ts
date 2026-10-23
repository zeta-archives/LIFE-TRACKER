import { supabase, isSupabaseConfigured } from './supabaseClient'

/**
 * Domain model for Life Area.
 * Adheres to TDS and docs/CORE_DATA_MODEL.md.
 */
export interface LifeArea {
  id: string
  userId: string
  name: string
  slug: string
  accentColor: string
  iconName: string
  priorityWeight: number
  isSystemDefault: boolean
  archivedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateLifeAreaInput {
  name: string
  slug?: string
  accentColor?: string
  iconName?: string
  priorityWeight?: number
}

export interface UpdateLifeAreaInput {
  id: string
  name?: string
  slug?: string
  accentColor?: string
  iconName?: string
  priorityWeight?: number
  archivedAt?: string | null
}

interface LifeAreaRow {
  id: string
  user_id: string
  name: string
  slug: string
  accent_color: string
  icon_name: string
  priority_weight: number
  is_system_default: boolean
  archived_at: string | null
  created_at: string
  updated_at: string
}

function mapRowToLifeArea(row: LifeAreaRow): LifeArea {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    slug: row.slug,
    accentColor: row.accent_color,
    iconName: row.icon_name,
    priorityWeight: row.priority_weight,
    isSystemDefault: row.is_system_default,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Standard system default life areas per DESIGN.md §2.1 and core migration.
 */
export const DEFAULT_LIFE_AREAS = [
  { name: 'Academics', slug: 'academics', accentColor: '#4A90E2', iconName: 'GraduationCap', priorityWeight: 1 },
  { name: 'Health & Fitness', slug: 'health', accentColor: '#4EAC7A', iconName: 'Activity', priorityWeight: 2 },
  { name: 'Skills & Career', slug: 'skills', accentColor: '#9B51E0', iconName: 'Briefcase', priorityWeight: 3 },
  { name: 'Sleep & Recovery', slug: 'sleep', accentColor: '#5C6BC0', iconName: 'Moon', priorityWeight: 4 },
  { name: 'Relationships', slug: 'relationships', accentColor: '#E05675', iconName: 'Users', priorityWeight: 5 },
  { name: 'Personal', slug: 'personal', accentColor: '#26A69A', iconName: 'Smile', priorityWeight: 6 },
] as const

/**
 * Ensures system default life areas exist for the given user without duplicates.
 */
export async function ensureDefaultLifeAreas(userId: string): Promise<void> {
  if (!isSupabaseConfigured || !userId) return

  const { data, error } = await supabase
    .from('life_areas')
    .select('id')
    .limit(1)

  if (error || (data && data.length > 0)) {
    return
  }

  const rows = DEFAULT_LIFE_AREAS.map((def) => ({
    user_id: userId,
    name: def.name,
    slug: def.slug,
    accent_color: def.accentColor,
    icon_name: def.iconName,
    priority_weight: def.priorityWeight,
    is_system_default: true,
  }))

  await supabase.from('life_areas').insert(rows)
}

/**
 * Fetch all active (non-archived) life areas for the current authenticated user.
 */
export async function fetchLifeAreas(): Promise<{
  data: LifeArea[]
  error: Error | null
}> {
  if (!isSupabaseConfigured) {
    return {
      data: [],
      error: new Error('Supabase credentials not configured.'),
    }
  }

  const { data, error } = await supabase
    .from('life_areas')
    .select('*')
    .is('archived_at', null)
    .order('priority_weight', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    return { data: [], error: new Error(error.message) }
  }

  const mapped = (data as LifeAreaRow[]).map(mapRowToLifeArea)
  return { data: mapped, error: null }
}

/**
 * Fetch all archived life areas for the current authenticated user.
 */
export async function fetchArchivedLifeAreas(): Promise<{
  data: LifeArea[]
  error: Error | null
}> {
  if (!isSupabaseConfigured) {
    return {
      data: [],
      error: new Error('Supabase credentials not configured.'),
    }
  }

  const { data, error } = await supabase
    .from('life_areas')
    .select('*')
    .not('archived_at', 'is', null)
    .order('archived_at', { ascending: false })

  if (error) {
    return { data: [], error: new Error(error.message) }
  }

  const mapped = (data as LifeAreaRow[]).map(mapRowToLifeArea)
  return { data: mapped, error: null }
}

/**
 * Create a new life area record owned by the authenticated user.
 */
export async function createLifeArea(
  input: CreateLifeAreaInput,
): Promise<{ data: LifeArea | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return {
      data: null,
      error: new Error('Supabase credentials not configured.'),
    }
  }

  const trimmedName = input.name.trim()
  if (!trimmedName || trimmedName.length < 2) {
    return {
      data: null,
      error: new Error('Life area name must be at least 2 characters.'),
    }
  }

  if (trimmedName.length > 50) {
    return {
      data: null,
      error: new Error('Life area name cannot exceed 50 characters.'),
    }
  }

  const priority = input.priorityWeight ?? 5
  if (priority < 1 || priority > 10) {
    return {
      data: null,
      error: new Error('Priority weight must be between 1 and 10.'),
    }
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      data: null,
      error: new Error('Authenticated user required to create a life area.'),
    }
  }

  const slug = input.slug?.trim() || generateSlug(trimmedName)
  const accentColor = input.accentColor?.trim() || '#D97706'
  const iconName = input.iconName?.trim() || 'Layers'

  const { data, error } = await supabase
    .from('life_areas')
    .insert({
      user_id: user.id,
      name: trimmedName,
      slug,
      accent_color: accentColor,
      icon_name: iconName,
      priority_weight: priority,
      is_system_default: false,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return {
        data: null,
        error: new Error(
          `A life area with the identifier "${slug}" already exists.`,
        ),
      }
    }
    return { data: null, error: new Error(error.message) }
  }

  return { data: mapRowToLifeArea(data as LifeAreaRow), error: null }
}

/**
 * Update an existing life area.
 */
export async function updateLifeArea(
  input: UpdateLifeAreaInput,
): Promise<{ data: LifeArea | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return {
      data: null,
      error: new Error('Supabase credentials not configured.'),
    }
  }

  const updates: Partial<LifeAreaRow> = {}

  if (input.name !== undefined) {
    const trimmed = input.name.trim()
    if (!trimmed || trimmed.length < 2) {
      return {
        data: null,
        error: new Error('Life area name must be at least 2 characters.'),
      }
    }
    updates.name = trimmed
    if (!input.slug) {
      updates.slug = generateSlug(trimmed)
    }
  }

  if (input.slug !== undefined) {
    updates.slug = input.slug.trim()
  }

  if (input.accentColor !== undefined) {
    updates.accent_color = input.accentColor.trim()
  }

  if (input.iconName !== undefined) {
    updates.icon_name = input.iconName.trim()
  }

  if (input.priorityWeight !== undefined) {
    if (input.priorityWeight < 1 || input.priorityWeight > 10) {
      return {
        data: null,
        error: new Error('Priority weight must be between 1 and 10.'),
      }
    }
    updates.priority_weight = input.priorityWeight
  }

  if (input.archivedAt !== undefined) {
    updates.archived_at = input.archivedAt
  }

  const { data, error } = await supabase
    .from('life_areas')
    .update(updates)
    .eq('id', input.id)
    .select()
    .single()

  if (error) {
    return { data: null, error: new Error(error.message) }
  }

  return { data: mapRowToLifeArea(data as LifeAreaRow), error: null }
}

/**
 * Archive a life area (soft-deactivation; preserves all associated history, tasks, and goals).
 */
export async function archiveLifeArea(
  id: string,
): Promise<{ data: LifeArea | null; error: Error | null }> {
  return updateLifeArea({
    id,
    archivedAt: new Date().toISOString(),
  })
}

/**
 * Restore an archived life area back to active state.
 */
export async function restoreLifeArea(
  id: string,
): Promise<{ data: LifeArea | null; error: Error | null }> {
  return updateLifeArea({
    id,
    archivedAt: null,
  })
}

/**
 * Delete a non-system life area.
 */
export async function deleteLifeArea(
  id: string,
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { error: new Error('Supabase credentials not configured.') }
  }

  const { error } = await supabase
    .from('life_areas')
    .delete()
    .eq('id', id)
    .eq('is_system_default', false)

  if (error) {
    return { error: new Error(error.message) }
  }

  return { error: null }
}
