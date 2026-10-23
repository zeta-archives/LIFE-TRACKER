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
