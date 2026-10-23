import * as React from 'react'
import { Archive, Trash2 } from 'lucide-react'
import { useLifeAreas, type LifeArea } from '@/data'
import {
  Button,
  Input,
  FormField,
  Alert,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogCloseButton,
  ConfirmationDialog,
} from '@/components/ui'
import {
  COLOR_OPTIONS,
  ICON_OPTIONS,
} from './CreateLifeAreaDialog'

interface EditLifeAreaDialogProps {
  area: LifeArea | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditLifeAreaDialog({
  area,
  open,
  onOpenChange,
}: EditLifeAreaDialogProps) {
  const { updateArea, archiveArea, deleteArea } = useLifeAreas()

  const [name, setName] = React.useState('')
  const [color, setColor] = React.useState('')
  const [icon, setIcon] = React.useState('')
  const [priority, setPriority] = React.useState(5)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Sub-dialogs
  const [confirmArchiveOpen, setConfirmArchiveOpen] = React.useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false)

  React.useEffect(() => {
    if (area) {
      setName(area.name)
      setColor(area.accentColor)
      setIcon(area.iconName)
      setPriority(area.priorityWeight)
      setError(null)
    }
  }, [area])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!area) return

    setError(null)
    setSubmitting(true)

    const res = await updateArea({
      id: area.id,
      name,
      accentColor: color,
      iconName: icon,
      priorityWeight: priority,
    })

    setSubmitting(false)

    if (!res.success) {
      setError(res.error || 'Failed to update life area.')
    } else {
      onOpenChange(false)
    }
  }

  const handleArchive = async () => {
    if (!area) return
    setSubmitting(true)
    const res = await archiveArea(area.id)
    setSubmitting(false)
    if (!res.success) {
      setError(res.error || 'Failed to archive life area.')
    } else {
      setConfirmArchiveOpen(false)
      onOpenChange(false)
    }
  }

  const handleDelete = async () => {
    if (!area) return
    setSubmitting(true)
    const res = await deleteArea(area.id)
    setSubmitting(false)
    if (!res.success) {
      setError(res.error || 'Failed to delete life area.')
    } else {
      setConfirmDeleteOpen(false)
      onOpenChange(false)
    }
  }

  if (!area) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogCloseButton onClose={() => onOpenChange(false)} />
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Life Area</DialogTitle>
            <DialogDescription>
              Configure name, icon, accent color, and scheduling priority for &ldquo;{area.name}&rdquo;.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 flex flex-col gap-4 font-sans">
            {error && <Alert variant="danger">{error}</Alert>}

            <FormField id="edit-area-name" label="Domain Name" required>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={submitting}
              />
            </FormField>

            <FormField
              id="edit-area-priority"
              label="Priority Weight (1–10)"
              helperText="1 is highest scheduling priority; 10 is lowest"
            >
              <Input
                type="number"
                min={1}
                max={10}
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value, 10) || 5)}
                disabled={submitting}
              />
            </FormField>

            {/* Color Swatches */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-medium text-text-secondary">
                Accent Color
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      color === c.hex
                        ? 'border-accent scale-110 shadow-md ring-2 ring-accent/30'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            {/* Icon Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-medium text-text-secondary">
                Icon
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1.5 border border-border-subtle rounded-md bg-bg-base/40">
                {ICON_OPTIONS.map((opt) => {
                  const Icon = opt.icon
                  const selected = icon === opt.name
                  return (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setIcon(opt.name)}
                      className={`p-2 rounded flex flex-col items-center gap-1 text-[10px] transition-colors ${
                        selected
                          ? 'bg-accent/20 border border-accent text-accent font-medium'
                          : 'text-text-muted hover:text-text-primary hover:bg-white/[0.04]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="truncate max-w-[45px]">{opt.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Secondary actions: Archive & Delete */}
            <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setConfirmArchiveOpen(true)}
                disabled={submitting}
                className="gap-1.5 text-text-secondary hover:text-text-primary text-[12px]"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Archive Area</span>
              </Button>

              {!area.isSystemDefault && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDeleteOpen(true)}
                  disabled={submitting}
                  className="gap-1.5 text-text-muted hover:text-status-danger text-[12px]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </Button>
              )}
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

      {/* Archive Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmArchiveOpen}
        onOpenChange={setConfirmArchiveOpen}
        title={`Archive "${area.name}"?`}
        description="Archiving this life area will hide it from active sidebar navigation, but will preserve all historical goals, tasks, and sessions. You can restore it at any time from Archived Areas."
        confirmText="Archive Life Area"
        variant="primary"
        onConfirm={handleArchive}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title={`Permanently delete "${area.name}"?`}
        description="This will permanently delete this custom life area from your backend. If you only want to hide it, choose Archive instead."
        confirmText="Permanently Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  )
}
