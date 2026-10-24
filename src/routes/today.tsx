/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'
import { createRoute } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Calendar,
  Clock,
  AlertTriangle,
  MapPin,
  CalendarDays,
  Target,
  Trash2,
  Coffee,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { shellRoute } from './shell'
import {
  useTasks,
  useLifeAreas,
  useGoals,
  fetchCalendarEvents,
  deleteCalendarEvent,
  type Task,
  type CalendarEvent,
  type CalendarEventType,
} from '@/data'
import { useQuickLog } from '@/components/quick-log'
import { Button, Input, Skeleton, Alert, Badge, formatHumanDate } from '@/components/ui'
import { TaskItem } from '@/components/tasks/TaskItem'
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog'
import { EditTaskDialog } from '@/components/tasks/EditTaskDialog'
import { CreateEventDialog } from '@/components/calendar/CreateEventDialog'

export function TodayPage() {
  const { tasks, isLoading: isTasksLoading, error: tasksError, refetch: refetchTasks, updateTask } = useTasks()
  const { lifeAreas, isLoading: isAreasLoading } = useLifeAreas()
  const { goals } = useGoals()
  const { openQuickLog } = useQuickLog()

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [createEventDialogOpen, setCreateEventDialogOpen] = React.useState(false)
  const [eventDialogType, setEventDialogType] = React.useState<CalendarEventType>('study_block')
  const [eventDialogTitle, setEventDialogTitle] = React.useState('')
  const [editingTask, setEditingTask] = React.useState<Task | null>(null)

  // Commitments State
  const [events, setEvents] = React.useState<CalendarEvent[]>([])
  const [isEventsLoading, setIsEventsLoading] = React.useState(false)

  // Planning Scope Filter: 'today' (scheduled/due today + overdue) vs 'all' (entire backlog)
  const [planningScope, setPlanningScope] = React.useState<'today' | 'all'>('today')

  // Domain & Search Filters
  const [selectedAreaId, setSelectedAreaId] = React.useState<string>('all')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [completedExpanded, setCompletedExpanded] = React.useState(false)
  const [triageStatus, setTriageStatus] = React.useState<string | null>(null)

  // Today Date Strings
  const todayStr = React.useMemo(() => {
    return new Date().toISOString().split('T')[0]
  }, [])

  const formattedTodayDate = React.useMemo(() => {
    return new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }, [])

  // Load Today's Calendar Commitments
  const loadEvents = React.useCallback(async () => {
    setIsEventsLoading(true)
    const startOfDay = `${todayStr}T00:00:00.000Z`
    const endOfDay = `${todayStr}T23:59:59.999Z`
    const result = await fetchCalendarEvents({
      startDate: startOfDay,
      endDate: endOfDay,
    })
    if (!result.error) {
      setEvents(result.data)
    }
    setIsEventsLoading(false)
  }, [todayStr])

  React.useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const handleSyncAll = async () => {
    await Promise.all([refetchTasks(), loadEvents()])
  }

  const handleDeleteEvent = async (id: string) => {
    const res = await deleteCalendarEvent(id)
    if (!res.error) {
      setEvents((prev) => prev.filter((e) => e.id !== id))
    }
  }

  const openScheduleDialog = (type: CalendarEventType = 'study_block', title = '') => {
    setEventDialogType(type)
    setEventDialogTitle(title)
    setCreateEventDialogOpen(true)
  }

  // ── Scheduling Constraints & Conflict Detection ──
  const scheduleConflicts = React.useMemo(() => {
    const sorted = [...events].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    )
    const conflicts: { eventA: CalendarEvent; eventB: CalendarEvent }[] = []
    for (let i = 0; i < sorted.length - 1; i++) {
      const curr = sorted[i]
      const next = sorted[i + 1]
      if (new Date(next.startTime).getTime() < new Date(curr.endTime).getTime()) {
        conflicts.push({ eventA: curr, eventB: next })
      }
    }
    return conflicts
  }, [events])

  // ── Make Room for Breaks & Capacity Calculation ──
  const { committedWorkMinutes, scheduledBreakMinutes } = React.useMemo(() => {
    let work = 0
    let breaks = 0
    events.forEach((ev) => {
      const start = new Date(ev.startTime).getTime()
      const end = new Date(ev.endTime).getTime()
      const mins = Math.max(0, Math.round((end - start) / 60000))
      if (ev.eventType === 'personal') {
        breaks += mins
      } else {
        work += mins
      }
    })
    return { committedWorkMinutes: work, scheduledBreakMinutes: breaks }
  }, [events])

  // Filter tasks based on domain, search query, and planning scope
  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task) => {
      // Planning Scope Filter
      if (planningScope === 'today') {
        const isScheduledToday = task.scheduledDate === todayStr
        const isDueToday = task.dueDate === todayStr
        const isOverdue = Boolean(task.dueDate && task.dueDate < todayStr && task.status !== 'completed')
        const isUnscheduledActive = !task.scheduledDate && task.status !== 'completed'

        if (!isScheduledToday && !isDueToday && !isOverdue && !isUnscheduledActive && task.status !== 'completed') {
          return false
        }
      }

      // Domain Filter
      if (selectedAreaId !== 'all' && task.lifeAreaId !== selectedAreaId) {
        return false
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = task.title.toLowerCase().includes(q)
        const matchDesc = task.description?.toLowerCase().includes(q)
        if (!matchTitle && !matchDesc) return false
      }
      return true
    })
  }, [tasks, planningScope, selectedAreaId, searchQuery, todayStr])

  // Partition filtered tasks into 3 priority tiers + completed
  const mustHappenTasks = React.useMemo(
    () => filteredTasks.filter((t) => t.status !== 'completed' && t.priority === 'must_happen'),
    [filteredTasks],
  )

  const shouldHappenTasks = React.useMemo(
    () => filteredTasks.filter((t) => t.status !== 'completed' && t.priority === 'should_happen'),
    [filteredTasks],
  )

  const couldHappenTasks = React.useMemo(
    () => filteredTasks.filter((t) => t.status !== 'completed' && t.priority === 'could_happen'),
    [filteredTasks],
  )

  const completedTasks = React.useMemo(
    () => filteredTasks.filter((t) => t.status === 'completed'),
    [filteredTasks],
  )

  // Overall counts for summary metrics
  const totalMust = tasks.filter((t) => t.status !== 'completed' && t.priority === 'must_happen').length
  const totalShould = tasks.filter((t) => t.status !== 'completed' && t.priority === 'should_happen').length
  const totalCould = tasks.filter((t) => t.status !== 'completed' && t.priority === 'could_happen').length
  const totalCompleted = tasks.filter((t) => t.status === 'completed').length
  const totalActive = totalMust + totalShould + totalCould
  const totalAll = totalActive + totalCompleted
  const completionPercentage = totalAll > 0 ? Math.round((totalCompleted / totalAll) * 100) : 0

  // Estimated Planned Focus Time
  const plannedFocusMinutes = React.useMemo(() => {
    return tasks
      .filter((t) => t.status !== 'completed' && t.estimatedDurationMinutes)
      .reduce((sum, t) => sum + (t.estimatedDurationMinutes || 0), 0)
  }, [tasks])

  const plannedHours = Math.floor(plannedFocusMinutes / 60)
  const plannedRemainingMins = plannedFocusMinutes % 60

  // Total planned work and protected buffer calculation
  const totalPlannedEffortMins = committedWorkMinutes + plannedFocusMinutes
  const totalWakingDayMins = 16 * 60 // 16 waking hours baseline
  const protectedBufferMins = Math.max(0, totalWakingDayMins - (totalPlannedEffortMins + scheduledBreakMinutes))
  const isHighDensity = totalPlannedEffortMins > 10 * 60

  // Overdue and Upcoming Deadlines (within 7 days)
  const overdueTasks = React.useMemo(() => {
    return tasks.filter((t) => {
      if (!t.dueDate || t.status === 'completed' || t.status === 'cancelled') return false
      return t.dueDate < todayStr
    })
  }, [tasks, todayStr])

  const upcomingTasks = React.useMemo(() => {
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    const nextWeekStr = nextWeek.toISOString().split('T')[0]

    return tasks.filter((t) => {
      if (!t.dueDate || t.status === 'completed' || t.status === 'cancelled') return false
      return t.dueDate >= todayStr && t.dueDate <= nextWeekStr
    })
  }, [tasks, todayStr])

  const upcomingGoals = React.useMemo(() => {
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 14)
    const nextTwoWeeksStr = nextWeek.toISOString().split('T')[0]

    return goals.filter((g) => {
      if (!g.targetDate || g.status === 'achieved' || g.status === 'abandoned') return false
      return g.targetDate <= nextTwoWeeksStr
    })
  }, [goals])

  // Batch triage: reschedule all overdue tasks to today
  const handleRescheduleOverdueToToday = async () => {
    setTriageStatus('Rescheduling overdue tasks to today...')
    for (const t of overdueTasks) {
      await updateTask({
        id: t.id,
        scheduledDate: todayStr,
      })
    }
    await refetchTasks()
    setTriageStatus(`Rescheduled ${overdueTasks.length} tasks to today.`)
    setTimeout(() => setTriageStatus(null), 3000)
  }

  // Life Area Focus Distribution
  const domainDistribution = React.useMemo(() => {
    const counts: Record<string, number> = {}
    tasks.forEach((t) => {
      if (t.status !== 'completed') {
        counts[t.lifeAreaId] = (counts[t.lifeAreaId] || 0) + 1
      }
    })
    return lifeAreas.map((area) => ({
      ...area,
      activeCount: counts[area.id] || 0,
    }))
  }, [tasks, lifeAreas])

  const isLoading = isTasksLoading || isAreasLoading

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col gap-8 font-sans selection:bg-accent/20 selection:text-accent">
      {/* ── Page Header & Universal Daily Action Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-normal text-text-primary tracking-tight">
              Today
            </h1>
            <p className="text-[13px] text-text-secondary mt-0.5">
              {formattedTodayDate} — Operational command center for your daily commitments.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSyncAll}
            loading={isLoading}
            className="gap-1.5"
            title="Synchronize tasks and schedule from database"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sync</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => openQuickLog({ mode: 'log' })}
            className="gap-1.5 border-accent/30 text-accent hover:bg-accent/10"
            title="Open Universal Quick Log"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Quick Log</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => openScheduleDialog('personal', 'Recovery & Lunch Break')}
            className="gap-1.5 text-text-secondary hover:text-text-primary"
            title="Protect personal time or schedule a break"
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>+ Break</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => openScheduleDialog('study_block', '')}
            className="gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedule</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </Button>
        </div>
      </div>

      {tasksError && (
        <Alert variant="danger" title="Error Loading Tasks">
          {tasksError}
        </Alert>
      )}

      {/* ── Scheduling Conflicts Warning (Respect Commitments) ── */}
      {scheduleConflicts.length > 0 && (
        <div className="p-4 rounded-xl bg-status-danger/10 border border-status-danger/30 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-status-danger flex-shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-status-danger">
                Schedule Overlap Detected ({scheduleConflicts.length})
              </span>
              <p className="text-xs text-text-secondary leading-relaxed">
                {scheduleConflicts.map((c, i) => (
                  <span key={i} className="block">
                    &ldquo;{c.eventA.title}&rdquo; overlaps with &ldquo;{c.eventB.title}&rdquo;.
                    Fixed commitments cannot be shifted automatically. Please resolve the time block conflict.
                  </span>
                ))}
              </p>
            </div>
          </div>
          <Badge variant="danger" size="sm">Fixed Conflict</Badge>
        </div>
      )}

      {/* ── Schedule Density / Overload Warning ── */}
      {isHighDensity && (
        <div className="p-3.5 rounded-xl bg-status-warning/10 border border-status-warning/30 flex items-start gap-3 animate-in fade-in">
          <Clock className="w-4 h-4 text-status-warning flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-status-warning">
              High Schedule Density: {Math.floor(totalPlannedEffortMins / 60)}h {totalPlannedEffortMins % 60}m of work &amp; commitments planned.
            </span>
            <span className="text-[11px] text-text-muted">
              Remember to preserve buffer time for recovery, unexpected delays, and cognitive rest.
            </span>
          </div>
        </div>
      )}

      {/* ── Overdue Deadlines Urgent Alert Banner ── */}
      {overdueTasks.length > 0 && (
        <div className="p-4 rounded-xl bg-status-danger/10 border border-status-danger/30 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-status-danger flex-shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-status-danger">
                {overdueTasks.length} Overdue {overdueTasks.length === 1 ? 'Task' : 'Tasks'} Require Attention
              </span>
              <p className="text-xs text-text-secondary">
                {overdueTasks.slice(0, 3).map((t) => t.title).join(', ')}
                {overdueTasks.length > 3 ? ` and ${overdueTasks.length - 3} more` : ''}.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRescheduleOverdueToToday}
              className="text-xs font-medium px-2.5 py-1 rounded-md bg-status-danger/20 hover:bg-status-danger/30 text-status-danger transition-colors flex items-center gap-1"
            >
              <Zap className="w-3 h-3" />
              <span>Plan for Today</span>
            </button>
            <Badge variant="danger" size="sm">Urgent</Badge>
          </div>
        </div>
      )}

      {triageStatus && (
        <div className="p-3 rounded-lg bg-accent/10 border border-accent/30 text-accent text-xs font-medium animate-in fade-in">
          {triageStatus}
        </div>
      )}

      {/* ── Make Room for Breaks: Daily Time Allocation & Buffer Strip ── */}
      <div className="p-4 rounded-xl bg-bg-elevated/70 border border-border flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-status-success" />
            <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">
              Daily Balance &amp; Preserved Buffer
            </span>
          </div>
          <span className="text-[11px] text-text-muted">
            Unscheduled time is protected for recovery — not assumed to be work time.
          </span>
        </div>

        {/* Visual Allocation Bar */}
        <div className="w-full h-3 rounded-full bg-white/[0.04] overflow-hidden flex">
          {committedWorkMinutes > 0 && (
            <div
              style={{ width: `${(committedWorkMinutes / totalWakingDayMins) * 100}%` }}
              className="h-full bg-sky-500/80 transition-all"
              title={`Fixed Commitments: ${committedWorkMinutes}m`}
            />
          )}
          {plannedFocusMinutes > 0 && (
            <div
              style={{ width: `${(plannedFocusMinutes / totalWakingDayMins) * 100}%` }}
              className="h-full bg-accent transition-all"
              title={`Planned Focus Tasks: ${plannedFocusMinutes}m`}
            />
          )}
          {scheduledBreakMinutes > 0 && (
            <div
              style={{ width: `${(scheduledBreakMinutes / totalWakingDayMins) * 100}%` }}
              className="h-full bg-status-success transition-all"
              title={`Scheduled Breaks: ${scheduledBreakMinutes}m`}
            />
          )}
          {protectedBufferMins > 0 && (
            <div
              style={{ width: `${(protectedBufferMins / totalWakingDayMins) * 100}%` }}
              className="h-full bg-white/[0.08] transition-all"
              title={`Protected Buffer: ${Math.floor(protectedBufferMins / 60)}h ${protectedBufferMins % 60}m`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-text-secondary pt-0.5">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>Fixed Commitments: {Math.floor(committedWorkMinutes / 60)}h {committedWorkMinutes % 60}m</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span>Focus Tasks: {plannedHours}h {plannedRemainingMins}m</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-status-success" />
            <span>Breaks &amp; Personal: {Math.floor(scheduledBreakMinutes / 60)}h {scheduledBreakMinutes % 60}m</span>
          </span>
          <span className="flex items-center gap-1.5 text-text-muted">
            <span className="w-2 h-2 rounded-full bg-white/20" />
            <span>Protected Buffer: {Math.floor(protectedBufferMins / 60)}h {protectedBufferMins % 60}m</span>
          </span>
        </div>
      </div>

      {/* ── Progress & Momentum Overview Strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Metric 1: Must Happen */}
        <div className="p-3.5 rounded-xl bg-bg-elevated/70 border border-status-danger/25 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-status-danger/10 flex items-center justify-center text-status-danger flex-shrink-0">
            <span className="font-semibold text-xs">1</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] text-text-muted uppercase tracking-wider">Must Happen</span>
            <span className="text-xl font-semibold text-status-danger">{totalMust}</span>
          </div>
        </div>

        {/* Metric 2: Should Happen */}
        <div className="p-3.5 rounded-xl bg-bg-elevated/70 border border-accent/25 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
            <span className="font-semibold text-xs">2</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] text-text-muted uppercase tracking-wider">Should Happen</span>
            <span className="text-xl font-semibold text-accent">{totalShould}</span>
          </div>
        </div>

        {/* Metric 3: Could Happen */}
        <div className="p-3.5 rounded-xl bg-bg-elevated/70 border border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-text-secondary flex-shrink-0">
            <span className="font-semibold text-xs">3</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] text-text-muted uppercase tracking-wider">Could Happen</span>
            <span className="text-xl font-semibold text-text-primary">{totalCould}</span>
          </div>
        </div>

        {/* Metric 4: Completed */}
        <div className="p-3.5 rounded-xl bg-bg-elevated/70 border border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-status-success/10 flex items-center justify-center text-status-success flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] text-text-muted uppercase tracking-wider">Completed</span>
            <span className="text-xl font-semibold text-text-primary">
              {totalCompleted}
              <span className="text-xs font-normal text-text-muted ml-1.5 font-mono">
                ({completionPercentage}%)
              </span>
            </span>
          </div>
        </div>

        {/* Metric 5: Focus Budget */}
        <div className="p-3.5 rounded-xl bg-bg-elevated/70 border border-border flex items-center gap-3 col-span-2 lg:col-span-1">
          <div className="w-8 h-8 rounded-lg bg-accent-subtle flex items-center justify-center text-accent flex-shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] text-text-muted uppercase tracking-wider">Focus Planned</span>
            <span className="text-lg font-semibold text-text-primary">
              {plannedHours > 0 ? `${plannedHours}h ` : ''}{plannedRemainingMins}m
            </span>
          </div>
        </div>
      </div>

      {/* ── Filters & Planning Scope Bar ── */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Scope Selector: Today's Focus vs Full Backlog */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-bg-elevated border border-border-subtle flex-shrink-0">
            <button
              type="button"
              onClick={() => setPlanningScope('today')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                planningScope === 'today'
                  ? 'bg-accent/15 text-accent border border-accent/30 shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Today&apos;s Focus
            </button>
            <button
              type="button"
              onClick={() => setPlanningScope('all')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                planningScope === 'all'
                  ? 'bg-accent/15 text-accent border border-accent/30 shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              All Backlog Tasks ({tasks.length})
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-60 flex-shrink-0">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-8"
            />
          </div>
        </div>

        {/* Domain Filter Pills with custom amber scrollbar slider */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-1.5 flex-1 domain-filter-slider"
          data-domain-slider="true"
          aria-label="Filter tasks by life domain"
        >
          <span className="text-[11px] text-text-muted mr-1 flex items-center gap-1 flex-shrink-0">
            <Filter className="w-3 h-3" />
            <span>Domain:</span>
          </span>

          <button
            type="button"
            onClick={() => setSelectedAreaId('all')}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors border flex-shrink-0 ${
              selectedAreaId === 'all'
                ? 'bg-accent/15 border-accent text-accent'
                : 'bg-white/[0.03] border-border-subtle text-text-muted hover:text-text-primary'
            }`}
          >
            All Domains ({tasks.length})
          </button>

          {domainDistribution.map((area) => (
            <button
              key={area.id}
              type="button"
              onClick={() => setSelectedAreaId(area.id)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors border flex items-center gap-1.5 flex-shrink-0 ${
                selectedAreaId === area.id
                  ? 'bg-accent/15 border-accent text-accent'
                  : 'bg-white/[0.03] border-border-subtle text-text-muted hover:text-text-primary'
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: area.accentColor }}
                aria-hidden="true"
              />
              <span>{area.name}</span>
              {area.activeCount > 0 && (
                <span className="text-[9.5px] opacity-75 font-mono">({area.activeCount})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Dashboard Layout: Operational Priorities + Side Context ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Today's Priorities Task Matrix */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {isLoading && tasks.length === 0 ? (
            <div className="flex flex-col gap-3 py-4">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-border rounded-xl text-text-muted flex flex-col items-center gap-3">
              <Sparkles className="w-10 h-10 opacity-30 text-accent" />
              <p className="text-base font-serif text-text-primary">
                No tasks scheduled yet
              </p>
              <p className="text-xs text-text-secondary max-w-md leading-relaxed">
                Tasks represent your daily executable units of work linked to your life domains and goals. Add your first task to start organizing your day.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCreateDialogOpen(true)}
                className="mt-2 gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create First Task</span>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Section 1: Must Happen */}
              <section className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-border-subtle">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-status-danger" />
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                      1. Must Happen ({mustHappenTasks.length})
                    </h2>
                  </div>
                  <span className="text-[11px] text-text-muted">Essential non-negotiable commitments</span>
                </div>

                {mustHappenTasks.length === 0 ? (
                  <div className="p-4 text-center border border-dashed border-border-subtle rounded-lg text-text-muted text-[12px]">
                    No active &ldquo;Must happen&rdquo; tasks.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {mustHappenTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onEdit={(t) => setEditingTask(t)}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* Section 2: Should Happen */}
              <section className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-border-subtle">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                      2. Should Happen ({shouldHappenTasks.length})
                    </h2>
                  </div>
                  <span className="text-[11px] text-text-muted">Important high-leverage work</span>
                </div>

                {shouldHappenTasks.length === 0 ? (
                  <div className="p-4 text-center border border-dashed border-border-subtle rounded-lg text-text-muted text-[12px]">
                    No active &ldquo;Should happen&rdquo; tasks.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {shouldHappenTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onEdit={(t) => setEditingTask(t)}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* Section 3: Could Happen */}
              <section className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-border-subtle">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-text-muted/60" />
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                      3. Could Happen ({couldHappenTasks.length})
                    </h2>
                  </div>
                  <span className="text-[11px] text-text-muted">Optional work when capacity allows</span>
                </div>

                {couldHappenTasks.length === 0 ? (
                  <div className="p-4 text-center border border-dashed border-border-subtle rounded-lg text-text-muted text-[12px]">
                    No active &ldquo;Could happen&rdquo; tasks.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {couldHappenTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onEdit={(t) => setEditingTask(t)}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* Section 4: Completed Tasks (Collapsible) */}
              {completedTasks.length > 0 && (
                <section className="flex flex-col gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setCompletedExpanded(!completedExpanded)}
                    className="flex items-center justify-between pb-1 border-b border-border-subtle text-left group"
                  >
                    <div className="flex items-center gap-2">
                      {completedExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                      )}
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary group-hover:text-text-primary transition-colors">
                        Completed Tasks ({completedTasks.length})
                      </h2>
                    </div>
                    <span className="text-[11px] text-text-muted">
                      {completedExpanded ? 'Click to collapse' : 'Click to expand'}
                    </span>
                  </button>

                  {completedExpanded && (
                    <div className="flex flex-col gap-2 pt-1">
                      {completedTasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onEdit={(t) => setEditingTask(t)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Schedule Commitments + Deadlines + Context */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* 1. Today's Scheduled Commitments (Fixed Constraints) */}
          <div className="p-5 rounded-xl bg-bg-elevated/70 border border-border flex flex-col gap-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-accent" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                  Today&apos;s Commitments ({events.length})
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openScheduleDialog('personal', 'Lunch & Recovery Break')}
                  className="text-[11px] text-status-success hover:underline font-medium flex items-center gap-0.5"
                  title="Schedule a personal break"
                >
                  <Coffee className="w-3 h-3" />
                  <span>+ Break</span>
                </button>
                <span className="text-text-muted/40">•</span>
                <button
                  type="button"
                  onClick={() => openScheduleDialog('study_block', '')}
                  className="text-[11px] text-accent hover:text-accent-hover font-medium flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {isEventsLoading ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ) : events.length === 0 ? (
              <div className="p-4 text-center border border-dashed border-border-subtle rounded-lg text-text-muted text-[12px] flex flex-col items-center gap-1.5">
                <span>No scheduled commitments today.</span>
                <span className="text-[11px] opacity-75">Your calendar schedule is clear. Flexible tasks can be organized freely.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {events.map((ev) => {
                  const area = lifeAreas.find((a) => a.id === ev.lifeAreaId)
                  const startHour = new Date(ev.startTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                  const endHour = new Date(ev.endTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                  const isPersonal = ev.eventType === 'personal'

                  return (
                    <div
                      key={ev.id}
                      className={`group p-2.5 rounded-lg border transition-colors flex items-start justify-between gap-2 ${
                        isPersonal
                          ? 'bg-status-success/[0.04] border-status-success/20'
                          : 'bg-white/[0.02] border-border-subtle hover:border-white/[0.1]'
                      }`}
                    >
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: isPersonal ? '#4EAC7A' : (area?.accentColor || '#D97706') }}
                            aria-hidden="true"
                          />
                          <span className="text-xs font-medium text-text-primary truncate">
                            {ev.title}
                          </span>
                          {isPersonal && (
                            <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-status-success/15 text-status-success font-medium">
                              Break
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[10.5px] text-text-muted font-mono">
                          <span>{startHour} - {endHour}</span>
                          <span className="text-text-muted/60">• Fixed Constraint</span>
                          {ev.location && (
                            <span className="flex items-center gap-0.5 truncate max-w-[100px] text-text-secondary">
                              <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                              <span className="truncate">{ev.location}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(ev.id)}
                        title="Delete commitment"
                        className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-status-danger p-1 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 2. Upcoming Deadlines & Goals */}
          <div className="p-5 rounded-xl bg-bg-elevated/70 border border-border flex flex-col gap-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-accent" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                  Approaching Deadlines
                </h3>
              </div>
              <span className="text-[11px] text-text-muted font-mono">Next 7 Days</span>
            </div>

            {upcomingTasks.length === 0 && upcomingGoals.length === 0 ? (
              <div className="p-4 text-center border border-dashed border-border-subtle rounded-lg text-text-muted text-[12px]">
                No deadlines approaching in the next 7 days.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {/* Upcoming Tasks */}
                {upcomingTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="p-2.5 rounded-lg bg-white/[0.02] border border-border-subtle flex items-center justify-between gap-2"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs text-text-primary font-medium truncate">
                        {task.title}
                      </span>
                      <span className="text-[10.5px] text-text-muted">
                        Task Deadline: {formatHumanDate(task.dueDate || '')}
                      </span>
                    </div>
                    <Badge variant="outline" size="sm">Task</Badge>
                  </div>
                ))}

                {/* Upcoming Goal Horizons */}
                {upcomingGoals.slice(0, 3).map((goal) => (
                  <div
                    key={goal.id}
                    className="p-2.5 rounded-lg bg-accent/5 border border-accent/20 flex items-center justify-between gap-2"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs text-text-primary font-medium truncate">
                        {goal.title}
                      </span>
                      <span className="text-[10.5px] text-accent">
                        Goal Horizon: {goal.targetDate}
                      </span>
                    </div>
                    <Badge variant="accent" size="sm">Goal</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Dialogs ── */}
      <CreateTaskDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        defaultLifeAreaId={selectedAreaId !== 'all' ? selectedAreaId : undefined}
      />

      <EditTaskDialog
        task={editingTask}
        open={Boolean(editingTask)}
        onOpenChange={(open) => !open && setEditingTask(null)}
      />

      <CreateEventDialog
        open={createEventDialogOpen}
        onOpenChange={setCreateEventDialogOpen}
        onEventCreated={(ev) => setEvents((prev) => [...prev, ev])}
        defaultEventType={eventDialogType}
        defaultTitle={eventDialogTitle}
      />
    </div>
  )
}

export const todayRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/today',
  component: TodayPage,
})
