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
} from 'lucide-react'
import { shellRoute } from './shell'
import { useTasks, useLifeAreas, type Task } from '@/data'
import { Button, Input, Skeleton, Alert } from '@/components/ui'
import { TaskItem } from '@/components/tasks/TaskItem'
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog'
import { EditTaskDialog } from '@/components/tasks/EditTaskDialog'

export function TodayPage() {
  const { tasks, isLoading, error, refetch } = useTasks()
  const { lifeAreas } = useLifeAreas()

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [editingTask, setEditingTask] = React.useState<Task | null>(null)

  // Filters
  const [selectedAreaId, setSelectedAreaId] = React.useState<string>('all')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [completedExpanded, setCompletedExpanded] = React.useState(false)

  // Human date format for Today
  const formattedTodayDate = React.useMemo(() => {
    return new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }, [])

  // Filter tasks based on domain and search query
  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task) => {
      if (selectedAreaId !== 'all' && task.lifeAreaId !== selectedAreaId) {
        return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = task.title.toLowerCase().includes(q)
        const matchDesc = task.description?.toLowerCase().includes(q)
        if (!matchTitle && !matchDesc) return false
      }
      return true
    })
  }, [tasks, selectedAreaId, searchQuery])

  // Partition filtered tasks into the 3 user-facing priority categories + completed
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

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-8 font-sans selection:bg-accent/20 selection:text-accent">
      {/* ── Page Header ── */}
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

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            loading={isLoading}
            className="gap-1.5"
            title="Synchronize tasks from database"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sync</span>
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

      {error && (
        <Alert variant="danger" title="Error Loading Tasks">
          {error}
        </Alert>
      )}

      {/* ── Summary Metrics by Priority Category ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-bg-elevated/70 border border-status-danger/25 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-status-danger/10 flex items-center justify-center text-status-danger flex-shrink-0">
            <span className="font-semibold text-xs">1</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] text-text-muted uppercase tracking-wider">Must Happen</span>
            <span className="text-xl font-semibold text-status-danger">{totalMust}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-bg-elevated/70 border border-accent/25 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
            <span className="font-semibold text-xs">2</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] text-text-muted uppercase tracking-wider">Should Happen</span>
            <span className="text-xl font-semibold text-accent">{totalShould}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-bg-elevated/70 border border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-text-secondary flex-shrink-0">
            <span className="font-semibold text-xs">3</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] text-text-muted uppercase tracking-wider">Could Happen</span>
            <span className="text-xl font-semibold text-text-primary">{totalCould}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-bg-elevated/70 border border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-status-success/10 flex items-center justify-center text-status-success flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] text-text-muted uppercase tracking-wider">Completed</span>
            <span className="text-xl font-semibold text-text-primary">{totalCompleted}</span>
          </div>
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Domain Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 flex-1">
            <span className="text-[11px] text-text-muted mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>Domain:</span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedAreaId('all')}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors border ${
                selectedAreaId === 'all'
                  ? 'bg-accent/15 border-accent text-accent'
                  : 'bg-white/[0.03] border-border-subtle text-text-muted hover:text-text-primary'
              }`}
            >
              All Domains
            </button>
            {lifeAreas.map((area) => (
              <button
                key={area.id}
                type="button"
                onClick={() => setSelectedAreaId(area.id)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors border flex items-center gap-1.5 ${
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
              </button>
            ))}
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
      </div>

      {/* ── Task Matrix Sections ── */}
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
    </div>
  )
}

export const todayRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/today',
  component: TodayPage,
})
