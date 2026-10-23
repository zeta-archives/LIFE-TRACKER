import * as React from 'react'
import {
  Calendar,
  Layers,
  MoreVertical,
  Plus,
  Play,
  Pause,
  CheckCircle2,
  RotateCcw,
  Pencil,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Activity,
  Briefcase,
  Moon,
  Users,
  Smile,
  Sparkles,
  BookOpen,
  Heart,
  Palette,
  Compass,
  Code,
  Dumbbell,
  Music,
  Globe,
  type LucideIcon,
} from 'lucide-react'
import { useLifeAreas, useGoals, useTasks, type Goal, type GoalStatus } from '@/data'
import { deriveMilestoneProgress, deriveGoalTaskProgress } from '@/domain/lifecycle'
import {
  Badge,
  Button,
  Input,
  DatePicker,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui'
import { MilestoneItem } from './MilestoneItem'

const iconMap: Record<string, LucideIcon> = {
  GraduationCap,
  Activity,
  Briefcase,
  Moon,
  Users,
  Smile,
  Layers,
  Sparkles,
  BookOpen,
  Heart,
  Palette,
  Compass,
  Code,
  Dumbbell,
  Music,
  Globe,
}

interface GoalCardProps {
  goal: Goal
  onEdit: (goal: Goal) => void
}

export function GoalCard({ goal, onEdit }: GoalCardProps) {
  const { lifeAreas } = useLifeAreas()
  const { updateGoal, createMilestone, reorderMilestones } = useGoals()
  const { tasks } = useTasks()

  const [milestonesExpanded, setMilestonesExpanded] = React.useState(true)
  const [newMilestoneTitle, setNewMilestoneTitle] = React.useState('')
  const [newMilestoneDate, setNewMilestoneDate] = React.useState('')
  const [addingMilestone, setAddingMilestone] = React.useState(false)

  const lifeArea = lifeAreas.find((a) => a.id === goal.lifeAreaId)
  const AreaIcon = lifeArea?.iconName ? iconMap[lifeArea.iconName] || Layers : Layers

  // ── Milestone-completion progress (explicitly set by user) ────────────────
  const milestoneProgress = React.useMemo(
    () => deriveMilestoneProgress(goal.milestones),
    [goal.milestones],
  )

  // ── Task-derived progress (completed tasks / eligible tasks under this goal)
  // This is a DISTINCT indicator from milestone completion — it reflects
  // operational activity, not outcome achievement.
  const taskProgress = React.useMemo(
    () => deriveGoalTaskProgress(tasks, goal.id),
    [tasks, goal.id],
  )

  const handleStatusChange = async (newStatus: GoalStatus) => {
    await updateGoal({
      id: goal.id,
      status: newStatus,
    })
  }

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMilestoneTitle.trim()) return

    setAddingMilestone(true)
    const res = await createMilestone({
      goalId: goal.id,
      title: newMilestoneTitle.trim(),
      targetDate: newMilestoneDate || null,
    })
    setAddingMilestone(false)

    if (res.success) {
      setNewMilestoneTitle('')
      setNewMilestoneDate('')
      setMilestonesExpanded(true)
    }
  }

  const handleMoveMilestone = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= goal.milestones.length) return

    const reordered = [...goal.milestones]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, moved)

    reorderMilestones(goal.id, reordered.map((m) => m.id))
  }

  const getPriorityBadge = () => {
    switch (goal.priority) {
      case 'critical':
        return <Badge variant="danger" size="sm">Critical</Badge>
      case 'high':
        return <Badge variant="warning" size="sm">High Priority</Badge>
      case 'medium':
        return <Badge variant="default" size="sm">Medium</Badge>
      case 'low':
        return <Badge variant="outline" size="sm">Low</Badge>
    }
  }

  const getStatusBadge = () => {
    switch (goal.status) {
      case 'achieved':
        return <Badge variant="success" size="sm">Achieved</Badge>
      case 'paused':
        return <Badge variant="warning" size="sm">Paused</Badge>
      case 'abandoned':
        return <Badge variant="outline" size="sm">Abandoned</Badge>
      case 'in_progress':
        return <Badge variant="accent" size="sm">In Progress</Badge>
      case 'not_started':
        return <Badge variant="default" size="sm">Not Started</Badge>
    }
  }

  return (
    <div className="p-5 rounded-xl bg-bg-elevated/70 border border-border hover:border-white/[0.12] transition-colors flex flex-col gap-4 font-sans selection:bg-accent/20">
      {/* ── Card Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Life Area Badge */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.04] border border-border-subtle text-[11px] font-medium text-text-primary">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: lifeArea?.accentColor || '#D97706' }}
              aria-hidden="true"
            />
            <AreaIcon className="w-3 h-3 text-text-secondary" />
            <span className="truncate max-w-[120px]">{lifeArea?.name || 'Unassigned'}</span>
          </div>

          {getStatusBadge()}
          {getPriorityBadge()}
        </div>

        {/* Action Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-7 w-7 text-text-muted hover:text-text-primary"
              aria-label="Goal options"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="right">
            <DropdownMenuItem onClick={() => onEdit(goal)}>
              <Pencil className="w-3.5 h-3.5 mr-2" />
              <span>Edit Goal Parameters</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {goal.status === 'paused' ? (
              <DropdownMenuItem onClick={() => handleStatusChange('in_progress')}>
                <Play className="w-3.5 h-3.5 mr-2 text-status-success" />
                <span>Resume Goal</span>
              </DropdownMenuItem>
            ) : goal.status !== 'achieved' ? (
              <DropdownMenuItem onClick={() => handleStatusChange('paused')}>
                <Pause className="w-3.5 h-3.5 mr-2 text-status-warning" />
                <span>Pause Goal</span>
              </DropdownMenuItem>
            ) : null}

            {goal.status === 'achieved' ? (
              <DropdownMenuItem onClick={() => handleStatusChange('in_progress')}>
                <RotateCcw className="w-3.5 h-3.5 mr-2 text-accent" />
                <span>Reopen Goal</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => handleStatusChange('achieved')}>
                <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-status-success" />
                <span>Mark as Achieved</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Title & Description ── */}
      <div className="flex flex-col gap-1.5">
        <h3 className="font-semibold text-text-primary text-[15px] tracking-tight leading-snug">
          {goal.title}
        </h3>
        {goal.description && (
          <p className="text-[12.5px] text-text-secondary leading-relaxed line-clamp-2">
            {goal.description}
          </p>
        )}
      </div>

      {/* ── Target Date & Horizon ── */}
      {goal.targetDate && (
        <div className="flex items-center gap-1.5 text-[11.5px] text-text-muted">
          <Calendar className="w-3.5 h-3.5 text-accent" />
          <span>Target Horizon:</span>
          <span className="font-medium text-text-secondary">{goal.targetDate}</span>
        </div>
      )}

      {/* ── Progress Indicators ── */}
      <div className="flex flex-col gap-2.5 pt-1">
        {/* Milestone-completion progress (explicit user action) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] text-text-muted">
            <span>
              {milestoneProgress.totalMilestones === 0
                ? 'No milestones defined'
                : `${milestoneProgress.completedMilestones} of ${milestoneProgress.totalMilestones} milestones completed`}
            </span>
            {milestoneProgress.percent !== null && (
              <span className="font-mono text-text-secondary">{milestoneProgress.percent}%</span>
            )}
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{ width: `${milestoneProgress.percent ?? 0}%` }}
            />
          </div>
        </div>

        {/* Task-derived progress (operational activity — distinct from outcome achievement) */}
        {taskProgress.eligibleCount > 0 && (
          <div className="flex items-center justify-between text-[10.5px] text-text-muted">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent/50 inline-block" aria-hidden="true" />
              <span>
                {taskProgress.completedCount}/{taskProgress.eligibleCount} tasks done
              </span>
            </span>
            {taskProgress.percent !== null && (
              <span className="font-mono text-text-muted/70">{taskProgress.percent}% tasks</span>
            )}
          </div>
        )}
      </div>

      {/* ── Milestones Breakdown ── */}
      <div className="pt-2 border-t border-border-subtle flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setMilestonesExpanded(!milestonesExpanded)}
          className="flex items-center justify-between text-[12px] font-medium text-text-secondary hover:text-text-primary transition-colors py-0.5"
        >
          <div className="flex items-center gap-1.5">
            {milestonesExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
            <span>Verifiable Milestones ({milestoneProgress.totalMilestones})</span>
          </div>
        </button>

        {milestonesExpanded && (
          <div className="flex flex-col gap-2 pt-1">
            {goal.milestones.map((milestone, idx) => (
              <MilestoneItem
                key={milestone.id}
                milestone={milestone}
                goalId={goal.id}
                isFirst={idx === 0}
                isLast={idx === goal.milestones.length - 1}
                onMoveUp={() => handleMoveMilestone(idx, 'up')}
                onMoveDown={() => handleMoveMilestone(idx, 'down')}
              />
            ))}

            {/* Inline add milestone input */}
            <form onSubmit={handleAddMilestone} className="flex items-center gap-2 mt-1">
              <Input
                placeholder="Add milestone checkpoint..."
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                disabled={addingMilestone}
                className="h-8 text-xs flex-1"
              />
              <DatePicker
                value={newMilestoneDate}
                onChange={(d) => setNewMilestoneDate(d || '')}
                disabled={addingMilestone}
                placeholder="Target date..."
                className="w-36 text-xs"
              />
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                loading={addingMilestone}
                disabled={!newMilestoneTitle.trim()}
                className="h-8 px-2.5 text-xs gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
