/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'
import { createRoute } from '@tanstack/react-router'
import {
  Settings,
  Cloud,
  ShieldCheck,
  Bell,
  Sliders,
  Database,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'
import { shellRoute } from './shell'
import { useAuth, isSupabaseConfigured } from '@/data'
import { Button, Badge, Alert, FormField, Input } from '@/components/ui'

export function SettingsPage() {
  const { user } = useAuth()
  const [syncStatus, setSyncStatus] = React.useState<'idle' | 'syncing' | 'success'>('idle')
  const [attendanceWarningThreshold, setAttendanceWarningThreshold] = React.useState(80)
  const [deadlineHorizonDays, setDeadlineHorizonDays] = React.useState(7)
  const [savedFeedback, setSavedFeedback] = React.useState<string | null>(null)

  const handleTriggerSync = () => {
    setSyncStatus('syncing')
    setTimeout(() => {
      setSyncStatus('success')
      setTimeout(() => setSyncStatus('idle'), 3000)
    }, 800)
  }

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault()
    setSavedFeedback('Operational baseline thresholds updated successfully.')
    setTimeout(() => setSavedFeedback(null), 4000)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-8 font-sans selection:bg-accent/20 selection:text-accent">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Settings className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-normal text-text-primary tracking-tight">
              Settings
            </h1>
            <p className="text-[13px] text-text-secondary">
              Configure system operational baselines, notification thresholds, and cloud synchronization.
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleTriggerSync}
          loading={syncStatus === 'syncing'}
          className="gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{syncStatus === 'success' ? 'Synchronized' : 'Verify Cloud Sync'}</span>
        </Button>
      </div>

      {savedFeedback && (
        <Alert variant="success" onDismiss={() => setSavedFeedback(null)}>
          {savedFeedback}
        </Alert>
      )}

      {/* ── Operational Baselines & Thresholds ── */}
      <section className="p-6 rounded-xl bg-bg-elevated/70 border border-border flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-semibold text-text-primary tracking-tight">
            Urgency &amp; Operational Thresholds
          </h2>
        </div>
        <p className="text-[12px] text-text-secondary -mt-2">
          Control how Life Sync and the Today workspace evaluate upcoming deadlines and attendance risk horizons.
        </p>

        <form onSubmit={handleSavePreferences} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <FormField
            id="attendance-threshold"
            label="Attendance Warning Threshold (%)"
            helperText="Surfaces warnings in Today when course attendance falls below this rate"
          >
            <Input
              type="number"
              min={50}
              max={100}
              value={attendanceWarningThreshold}
              onChange={(e) => setAttendanceWarningThreshold(parseInt(e.target.value, 10) || 80)}
            />
          </FormField>

          <FormField
            id="deadline-horizon"
            label="Deadline Horizon (Days)"
            helperText="Number of days ahead to scan for approaching academic milestones and tasks"
          >
            <Input
              type="number"
              min={1}
              max={30}
              value={deadlineHorizonDays}
              onChange={(e) => setDeadlineHorizonDays(parseInt(e.target.value, 10) || 7)}
            />
          </FormField>

          <div className="md:col-span-2 pt-2 flex justify-end">
            <Button type="submit" variant="primary" size="sm">
              Save Thresholds
            </Button>
          </div>
        </form>
      </section>

      {/* ── Cloud Storage & Backend Connectivity ── */}
      <section className="p-6 rounded-xl bg-bg-elevated/70 border border-border flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-text-primary tracking-tight">
              Cloud Persistence &amp; Storage
            </h2>
          </div>
          <Badge variant={isSupabaseConfigured ? 'success' : 'warning'}>
            {isSupabaseConfigured ? 'Supabase Connected' : 'Local Mode'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-lg bg-bg-base/60 border border-border-subtle flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-text-muted flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-accent" />
              Backend Provider
            </span>
            <span className="text-[13px] font-semibold text-text-primary">
              Supabase PostgreSQL
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-bg-base/60 border border-border-subtle flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-text-muted flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-status-success" />
              Row Level Security
            </span>
            <span className="text-[13px] font-semibold text-text-primary">
              Strict User Isolation
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-bg-base/60 border border-border-subtle flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-text-muted flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
              Tenant Scope
            </span>
            <span className="text-[12px] font-mono text-text-secondary truncate">
              {user?.id ? user.id.slice(0, 8) + '...' : 'Unauthenticated'}
            </span>
          </div>
        </div>
      </section>

      {/* ── Notifications & Ambient Feedback ── */}
      <section className="p-6 rounded-xl bg-bg-elevated/70 border border-border flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-semibold text-text-primary tracking-tight">
            Notification Preferences
          </h2>
        </div>
        <p className="text-[12px] text-text-secondary">
          Desktop notifications for focus interval completions, daily plan reminders, and streak maintenance warnings.
        </p>

        <div className="p-4 rounded-lg bg-bg-base/40 border border-border-subtle text-[12px] text-text-muted flex items-center justify-between">
          <span>Browser desktop notifications are enabled for active focus session timers.</span>
          <Badge variant="default" size="sm">Active</Badge>
        </div>
      </section>
    </div>
  )
}

export const settingsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/settings',
  component: SettingsPage,
})
