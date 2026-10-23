/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'
import { createRoute } from '@tanstack/react-router'
import {
  Target,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  PauseCircle,
  Flag,
} from 'lucide-react'
import { shellRoute } from './shell'
import { useGoals, useLifeAreas, type Goal } from '@/data'
import { Button, Input, Skeleton, Alert } from '@/components/ui'
import { GoalCard } from '@/components/goals/GoalCard'
import { CreateGoalDialog } from '@/components/goals/CreateGoalDialog'
import { EditGoalDialog } from '@/components/goals/EditGoalDialog'

export function GoalsPage() {
  const { goals, isLoading, error, refetch } = useGoals()
  const { lifeAreas } = useLifeAreas()

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [editingGoal, setEditingGoal] = React.useState<Goal | null>(null)

  // Filters
  const [selectedAreaId, setSelectedAreaId] = React.useState<string>('all')
  const [selectedStatusTab, setSelectedStatusTab] = React.useState<
    'active' | 'paused' | 'achieved' | 'all'
  >('active')
  const [searchQuery, setSearchQuery] = React.useState('')

  // Filtered goals calculation
  const filteredGoals = React.useMemo(() => {
    return goals.filter((goal) => {
      // Area filter
      if (selectedAreaId !== 'all' && goal.lifeAreaId !== selectedAreaId) {
        return false
      }

      // Status filter
      if (selectedStatusTab === 'active') {
        if (goal.status !== 'in_progress' && goal.status !== 'not_started') {
          return false
        }
      } else if (selectedStatusTab === 'paused') {
        if (goal.status !== 'paused') return false
      } else if (selectedStatusTab === 'achieved') {
        if (goal.status !== 'achieved') return false
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = goal.title.toLowerCase().includes(q)
        const matchDesc = goal.description?.toLowerCase().includes(q)
        const matchMilestone = goal.milestones.some((m) =>
          m.title.toLowerCase().includes(q),
        )
        if (!matchTitle && !matchDesc && !matchMilestone) return false
      }

      return true
    })
  }, [goals, selectedAreaId, selectedStatusTab, searchQuery])

  // Aggregate stats
  const activeCount = goals.filter(
    (g) => g.status === 'in_progress' || g.status === 'not_started',
  ).length
  const completedMilestonesCount = goals.reduce(
    (acc, g) => acc + g.milestones.filter((m) => m.status === 'completed').length,
    0,
  )
  const pausedCount = goals.filter((g) => g.status === 'paused').length
  const achievedCount = goals.filter((g) => g.status === 'achieved').length

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-8 font-sans selection:bg-accent/20 selection:text-accent">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-normal text-text-primary tracking-tight">
              Goals &amp; Milestones
            </h1>
            <p className="text-[13px] text-text-secondary">
              Connect long-term vision to verifiable checkpoints across your life domains.
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
            title="Synchronize goals from database"
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
            <span>New Goal</span>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="Error Loading Goals">
          {error}
        </Alert>
      )}

      {/* ── Summary Metrics ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-bg-elevated/70 border border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] text-text-muted uppercase tracking-wider">Active Goals</span>
            <span className="text-xl font-semibold text-text-primary">{activeCount}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-bg-elevated/70 border border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-status-success/10 flex items-center justify-center text-status-success flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] text-text-muted uppercase tracking-wider">Milestones Done</span>
            <span className="text-xl font-semibold text-text-primary">{completedMilestonesCount}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-bg-elevated/70 border border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-status-warning/10 flex items-center justify-center text-status-warning flex-shrink-0">
            <PauseCircle className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] text-text-muted uppercase tracking-wider">Paused</span>
            <span className="text-xl font-semibold text-text-primary">{pausedCount}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-bg-elevated/70 border border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-subtle flex items-center justify-center text-accent flex-shrink-0">
            <Flag className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] text-text-muted uppercase tracking-wider">Achieved</span>
            <span className="text-xl font-semibold text-text-primary">{achievedCount}</span>
          </div>
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="flex flex-col gap-3">
        {/* Status Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-bg-elevated/80 border border-border-subtle self-start">
            <button
              type="button"
              onClick={() => setSelectedStatusTab('active')}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${
                selectedStatusTab === 'active'
                  ? 'bg-accent/15 text-accent border border-accent/20'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatusTab('paused')}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${
                selectedStatusTab === 'paused'
                  ? 'bg-accent/15 text-accent border border-accent/20'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Paused ({pausedCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatusTab('achieved')}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${
                selectedStatusTab === 'achieved'
                  ? 'bg-accent/15 text-accent border border-accent/20'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Achieved ({achievedCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatusTab('all')}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors ${
                selectedStatusTab === 'all'
                  ? 'bg-accent/15 text-accent border border-accent/20'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              All ({goals.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search goals or milestones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-8"
            />
          </div>
        </div>

        {/* Life Area Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
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
            All Areas
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
      </div>

      {/* ── Goals Grid / List ── */}
      {isLoading && goals.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-xl text-text-muted flex flex-col items-center gap-3">
          <Target className="w-10 h-10 opacity-30 text-accent" />
          <p className="text-base font-serif text-text-primary">
            {goals.length === 0 ? 'No goals defined yet' : 'No goals match the active filter'}
          </p>
          <p className="text-xs text-text-secondary max-w-md leading-relaxed">
            {goals.length === 0
              ? 'Goals represent your major aspirations decomposed into verifiable milestones. Create your first goal to anchor your daily focus.'
              : 'Try selecting another status tab, clearing your search query, or choosing "All Areas".'}
          </p>
          {goals.length === 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCreateDialogOpen(true)}
              className="mt-2 gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Goal</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={(g) => setEditingGoal(g)}
            />
          ))}
        </div>
      )}

      {/* ── Dialogs ── */}
      <CreateGoalDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        defaultLifeAreaId={selectedAreaId !== 'all' ? selectedAreaId : undefined}
      />

      <EditGoalDialog
        goal={editingGoal}
        open={Boolean(editingGoal)}
        onOpenChange={(open) => !open && setEditingGoal(null)}
      />
    </div>
  )
}

export const goalsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/goals',
  component: GoalsPage,
})
