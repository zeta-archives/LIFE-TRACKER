import * as React from 'react'
import { CheckSquare } from 'lucide-react'
import {
  useLifeAreas,
  useGoals,
  useTasks,
  type TaskPriorityCategory,
} from '@/data'
import {
  Button,
  Input,
  Textarea,
  Select,
  FormField,
  DatePicker,
  Alert,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogCloseButton,
} from '@/components/ui'

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultLifeAreaId?: string
  defaultGoalId?: string
  defaultMilestoneId?: string
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  defaultLifeAreaId,
  defaultGoalId,
  defaultMilestoneId,
}: CreateTaskDialogProps) {
  const { lifeAreas } = useLifeAreas()
  const { goals } = useGoals()
  const { createTask } = useTasks()

  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [lifeAreaId, setLifeAreaId] = React.useState('')
  const [goalId, setGoalId] = React.useState('')
  const [milestoneId, setMilestoneId] = React.useState('')
  const [priority, setPriority] = React.useState<TaskPriorityCategory>('should_happen')
  const [dueDate, setDueDate] = React.useState<string | null>(null)
  const [estimatedDuration, setEstimatedDuration] = React.useState<number | null>(30)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setTitle('')
      setDescription('')
      setError(null)
      setPriority('should_happen')
      setDueDate(null)
      setEstimatedDuration(30)

      const initialAreaId =
        defaultLifeAreaId || (lifeAreas.length > 0 ? lifeAreas[0].id : '')
      setLifeAreaId(initialAreaId)
      setGoalId(defaultGoalId || '')
      setMilestoneId(defaultMilestoneId || '')
    }
  }, [open, defaultLifeAreaId, defaultGoalId, defaultMilestoneId, lifeAreas])

  // Filter available goals based on selected Life Area
  const availableGoals = React.useMemo(() => {
    if (!lifeAreaId) return []
    return goals.filter((g) => g.lifeAreaId === lifeAreaId && g.status !== 'achieved')
  }, [goals, lifeAreaId])

  // Filter available milestones based on selected Goal
  const availableMilestones = React.useMemo(() => {
    if (!goalId) return []
    const selectedGoal = goals.find((g) => g.id === goalId)
    return selectedGoal?.milestones.filter((m) => m.status === 'pending') || []
  }, [goals, goalId])

  // Reset goal/milestone if life area changes and current goal does not belong to it
  const handleLifeAreaChange = (newAreaId: string) => {
    setLifeAreaId(newAreaId)
    setGoalId('')
    setMilestoneId('')
  }

  const handleGoalChange = (newGoalId: string) => {
    setGoalId(newGoalId)
    setMilestoneId('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!lifeAreaId) {
      setError('Please select a life domain for this task.')
      return
    }

    setSubmitting(true)

    const res = await createTask({
      title,
      description: description || null,
      lifeAreaId,
      goalId: goalId || null,
      milestoneId: milestoneId || null,
      priority,
      dueDate,
      estimatedDurationMinutes: estimatedDuration ? Number(estimatedDuration) : null,
      status: 'todo',
    })

    setSubmitting(false)

    if (!res.success) {
      setError(res.error || 'Failed to create task.')
    } else {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogCloseButton onClose={() => onOpenChange(false)} />
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-accent" />
            <DialogTitle>Add New Task</DialogTitle>
          </div>
          <DialogDescription>
            Create an actionable unit of work anchored to your life domains and goals.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 flex flex-col gap-4 font-sans">
          {error && <Alert variant="danger">{error}</Alert>}

          <FormField id="task-title" label="Task Title" required>
            <Input
              placeholder="e.g. Write methodology section for research draft"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={submitting}
              autoFocus
            />
          </FormField>

          {/* Domain & Goal Relationship Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField id="task-life-area" label="Life Domain" required>
              <Select
                id="task-life-area"
                value={lifeAreaId}
                onChange={(e) => handleLifeAreaChange(e.target.value)}
                disabled={submitting}
              >
                {lifeAreas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField id="task-goal" label="Linked Goal (Optional)">
              <Select
                id="task-goal"
                value={goalId}
                onChange={(e) => handleGoalChange(e.target.value)}
                disabled={submitting || availableGoals.length === 0}
              >
                <option value="">None (Independent Task)</option>
                {availableGoals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          {/* Linked Milestone (if goal selected) */}
          {goalId && availableMilestones.length > 0 && (
            <FormField id="task-milestone" label="Target Milestone Checkpoint (Optional)">
              <Select
                id="task-milestone"
                value={milestoneId}
                onChange={(e) => setMilestoneId(e.target.value)}
                disabled={submitting}
              >
                <option value="">None (Supports Goal Directly)</option>
                {availableMilestones.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </Select>
            </FormField>
          )}

          {/* Three Priority Categories */}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-medium text-text-secondary">
              Priority Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPriority('must_happen')}
                disabled={submitting}
                className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                  priority === 'must_happen'
                    ? 'bg-status-danger/15 border-status-danger text-status-danger ring-1 ring-status-danger/40'
                    : 'bg-bg-base/40 border-border-subtle text-text-secondary hover:border-white/[0.14]'
                }`}
              >
                <span className="text-[11.5px] font-semibold">1. Must happen</span>
                <span className="text-[10px] text-text-muted">Essential, non-negotiable</span>
              </button>

              <button
                type="button"
                onClick={() => setPriority('should_happen')}
                disabled={submitting}
                className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                  priority === 'should_happen'
                    ? 'bg-accent/15 border-accent text-accent ring-1 ring-accent/40'
                    : 'bg-bg-base/40 border-border-subtle text-text-secondary hover:border-white/[0.14]'
                }`}
              >
                <span className="text-[11.5px] font-semibold">2. Should happen</span>
                <span className="text-[10px] text-text-muted">Important, high leverage</span>
              </button>

              <button
                type="button"
                onClick={() => setPriority('could_happen')}
                disabled={submitting}
                className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                  priority === 'could_happen'
                    ? 'bg-white/[0.08] border-white/30 text-text-primary ring-1 ring-white/20'
                    : 'bg-bg-base/40 border-border-subtle text-text-secondary hover:border-white/[0.14]'
                }`}
              >
                <span className="text-[11.5px] font-semibold">3. Could happen</span>
                <span className="text-[10px] text-text-muted">Optional when capacity allows</span>
              </button>
            </div>
          </div>

          {/* Due Date & Estimated Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField id="task-due-date" label="Deadline / Due Date">
              <DatePicker
                id="task-due-date"
                value={dueDate}
                onChange={setDueDate}
                disabled={submitting}
                placeholder="Select deadline..."
              />
            </FormField>

            <FormField id="task-duration" label="Estimated Duration (Minutes)">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={5}
                  max={480}
                  step={5}
                  value={estimatedDuration || ''}
                  onChange={(e) =>
                    setEstimatedDuration(e.target.value ? parseInt(e.target.value, 10) : null)
                  }
                  disabled={submitting}
                  placeholder="e.g. 45"
                />
                <div className="flex items-center gap-1 flex-shrink-0">
                  {[25, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setEstimatedDuration(mins)}
                      className="px-2 py-1 rounded bg-white/[0.04] border border-border-subtle text-[11px] text-text-muted hover:text-text-primary hover:bg-white/[0.08] transition-colors"
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
            </FormField>
          </div>

          <FormField id="task-description" label="Notes & Constraints (Optional)">
            <Textarea
              placeholder="Additional context, sub-items, or submission links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              rows={2}
            />
          </FormField>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={submitting}>
            Create Task
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
