/**
 * Domain & Intelligence Layer — Boundary Contract (LOCKED)
 * 
 * Rules:
 * 1. Pure TypeScript only.
 * 2. Zero imports from React, Supabase, browser DOM, or external framework libraries.
 * 3. All domain calculations accept explicit parameters (e.g. `referenceDate`) for deterministic testing.
 * 4. Contains canonical domain models, business invariants, and derived calculation logic.
 */

export interface DomainEntity {
  id: string
  createdAt: string
  updatedAt: string
}

export const DOMAIN_LAYER_STATUS = 'initialized' as const
