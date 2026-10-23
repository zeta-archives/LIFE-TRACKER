import * as React from 'react'
import {
  Check,
  Calendar,
  Clock,
  Target,
  Pencil,
  AlertTriangle,
  Layers,
} from 'lucide-react'
import {
  useLifeAreas,
  useGoals,
  useTasks,
  type Task,
} from '@/data'
import { TaskPriorityBadge } from './TaskPriorityBadge'
import { formatHumanDate } from '@/components/ui'

interface TaskItemProps {
  task: Task
  onEdit: (task: Task) => void
}

export function TaskItem({ task, onEdit }: TaskItemProps) {
  const { lifeAreas } = useLifeAreas()
  const { goals } = useGoals()
  const { toggleTask } = useTasks()

  const isCompleted = task.status === 'completed'

  const lifeArea = lifeAreas.find((a) => a.id === task.lifeAreaId)
  const linkedGoal = task.goalId ? goals.find((g) => g.id === task.goalId) : null
  const linkedMilestone =
    linkedGoal && task.milestoneId
      ? linkedGoal.milestones.find((m) => m.id === task.milestoneId)
      : null

  // Check if overdue
  const isOverdue = React.useMemo(() => {
    if (!task.dueDate || isCompleted) return false
    const nowStr = new Date().toISOString().split('T')[0]
    return task.dueDate < nowStr
  }, [task.dueDate, isCompleted])

  const handleToggle = () => {
    toggleTask(task.id, task.status)
  }

  return (
    <div
      className={`group flex items-start justify-between p-3.5 rounded-xl border transition-all ${
        isCompleted
          ? 'bg-bg-base/30 border-border-subtle/50 text-text-muted opacity-75'
          : 'bg-bg-elevated/70 border-border hover:border-white/[0.14] text-text-primary shadow-xs'
      }`}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {/* Completion Checkbox */}
        <button
          type="button"
          onClick={handleToggle}
          aria-label={isCompleted ? `Mark "${task.title}" as incomplete` : `Mark "${task.title}" as completed`}
          className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
            isCompleted
              ? 'bg-status-success/20 border-status-success text-status-success'
              : 'border-border hover:border-accent text-transparent hover:text-accent/50'
          }`}
        >
          <Check className="w-3 h-3 stroke-[3]" />
        </button>

        {/* Content & Metadata */}
        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          {/* Title & Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-[13.5px] font-sans font-medium leading-snug break-words ${
                isCompleted ? 'line-through text-text-muted/70' : 'text-text-primary'
              }`}
            >
              {task.title}
            </span>

            <TaskPriorityBadge priority={task.priority} />
          </div>

          {/* Optional Description */}
          {task.description && (
            <p className="text-[12px] text-text-secondary leading-relaxed line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Context Line: Domain, Goal/Milestone, Deadline, Duration */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-muted pt-0.5">
            {/* Domain */}
            <span className="flex items-center gap-1.5 text-text-secondary font-medium">
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: lifeArea?.accentColor || '#D97706' }}
                aria-hidden="true"
              />
              <span className="truncate max-w-[100px]">{lifeArea?.name || 'Domain'}</span>
            </span>

            {/* Linked Goal */}
            {linkedGoal && (
              <span className="flex items-center gap-1 text-text-secondary/80 truncate max-w-[140px]" title={`Goal: ${linkedGoal.title}`}>
                <Target className="w-3 h-3 text-accent flex-shrink-0" />
                <span className="truncate">{linkedGoal.title}</span>
              </span>
            )}

            {/* Linked Milestone */}
            {linkedMilestone && (
              <span className="flex items-center gap-1 text-text-muted truncate max-w-[120px]" title={`Milestone: ${linkedMilestone.title}`}>
                <Layers className="w-2.5 h-2.5 opacity-60 flex-shrink-0" />
                <span className="truncate">{linkedMilestone.title}</span>
              </span>
            )}

            {/* Deadline / Due Date */}
            {task.dueDate && (
              <span
                className={`flex items-center gap-1 ${
                  isOverdue ? 'text-status-danger font-semibold' : 'text-text-secondary'
                }`}
                title={isOverdue ? 'Overdue deadline' : 'Deadline'}
              >
                {isOverdue ? (
                  <AlertTriangle className="w-3 h-3 text-status-danger flex-shrink-0" />
                ) : (
                  <Calendar className="w-3 h-3 text-accent flex-shrink-0" />
                )}
                <span>{formatHumanDate(task.dueDate)}</span>
              </span>
            )}

            {/* Estimated Duration */}
            {task.estimatedDurationMinutes && (
              <span className="flex items-center gap-1 text-text-muted">
                <Clock className="w-2.5 h-2.5 flex-shrink-0" />
                <span>{task.estimatedDurationMinutes}m</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action: Edit */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex-shrink-0 ml-2">
        <button
          type="button"
          onClick={() => onEdit(task)}
          title="Edit task parameters"
          aria-label={`Edit task ${task.title}`}
          className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
