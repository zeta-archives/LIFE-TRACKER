/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'
import type { Session } from '@supabase/supabase-js'
import {
  type AuthUser,
  type SignInParams,
  type SignUpParams,
  signInWithPassword,
  signUpWithPassword,
  signOut as authSignOut,
  getInitialSession,
  onAuthStateChange,
} from './auth'
import { isSupabaseConfigured } from './supabaseClient'

export interface AuthContextValue {
  user: AuthUser | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  isConfigured: boolean
  signIn: (credentials: SignInParams) => Promise<{ error: Error | null }>
  signUp: (
    credentials: SignUpParams,
  ) => Promise<{ error: Error | null; requiresEmailConfirmation: boolean }>
  signOut: () => Promise<{ error: Error | null }>
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null)
  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let mounted = true

    if (!isSupabaseConfigured) {
      setIsLoading(false)
      return
    }

    // 1. Initial session restoration on application boot
    getInitialSession()
      .then((result) => {
        if (!mounted) return
        if (result.error) {
          console.warn('[Aether Auth] Could not restore existing session:', result.error.message)
        }
        setSession(result.session)
        setUser(result.user)
      })
      .catch((err) => {
        if (!mounted) return
        console.error('[Aether Auth] Unexpected error restoring session:', err)
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false)
        }
      })

    // 2. Persistent auth state subscription with unsubscription cleanup
    const { unsubscribe } = onAuthStateChange((_event, currentSession, currentUser) => {
      if (!mounted) return
      setSession(currentSession)
      setUser(currentUser)
      setIsLoading(false)
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  const signIn = React.useCallback(async (credentials: SignInParams) => {
    const result = await signInWithPassword(credentials)
    if (!result.error && result.session) {
      setSession(result.session)
      setUser(result.user)
    }
    return { error: result.error }
  }, [])

  const signUp = React.useCallback(async (credentials: SignUpParams) => {
    const result = await signUpWithPassword(credentials)
    if (!result.error && result.session) {
      setSession(result.session)
      setUser(result.user)
    }
    return {
      error: result.error,
      requiresEmailConfirmation: result.requiresEmailConfirmation,
    }
  }, [])

  const signOut = React.useCallback(async () => {
    const result = await authSignOut()
    if (!result.error) {
      setSession(null)
      setUser(null)
    }
    return result
  }, [])

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      isLoading,
      isAuthenticated: Boolean(session && user),
      isConfigured: isSupabaseConfigured,
      signIn,
      signUp,
      signOut,
    }),
    [user, session, isLoading, signIn, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Access the Aether authentication state and session handlers.
 * Adheres to the locked data boundary: components never touch Supabase directly.
 */
export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
