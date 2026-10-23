import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

/**
 * Checks if Supabase credentials have been configured in environment variables.
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('your-anon-or-publishable-key'),
)

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    '[Aether Data Layer] Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are missing or using placeholder values. Configure them in .env.local to enable remote database synchronization.',
  )
}

/**
 * Single canonical Supabase client for the browser.
 * LOCKED Architectural Boundary: This client must only be imported within `src/data/`.
 * UI components, hooks, and stores must NEVER import this client directly.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)
