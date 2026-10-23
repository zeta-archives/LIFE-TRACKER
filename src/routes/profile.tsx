/* eslint-disable react-refresh/only-export-components */
import { createRoute } from '@tanstack/react-router'
import { User, LogOut, ShieldCheck, Mail, KeyRound } from 'lucide-react'
import { shellRoute } from './shell'
import { useAuth } from '@/data'
import { Button, Badge } from '@/components/ui'

export function ProfilePage() {
  const auth = useAuth()

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-8 font-sans">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-border-subtle pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
            <User className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-normal text-text-primary tracking-tight">
              Profile &amp; Account
            </h1>
            <p className="text-[13px] text-text-secondary">
              Your account identity, academic context, and personal operational parameters.
            </p>
          </div>
        </div>
      </div>

      {/* Account Identity Section */}
      <section className="p-6 rounded-xl bg-bg-elevated/70 border border-border flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-status-success" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Authenticated Identity
            </h2>
          </div>
          <Badge variant="success">Active Session</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-lg bg-bg-base/60 border border-border-subtle flex flex-col gap-1">
            <span className="text-[11px] font-medium text-text-muted flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              Email Address
            </span>
            <span className="text-[13px] font-semibold text-text-primary">
              {auth.user?.email || 'Unknown'}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-bg-base/60 border border-border-subtle flex flex-col gap-1">
            <span className="text-[11px] font-medium text-text-muted flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              Tenant User ID
            </span>
            <span className="text-[11px] font-mono text-text-secondary truncate">
              {auth.user?.id || '—'}
            </span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-border-subtle">
          <span className="text-[12px] text-text-muted">
            Signed in to Aether Soul persistent backend.
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => auth.signOut()}
            className="gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </section>

      {/* Operational Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-bg-elevated/40 border border-border-subtle flex flex-col gap-2">
          <h3 className="text-sm font-medium text-text-primary">
            Academic Term &amp; Schedule Context
          </h3>
          <p className="text-[12px] text-text-secondary leading-relaxed">
            Current term dates, exam horizons, and credit hour capacity tracking. Configured during Phase 5 feature rollouts.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-bg-elevated/40 border border-border-subtle flex flex-col gap-2">
          <h3 className="text-sm font-medium text-text-primary">
            Personal Capacity Baseline
          </h3>
          <p className="text-[12px] text-text-secondary leading-relaxed">
            Target sleep allocation (8.0h default), daily focus capacity (240m default), and personal rest preferences stored in your profile table.
          </p>
        </div>
      </div>
    </div>
  )
}

export const profileRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/profile',
  component: ProfilePage,
})
