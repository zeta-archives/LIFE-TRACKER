import * as React from 'react'
import {
  Check,
  ChevronUp,
  ChevronDown,
  Trash2,
  Calendar,
  Pencil,
} from 'lucide-react'
import { useGoals, type Milestone } from '@/data'
import { Input, Button, DatePicker } from '@/components/ui'

interface MilestoneItemProps {
  milestone: Milestone
  goalId: string
  isFirst: boolean
  isLast: boolean
  onMoveUp: () => void
  onMoveDown: () => void
}

export function MilestoneItem({
  milestone,
  goalId,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
}: MilestoneItemProps) {
  const { toggleMilestone, updateMilestone, deleteMilestone } = useGoals()
  const isCompleted = milestone.status === 'completed'

  const [isEditing, setIsEditing] = React.useState(false)
  const [editTitle, setEditTitle] = React.useState(milestone.title)
  const [editDate, setEditDate] = React.useState(milestone.targetDate || '')
  const [submitting, setSubmitting] = React.useState(false)

  const handleToggle = () => {
    toggleMilestone(goalId, milestone.id, milestone.status)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTitle.trim()) return

    setSubmitting(true)
    const res = await updateMilestone({
      id: milestone.id,
      title: editTitle.trim(),
      targetDate: editDate || null,
    })
    setSubmitting(false)

    if (res.success) {
      setIsEditing(false)
    }
  }

  const handleDelete = () => {
    deleteMilestone(goalId, milestone.id)
  }

  if (isEditing) {
    return (
      <form
        onSubmit={handleSaveEdit}
        className="p-2.5 rounded-lg bg-bg-base border border-accent/30 flex flex-col gap-2 font-sans"
      >
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="Milestone title"
          autoFocus
          disabled={submitting}
        />
        <div className="flex items-center justify-between gap-2">
          <DatePicker
            value={editDate}
            onChange={(d) => setEditDate(d || '')}
            disabled={submitting}
            placeholder="Target date..."
            className="w-44 text-xs"
          />
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              Save
            </Button>
          </div>
        </div>
      </form>
    )
  }

  return (
    <div
      className={`group flex items-center justify-between p-2.5 rounded-lg transition-colors border ${
        isCompleted
          ? 'bg-bg-base/30 border-border-subtle/50 text-text-muted'
          : 'bg-bg-base/60 border-border-subtle hover:border-white/[0.12] text-text-primary'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Toggle completion button */}
        <button
          type="button"
          onClick={handleToggle}
          aria-label={isCompleted ? 'Mark milestone as pending' : 'Mark milestone as completed'}
          className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
            isCompleted
              ? 'bg-status-success/20 border-status-success text-status-success'
              : 'border-border hover:border-accent text-transparent hover:text-accent/50'
          }`}
        >
          <Check className="w-3 h-3 stroke-[3]" />
        </button>

        {/* Title and metadata */}
        <div className="flex flex-col min-w-0 flex-1">
          <span
            className={`text-[12.5px] font-sans truncate ${
              isCompleted ? 'line-through text-text-muted/70' : 'text-text-primary'
            }`}
          >
            {milestone.title}
          </span>
          {milestone.targetDate && (
            <span className="text-[10.5px] text-text-muted flex items-center gap-1 mt-0.5">
              <Calendar className="w-2.5 h-2.5" />
              <span>Target: {milestone.targetDate}</span>
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex-shrink-0">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          title="Move up"
          aria-label="Move milestone up"
          className="p-1 rounded text-text-muted hover:text-text-primary disabled:opacity-20 disabled:hover:text-text-muted transition-colors"
        >
          <ChevronUp className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          title="Move down"
          aria-label="Move milestone down"
          className="p-1 rounded text-text-muted hover:text-text-primary disabled:opacity-20 disabled:hover:text-text-muted transition-colors"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => {
            setEditTitle(milestone.title)
            setEditDate(milestone.targetDate || '')
            setIsEditing(true)
          }}
          title="Edit milestone"
          aria-label="Edit milestone"
          className="p-1 rounded text-text-muted hover:text-text-primary transition-colors"
        >
          <Pencil className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          title="Delete milestone"
          aria-label="Delete milestone"
          className="p-1 rounded text-text-muted hover:text-status-danger transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
