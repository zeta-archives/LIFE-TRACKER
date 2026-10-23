/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'
import { createRoute, redirect, useNavigate, useSearch } from '@tanstack/react-router'
import { Sparkles, Mail, Lock, User, ArrowRight } from 'lucide-react'
import { rootRoute } from './root'
import { useAuth } from '@/data'
import { Button, Input, FormField, Alert } from '@/components/ui'

interface LoginSearch {
  redirect?: string
}

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    return {
      redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
    }
  },
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/today' })
    }
  },
  component: LoginPage,
})

export const authRedirectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  beforeLoad: () => {
    throw redirect({ to: '/login' })
  },
})

export function LoginPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const search = useSearch({ from: loginRoute.id })

  const [mode, setMode] = React.useState<'signin' | 'signup'>('signin')
  const [fullName, setFullName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [confirmationNotice, setConfirmationNotice] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)
    setConfirmationNotice(null)

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.')
      return
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters in length.')
      return
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.')
        return
      }

      setIsSubmitting(true)
      try {
        const result = await auth.signUp({
          email,
          password,
          fullName: fullName.trim() || undefined,
        })

        if (result.error) {
          setErrorMessage(result.error.message)
        } else if (result.requiresEmailConfirmation) {
          setConfirmationNotice(
            `A confirmation link has been sent to ${email}. Please check your inbox and verify your email before signing in.`,
          )
          setMode('signin')
        } else {
          // Direct login success (email confirmation off in Supabase)
          const target = search.redirect || '/today'
          navigate({ to: target })
        }
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : 'An unexpected error occurred during signup.',
        )
      } finally {
        setIsSubmitting(false)
      }
    } else {
      // Sign In mode
      setIsSubmitting(true)
      try {
        const result = await auth.signIn({ email, password })
        if (result.error) {
          setErrorMessage(result.error.message)
        } else {
          const target = search.redirect || '/today'
          navigate({ to: target })
        }
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : 'An unexpected error occurred during sign in.',
        )
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-bg-base flex items-center justify-center p-4 selection:bg-accent/20 selection:text-accent overflow-hidden font-sans">
      {/* ── Atmospheric Ambient Ember Glow ── */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] bg-accent/[0.045] rounded-full blur-[140px] pointer-events-none"
        aria-hidden="true"
      />

      {/* ── Sanctuary Auth Container (Anti-Card Architecture) ── */}
      <div className="relative z-10 w-full max-w-[420px] rounded-2xl bg-bg-elevated/80 border border-border/70 backdrop-blur-xl shadow-2xl p-7 sm:p-8 flex flex-col gap-6">
        
        {/* ── Brand Header ── */}
        <div className="flex flex-col items-center text-center gap-2 select-none">
          {/* Luminous Ember Mark */}
          <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/25 flex items-center justify-center shadow-[0_0_20px_rgba(217,119,6,0.2)] mb-1">
            <Sparkles className="w-5 h-5 text-accent animate-pulse" aria-hidden="true" />
          </div>

          <h1 className="font-serif text-3xl font-normal text-text-primary tracking-tight">
            Aether
          </h1>
          <p className="font-sans text-[13px] text-text-secondary leading-relaxed max-w-[300px]">
            {mode === 'signin'
              ? 'Enter your sanctuary of focus and personal momentum.'
              : 'Begin your journey with an intelligent personal life system.'}
          </p>
        </div>

        {/* ── Mode Switcher Tabs ── */}
        <div
          role="tablist"
          aria-label="Authentication mode"
          className="grid grid-cols-2 p-1 rounded-lg bg-bg-base/70 border border-border-subtle"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signin'}
            onClick={() => {
              setMode('signin')
              setErrorMessage(null)
            }}
            className={`
              py-1.5 text-[12px] font-medium rounded-md transition-all duration-150
              ${
                mode === 'signin'
                  ? 'bg-bg-elevated text-text-primary shadow-sm border border-white/[0.08]'
                  : 'text-text-muted hover:text-text-secondary'
              }
            `}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            onClick={() => {
              setMode('signup')
              setErrorMessage(null)
            }}
            className={`
              py-1.5 text-[12px] font-medium rounded-md transition-all duration-150
              ${
                mode === 'signup'
                  ? 'bg-bg-elevated text-text-primary shadow-sm border border-white/[0.08]'
                  : 'text-text-muted hover:text-text-secondary'
              }
            `}
          >
            Create Account
          </button>
        </div>

        {/* ── Configuration Warning (Dev only if not configured) ── */}
        {!auth.isConfigured && (
          <Alert variant="warning" title="Supabase Not Configured">
            Frontend environment variables are using placeholder values. Sign-in requires
            configuring <code className="text-accent text-[11px]">VITE_SUPABASE_URL</code> in{' '}
            <code className="text-text-primary text-[11px]">.env.local</code>.
          </Alert>
        )}

        {/* ── Feedback Alerts ── */}
        {errorMessage && (
          <Alert
            variant="danger"
            onDismiss={() => setErrorMessage(null)}
          >
            {errorMessage}
          </Alert>
        )}

        {confirmationNotice && (
          <Alert
            variant="success"
            title="Confirmation Required"
            onDismiss={() => setConfirmationNotice(null)}
          >
            {confirmationNotice}
          </Alert>
        )}

        {/* ── Auth Form ── */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'signup' && (
            <FormField id="auth-fullname" label="Full Name" helperText="Your preferred display name">
              <div className="relative">
                <User
                  className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <Input
                  type="text"
                  placeholder="e.g. Maya Lin"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isSubmitting}
                  className="pl-9"
                  autoComplete="name"
                />
              </div>
            </FormField>
          )}

          <FormField id="auth-email" label="Email Address" required>
            <div className="relative">
              <Mail
                className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <Input
                type="email"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                className="pl-9"
                autoComplete="email"
              />
            </div>
          </FormField>

          <FormField
            id="auth-password"
            label="Password"
            required
            helperText={mode === 'signup' ? 'Minimum 6 characters' : undefined}
          >
            <div className="relative">
              <Lock
                className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <Input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                className="pl-9"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </div>
          </FormField>

          {mode === 'signup' && (
            <FormField id="auth-confirm-password" label="Confirm Password" required>
              <div className="relative">
                <Lock
                  className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="pl-9"
                  autoComplete="new-password"
                />
              </div>
            </FormField>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            className="w-full mt-2 font-medium tracking-wide justify-center"
          >
            <span>{mode === 'signin' ? 'Sign In to Aether' : 'Create Sanctuary Account'}</span>
            {!isSubmitting && <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />}
          </Button>
        </form>

        {/* ── Subtitle helper ── */}
        <div className="text-center pt-1 border-t border-border-subtle">
          <p className="text-[12px] text-text-muted">
            {mode === 'signin' ? "Don't have an account yet? " : 'Already registered? '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin')
                setErrorMessage(null)
              }}
              className="text-accent hover:text-accent-hover font-medium underline-offset-4 hover:underline transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded-sm"
            >
              {mode === 'signin' ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </div>

      </div>
    </div>
  )
}
