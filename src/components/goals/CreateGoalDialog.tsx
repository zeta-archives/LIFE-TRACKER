import * as React from 'react'
import { Target } from 'lucide-react'
import { useLifeAreas, useGoals, type GoalPriority } from '@/data'
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

interface CreateGoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultLifeAreaId?: string
}

export function CreateGoalDialog({
  open,
  onOpenChange,
  defaultLifeAreaId,
}: CreateGoalDialogProps) {
  const { lifeAreas } = useLifeAreas()
  const { createGoal } = useGoals()

  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [lifeAreaId, setLifeAreaId] = React.useState('')
  const [targetDate, setTargetDate] = React.useState('')
  const [priority, setPriority] = React.useState<GoalPriority>('medium')
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      setTitle('')
      setDescription('')
      setTargetDate('')
      setPriority('medium')
      setError(null)
      if (defaultLifeAreaId) {
        setLifeAreaId(defaultLifeAreaId)
      } else if (lifeAreas.length > 0) {
        setLifeAreaId(lifeAreas[0].id)
      }
    }
  }, [open, defaultLifeAreaId, lifeAreas])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!lifeAreaId) {
      setError('Please select a life area for this goal.')
      return
    }

    setSubmitting(true)

    const res = await createGoal({
      title,
      description: description || null,
      lifeAreaId,
      targetDate: targetDate || null,
      priority,
      status: 'in_progress',
    })

    setSubmitting(false)

    if (!res.success) {
      setError(res.error || 'Failed to create goal.')
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
            <Target className="w-5 h-5 text-accent" />
            <DialogTitle>Create New Goal</DialogTitle>
          </div>
          <DialogDescription>
            Establish a meaningful outcome anchored to one of your active life domains.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 flex flex-col gap-4 font-sans">
          {error && <Alert variant="danger">{error}</Alert>}

          <FormField id="goal-title" label="Goal Title" required>
            <Input
              placeholder="e.g. Publish Computer Vision Conference Paper"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={submitting}
              autoFocus
            />
          </FormField>

          <FormField id="goal-life-area" label="Life Domain" required>
            <Select
              id="goal-life-area"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField id="goal-priority" label="Priority Level">
              <Select
                id="goal-priority"
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

            <FormField id="goal-target-date" label="Target Completion Date">
              <DatePicker
                id="goal-target-date"
                value={targetDate}
                onChange={(d) => setTargetDate(d || '')}
                disabled={submitting}
                placeholder="Select target date..."
              />
            </FormField>
          </div>

          <FormField id="goal-description" label="Description & Intent (Optional)">
            <Textarea
              placeholder="Clarify why this goal matters, key constraints, and expected deliverables..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              rows={3}
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
            Create Goal
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
