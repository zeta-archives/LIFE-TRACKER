import * as React from 'react'
import { Trash2 } from 'lucide-react'
import { useLifeAreas, useGoals, type Goal, type GoalPriority, type GoalStatus } from '@/data'
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

interface EditGoalDialogProps {
  goal: Goal | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditGoalDialog({
  goal,
  open,
  onOpenChange,
}: EditGoalDialogProps) {
  const { lifeAreas } = useLifeAreas()
  const { updateGoal, deleteGoal } = useGoals()

  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [lifeAreaId, setLifeAreaId] = React.useState('')
  const [targetDate, setTargetDate] = React.useState('')
  const [priority, setPriority] = React.useState<GoalPriority>('medium')
  const [status, setStatus] = React.useState<GoalStatus>('in_progress')
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false)

  React.useEffect(() => {
    if (goal) {
      setTitle(goal.title)
      setDescription(goal.description || '')
      setLifeAreaId(goal.lifeAreaId)
      setTargetDate(goal.targetDate || '')
      setPriority(goal.priority)
      setStatus(goal.status)
      setError(null)
    }
  }, [goal])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!goal) return

    setError(null)
    setSubmitting(true)

    const res = await updateGoal({
      id: goal.id,
      title,
      description: description || null,
      lifeAreaId,
      targetDate: targetDate || null,
      priority,
      status,
    })

    setSubmitting(false)

    if (!res.success) {
      setError(res.error || 'Failed to update goal.')
    } else {
      onOpenChange(false)
    }
  }

  const handleDelete = async () => {
    if (!goal) return
    setSubmitting(true)
    const res = await deleteGoal(goal.id)
    setSubmitting(false)

    if (!res.success) {
      setError(res.error || 'Failed to delete goal.')
    } else {
      setConfirmDeleteOpen(false)
      onOpenChange(false)
    }
  }

  if (!goal) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogCloseButton onClose={() => onOpenChange(false)} />
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
            <DialogDescription>
              Update goal parameters, status progression, or life domain association.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 flex flex-col gap-4 font-sans">
            {error && <Alert variant="danger">{error}</Alert>}

            <FormField id="edit-goal-title" label="Goal Title" required>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={submitting}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField id="edit-goal-life-area" label="Life Domain" required>
                <Select
                  id="edit-goal-life-area"
                  value={lifeAreaId}
                  onChange={(e) => setLifeAreaId(e.target.value)}
                  disabled={submitting}
                >
                  {lifeAreas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField id="edit-goal-status" label="Goal Status">
                <Select
                  id="edit-goal-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as GoalStatus)}
                  disabled={submitting}
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="paused">Paused</option>
                  <option value="achieved">Achieved / Completed</option>
                  <option value="abandoned">Abandoned</option>
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField id="edit-goal-priority" label="Priority Level">
                <Select
                  id="edit-goal-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as GoalPriority)}
                  disabled={submitting}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </Select>
              </FormField>

              <FormField id="edit-goal-target-date" label="Target Completion Date">
                <DatePicker
                  id="edit-goal-target-date"
                  value={targetDate}
                  onChange={(d) => setTargetDate(d || '')}
                  disabled={submitting}
                  placeholder="Select target date..."
                />
              </FormField>
            </div>

            <FormField id="edit-goal-description" label="Description & Intent">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
                rows={3}
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
                <span>Delete Goal</span>
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
        title={`Delete "${goal.title}"?`}
        description="Deleting this goal will permanently remove it along with all associated milestones from your database. This action cannot be undone."
        confirmText="Permanently Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  )
}
