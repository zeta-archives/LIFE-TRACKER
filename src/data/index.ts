/**
 * Data Access Layer — Boundary Contract (LOCKED)
 * 
 * Rules:
 * 1. All database queries, RPC calls, and external network interactions belong in this layer.
 * 2. UI components and hooks must NEVER import the Supabase client directly.
 * 3. Repository methods return mapped domain models, never raw database rows.
 * 4. Supabase errors are normalized into typed application errors before leaving this layer.
 */

export { supabase, isSupabaseConfigured } from './supabaseClient'
export * from './auth'
export * from './authContext'
export * from './lifeAreas'
export * from './lifeAreasContext'
export * from './goals'
export * from './goalsContext'
export * from './tasks'
export * from './tasksContext'

export const DATA_LAYER_STATUS = 'initialized' as const
