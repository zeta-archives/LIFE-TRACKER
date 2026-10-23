import * as React from 'react'
import { Trash2 } from 'lucide-react'
import {
  useLifeAreas,
  useGoals,
  useTasks,
  type Task,
  type TaskPriorityCategory,
  type TaskStatus,
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
  ConfirmationDialog,
} from '@/components/ui'

interface EditTaskDialogProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTaskDialog({
  task,
  open,
  onOpenChange,
}: EditTaskDialogProps) {
  const { lifeAreas } = useLifeAreas()
  const { goals } = useGoals()
  const { updateTask, deleteTask } = useTasks()

  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [lifeAreaId, setLifeAreaId] = React.useState('')
  const [goalId, setGoalId] = React.useState('')
  const [milestoneId, setMilestoneId] = React.useState('')
  const [priority, setPriority] = React.useState<TaskPriorityCategory>('should_happen')
  const [status, setStatus] = React.useState<TaskStatus>('todo')
  const [dueDate, setDueDate] = React.useState<string | null>(null)
  const [estimatedDuration, setEstimatedDuration] = React.useState<number | null>(30)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false)

  React.useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setLifeAreaId(task.lifeAreaId)
      setGoalId(task.goalId || '')
      setMilestoneId(task.milestoneId || '')
      setPriority(task.priority)
      setStatus(task.status)
      setDueDate(task.dueDate)
      setEstimatedDuration(task.estimatedDurationMinutes)
      setError(null)
    }
  }, [task])

  const availableGoals = React.useMemo(() => {
    if (!lifeAreaId) return []
    return goals.filter((g) => g.lifeAreaId === lifeAreaId)
  }, [goals, lifeAreaId])

  const availableMilestones = React.useMemo(() => {
    if (!goalId) return []
    const selectedGoal = goals.find((g) => g.id === goalId)
    return selectedGoal?.milestones || []
  }, [goals, goalId])

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
    if (!task) return

    setError(null)
    setSubmitting(true)

    const res = await updateTask({
      id: task.id,
      title,
      description: description || null,
      lifeAreaId,
      goalId: goalId || null,
      milestoneId: milestoneId || null,
      priority,
      status,
      dueDate,
      estimatedDurationMinutes: estimatedDuration ? Number(estimatedDuration) : null,
    })

    setSubmitting(false)

    if (!res.success) {
      setError(res.error || 'Failed to update task.')
    } else {
      onOpenChange(false)
    }
  }

  const handleDelete = async () => {
    if (!task) return
    setSubmitting(true)
    const res = await deleteTask(task.id)
    setSubmitting(false)

    if (!res.success) {
      setError(res.error || 'Failed to delete task.')
    } else {
      setConfirmDeleteOpen(false)
      onOpenChange(false)
    }
  }

  if (!task) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogCloseButton onClose={() => onOpenChange(false)} />
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Modify task requirements, scheduling priority, or life domain linkage.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 flex flex-col gap-4 font-sans">
            {error && <Alert variant="danger">{error}</Alert>}

            <FormField id="edit-task-title" label="Task Title" required>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={submitting}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField id="edit-task-life-area" label="Life Domain" required>
                <Select
                  id="edit-task-life-area"
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

              <FormField id="edit-task-status" label="Status">
                <Select
                  id="edit-task-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  disabled={submitting}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField id="edit-task-goal" label="Linked Goal (Optional)">
                <Select
                  id="edit-task-goal"
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

              <FormField id="edit-task-milestone" label="Target Milestone (Optional)">
                <Select
                  id="edit-task-milestone"
                  value={milestoneId}
                  onChange={(e) => setMilestoneId(e.target.value)}
                  disabled={submitting || !goalId || availableMilestones.length === 0}
                >
                  <option value="">None</option>
                  {availableMilestones.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField id="edit-task-due-date" label="Deadline / Due Date">
                <DatePicker
                  id="edit-task-due-date"
                  value={dueDate}
                  onChange={setDueDate}
                  disabled={submitting}
                  placeholder="Select deadline..."
                />
              </FormField>

              <FormField id="edit-task-duration" label="Estimated Duration (Minutes)">
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
                />
              </FormField>
            </div>

            <FormField id="edit-task-description" label="Notes & Constraints">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
                rows={2}
              />
            </FormField>

            <div className="pt-2 border-t border-border-subtle flex justify-start">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDeleteOpen(true)}
                disabled={submitting}
                className="text-text-muted hover:text-status-danger text-[12px] gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Task</span>
              </Button>
            </div>
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
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      <ConfirmationDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title={`Delete "${task.title}"?`}
        description="Are you sure you want to permanently remove this task? This action cannot be undone."
        confirmText="Permanently Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  )
}
