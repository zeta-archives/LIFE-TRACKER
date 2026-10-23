import type { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from './supabaseClient'

/**
 * Normalized application user representation.
 * Prevents UI layers from coupling to Supabase-internal user object structures.
 */
export interface AuthUser {
  id: string
  email: string
  fullName?: string
  createdAt: string
  lastSignInAt?: string
}

export interface SignUpParams {
  email: string
  password: string
  fullName?: string
}

export interface SignUpResult {
  user: AuthUser | null
  session: Session | null
  requiresEmailConfirmation: boolean
  error: Error | null
}

export interface SignInParams {
  email: string
  password: string
}

export interface SignInResult {
  user: AuthUser | null
  session: Session | null
  error: Error | null
}

/**
 * Helper to map Supabase User to the normalized AuthUser domain representation.
 */
export function mapSupabaseUser(user: SupabaseUser | null): AuthUser | null {
  if (!user) return null
  return {
    id: user.id,
    email: user.email || '',
    fullName:
      (user.user_metadata?.full_name as string) ||
      (user.user_metadata?.name as string) ||
      undefined,
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at,
  }
}

/**
 * Sign up a new user with email and password.
 * Automatically attaches full_name to raw_user_meta_data for the handle_new_user trigger.
 */
export async function signUpWithPassword({
  email,
  password,
  fullName,
}: SignUpParams): Promise<SignUpResult> {
  if (!isSupabaseConfigured) {
    return {
      user: null,
      session: null,
      requiresEmailConfirmation: false,
      error: new Error(
        'Supabase is not configured. Please supply valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.',
      ),
    }
  }

  const trimmedEmail = email.trim().toLowerCase()
  const trimmedName = fullName?.trim()

  const { data, error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password,
    options: {
      data: {
        full_name: trimmedName || undefined,
      },
    },
  })

  if (error) {
    return {
      user: null,
      session: null,
      requiresEmailConfirmation: false,
      error,
    }
  }

  const user = mapSupabaseUser(data.user)
  // In Supabase, if email confirmation is turned on, session is null upon signup.
  const requiresEmailConfirmation = Boolean(data.user && !data.session)

  return {
    user,
    session: data.session,
    requiresEmailConfirmation,
    error: null,
  }
}

/**
 * Sign in an existing user with email and password.
 */
export async function signInWithPassword({
  email,
  password,
}: SignInParams): Promise<SignInResult> {
  if (!isSupabaseConfigured) {
    return {
      user: null,
      session: null,
      error: new Error(
        'Supabase is not configured. Please supply valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.',
      ),
    }
  }

  const trimmedEmail = email.trim().toLowerCase()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: trimmedEmail,
    password,
  })

  if (error) {
    return {
      user: null,
      session: null,
      error,
    }
  }

  return {
    user: mapSupabaseUser(data.user),
    session: data.session,
    error: null,
  }
}

/**
 * Sign out the current user and terminate the active browser session.
 */
export async function signOut(): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { error: null }
  }

  const { error } = await supabase.auth.signOut()
  return { error }
}

/**
 * Restore the existing session from browser storage on initial application boot.
 */
export async function getInitialSession(): Promise<{
  session: Session | null
  user: AuthUser | null
  error: Error | null
}> {
  if (!isSupabaseConfigured) {
    return { session: null, user: null, error: null }
  }

  const { data, error } = await supabase.auth.getSession()
  if (error) {
    return { session: null, user: null, error }
  }

  return {
    session: data.session,
    user: mapSupabaseUser(data.session?.user ?? null),
    error: null,
  }
}

/**
 * Subscribe to Supabase authentication state transitions.
 * Returns an unsubscription function for component lifecycle cleanup.
 */
export function onAuthStateChange(
  callback: (
    event: string,
    session: Session | null,
    user: AuthUser | null,
  ) => void,
): { unsubscribe: () => void } {
  if (!isSupabaseConfigured) {
    return { unsubscribe: () => {} }
  }

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session, mapSupabaseUser(session?.user ?? null))
  })

  return {
    unsubscribe: () => subscription.unsubscribe(),
  }
}

/**
 * Fetch the current authenticated user directly from the session.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!isSupabaseConfigured) return null
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return mapSupabaseUser(user)
}
