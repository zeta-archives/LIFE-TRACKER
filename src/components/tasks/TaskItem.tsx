import * as React from 'react'
import {
  Check,
  Calendar,
  Clock,
  Target,
  Pencil,
  AlertTriangle,
  Layers,
  ArrowRight,
  ChevronDown,
  CalendarDays,
} from 'lucide-react'
import {
  useLifeAreas,
  useGoals,
  useTasks,
  type Task,
  type TaskPriorityCategory,
} from '@/data'
import { TaskPriorityBadge } from './TaskPriorityBadge'
import {
  formatHumanDate,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui'

interface TaskItemProps {
  task: Task
  onEdit: (task: Task) => void
}

export function TaskItem({ task, onEdit }: TaskItemProps) {
  const { lifeAreas } = useLifeAreas()
  const { goals } = useGoals()
  const { toggleTask, updateTask } = useTasks()

  const isCompleted = task.status === 'completed'

  const lifeArea = lifeAreas.find((a) => a.id === task.lifeAreaId)
  const linkedGoal = task.goalId ? goals.find((g) => g.id === task.goalId) : null
  const linkedMilestone =
    linkedGoal && task.milestoneId
      ? linkedGoal.milestones.find((m) => m.id === task.milestoneId)
      : null

  // Date constants for quick daily planning
  const todayStr = React.useMemo(() => new Date().toISOString().split('T')[0], [])
  const tomorrowStr = React.useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  }, [])
  const nextWeekStr = React.useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    return d.toISOString().split('T')[0]
  }, [])

  // Check if overdue
  const isOverdue = React.useMemo(() => {
    if (!task.dueDate || isCompleted) return false
    return task.dueDate < todayStr
  }, [task.dueDate, isCompleted, todayStr])

  const handleToggle = () => {
    toggleTask(task.id, task.status)
  }

  const handlePriorityChange = async (newPriority: TaskPriorityCategory) => {
    if (newPriority === task.priority) return
    await updateTask({
      id: task.id,
      priority: newPriority,
    })
  }

  const handleReschedule = async (date: string | null) => {
    await updateTask({
      id: task.id,
      scheduledDate: date,
    })
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
          aria-label={
            isCompleted
              ? `Mark "${task.title}" as incomplete`
              : `Mark "${task.title}" as completed`
          }
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
          {/* Title & Priority Dropdown Trigger */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-[13.5px] font-sans font-medium leading-snug break-words ${
                isCompleted ? 'line-through text-text-muted/70' : 'text-text-primary'
              }`}
            >
              {task.title}
            </span>

            {/* Quick Priority Switcher Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded">
                <span className="flex items-center gap-0.5 cursor-pointer hover:opacity-85 transition-opacity" title="Change priority tier">
                  <TaskPriorityBadge priority={task.priority} />
                  <ChevronDown className="w-2.5 h-2.5 opacity-50" />
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="left" className="w-44 text-xs">
                <div className="px-2 py-1 text-[10.5px] text-text-muted font-medium uppercase tracking-wider">
                  Organize Priority
                </div>
                <DropdownMenuItem onClick={() => handlePriorityChange('must_happen')}>
                  <span className="w-2 h-2 rounded-full bg-status-danger mr-2" />
                  <span>1. Must Happen</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePriorityChange('should_happen')}>
                  <span className="w-2 h-2 rounded-full bg-accent mr-2" />
                  <span>2. Should Happen</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePriorityChange('could_happen')}>
                  <span className="w-2 h-2 rounded-full bg-text-muted mr-2" />
                  <span>3. Could Happen</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Scheduled Status Pill */}
            {task.scheduledDate && (
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  task.scheduledDate === todayStr
                    ? 'bg-accent/10 border-accent/30 text-accent font-medium'
                    : 'bg-white/[0.03] border-border-subtle text-text-muted'
                }`}
              >
                {task.scheduledDate === todayStr
                  ? '⚡ Today'
                  : task.scheduledDate === tomorrowStr
                    ? '🗓️ Tomorrow'
                    : `🗓️ ${task.scheduledDate}`}
              </span>
            )}
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
              <span
                className="flex items-center gap-1 text-text-secondary/80 truncate max-w-[140px]"
                title={`Goal: ${linkedGoal.title}`}
              >
                <Target className="w-3 h-3 text-accent flex-shrink-0" />
                <span className="truncate">{linkedGoal.title}</span>
              </span>
            )}

            {/* Linked Milestone */}
            {linkedMilestone && (
              <span
                className="flex items-center gap-1 text-text-muted truncate max-w-[120px]"
                title={`Milestone: ${linkedMilestone.title}`}
              >
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
              <span className="flex items-center gap-1 text-text-muted font-mono">
                <Clock className="w-2.5 h-2.5 flex-shrink-0" />
                <span>{task.estimatedDurationMinutes}m</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Planning Actions: Reschedule & Edit */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex-shrink-0 ml-2">
        {/* Quick Reschedule Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="p-1 rounded text-text-muted hover:text-accent hover:bg-white/[0.06] transition-colors">
            <span title="Quick Reschedule task" className="flex items-center">
              <CalendarDays className="w-3.5 h-3.5" />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="right" className="w-48 text-xs font-sans">
            <div className="px-2 py-1 text-[10.5px] text-text-muted font-medium uppercase tracking-wider">
              Reschedule Task
            </div>
            <DropdownMenuItem onClick={() => handleReschedule(todayStr)}>
              <span className="text-accent font-medium mr-2">⚡</span>
              <span>Plan for Today</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleReschedule(tomorrowStr)}>
              <ArrowRight className="w-3 h-3 text-text-muted mr-2" />
              <span>Move to Tomorrow</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleReschedule(nextWeekStr)}>
              <Calendar className="w-3 h-3 text-text-muted mr-2" />
              <span>Postpone +7 Days</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleReschedule(null)}>
              <span className="text-text-muted mr-2">∅</span>
              <span>Clear Date (Backlog)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Full Edit Modal */}
        <button
          type="button"
          onClick={() => onEdit(task)}
          title="Edit full task parameters"
          aria-label={`Edit task ${task.title}`}
          className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
