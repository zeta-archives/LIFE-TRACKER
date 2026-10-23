/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'
import { createRoute } from '@tanstack/react-router'
import {
  Settings,
  Plus,
  Pencil,
  Trash2,
  Layers,
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
  RefreshCw,
  type LucideIcon,
} from 'lucide-react'
import { shellRoute } from './shell'
import { useLifeAreas, type LifeArea } from '@/data'
import {
  Button,
  Input,
  FormField,
  Badge,
  Alert,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogCloseButton,
  ConfirmationDialog,
  Skeleton,
  Tooltip,
} from '@/components/ui'

const ICON_OPTIONS: { name: string; icon: LucideIcon; label: string }[] = [
  { name: 'GraduationCap', icon: GraduationCap, label: 'Academic' },
  { name: 'Activity', icon: Activity, label: 'Health' },
  { name: 'Briefcase', icon: Briefcase, label: 'Career' },
  { name: 'Moon', icon: Moon, label: 'Rest' },
  { name: 'Users', icon: Users, label: 'Social' },
  { name: 'Smile', icon: Smile, label: 'Personal' },
  { name: 'Sparkles', icon: Sparkles, label: 'Inspiration' },
  { name: 'BookOpen', icon: BookOpen, label: 'Reading' },
  { name: 'Heart', icon: Heart, label: 'Wellness' },
  { name: 'Palette', icon: Palette, label: 'Creative' },
  { name: 'Compass', icon: Compass, label: 'Life Vision' },
  { name: 'Code', icon: Code, label: 'Technical' },
  { name: 'Dumbbell', icon: Dumbbell, label: 'Fitness' },
  { name: 'Music', icon: Music, label: 'Arts' },
  { name: 'Globe', icon: Globe, label: 'Exploration' },
  { name: 'Layers', icon: Layers, label: 'General' },
]

const COLOR_OPTIONS = [
  { hex: '#4A90E2', label: 'Blue' },
  { hex: '#4EAC7A', label: 'Green' },
  { hex: '#9B51E0', label: 'Purple' },
  { hex: '#5C6BC0', label: 'Indigo' },
  { hex: '#E05675', label: 'Rose' },
  { hex: '#26A69A', label: 'Teal' },
  { hex: '#D97706', label: 'Amber' },
  { hex: '#EC4899', label: 'Pink' },
  { hex: '#06B6D4', label: 'Cyan' },
  { hex: '#F97316', label: 'Orange' },
]

const iconMap: Record<string, LucideIcon> = Object.fromEntries(
  ICON_OPTIONS.map((item) => [item.name, item.icon]),
)

export function SettingsPage() {
  const {
    lifeAreas,
    isLoading,
    error: loadError,
    refetch,
    createArea,
    updateArea,
    deleteArea,
  } = useLifeAreas()

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [editingArea, setEditingArea] = React.useState<LifeArea | null>(null)
  const [areaToDelete, setAreaToDelete] = React.useState<LifeArea | null>(null)

  // Create form state
  const [newName, setNewName] = React.useState('')
  const [newColor, setNewColor] = React.useState(COLOR_OPTIONS[6].hex) // Amber
  const [newIcon, setNewIcon] = React.useState('Layers')
  const [newPriority, setNewPriority] = React.useState(5)
  const [createSubmitting, setCreateSubmitting] = React.useState(false)
  const [createError, setCreateError] = React.useState<string | null>(null)

  // Edit form state
  const [editName, setEditName] = React.useState('')
  const [editColor, setEditColor] = React.useState('')
  const [editIcon, setEditIcon] = React.useState('')
  const [editPriority, setEditPriority] = React.useState(5)
  const [editSubmitting, setEditSubmitting] = React.useState(false)
  const [editError, setEditError] = React.useState<string | null>(null)

  // Success message
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)

  const handleOpenEdit = (area: LifeArea) => {
    setEditingArea(area)
    setEditName(area.name)
    setEditColor(area.accentColor)
    setEditIcon(area.iconName)
    setEditPriority(area.priorityWeight)
    setEditError(null)
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError(null)
    setCreateSubmitting(true)

    const res = await createArea({
      name: newName,
      accentColor: newColor,
      iconName: newIcon,
      priorityWeight: newPriority,
    })

    setCreateSubmitting(false)

    if (!res.success) {
      setCreateError(res.error || 'Failed to create life area.')
    } else {
      setSuccessMessage(`Life area "${newName}" successfully created and saved to database.`)
      setNewName('')
      setNewColor(COLOR_OPTIONS[6].hex)
      setNewIcon('Layers')
      setNewPriority(5)
      setCreateDialogOpen(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingArea) return

    setEditError(null)
    setEditSubmitting(true)

    const res = await updateArea({
      id: editingArea.id,
      name: editName,
      accentColor: editColor,
      iconName: editIcon,
      priorityWeight: editPriority,
    })

    setEditSubmitting(false)

    if (!res.success) {
      setEditError(res.error || 'Failed to update life area.')
    } else {
      setSuccessMessage(`Life area "${editName}" updated successfully in database.`)
      setEditingArea(null)
    }
  }

  const handleConfirmDelete = async () => {
    if (!areaToDelete) return
    const name = areaToDelete.name
    const res = await deleteArea(areaToDelete.id)
    setAreaToDelete(null)

    if (!res.success) {
      setCreateError(res.error || 'Failed to delete life area.')
    } else {
      setSuccessMessage(`Life area "${name}" deleted from database.`)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-8 font-sans selection:bg-accent/20 selection:text-accent">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Settings className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-normal text-text-primary tracking-tight">
              Settings
            </h1>
            <p className="text-[13px] text-text-secondary">
              Configure your life areas, system operational baselines, and persistent storage.
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => refetch()}
          loading={isLoading}
          className="gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync from Cloud</span>
        </Button>
      </div>

      {/* ── Status Alerts ── */}
      {successMessage && (
        <Alert
          variant="success"
          onDismiss={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      {loadError && (
        <Alert variant="danger" title="Error Synchronizing Records">
          {loadError}
        </Alert>
      )}

      {/* ── Section: Life Areas ── */}
      <section className="p-6 rounded-xl bg-bg-elevated/70 border border-border flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-text-primary tracking-tight">
                Life Areas
              </h2>
              <Tooltip content="Add life area">
                <Button
                  variant="subtle"
                  size="icon-sm"
                  onClick={() => setCreateDialogOpen(true)}
                  aria-label="Add life area"
                  className="h-6 w-6 rounded-md text-accent hover:text-accent-hover hover:bg-accent-subtle/80"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                </Button>
              </Tooltip>
            </div>
            <p className="text-[12px] text-text-secondary mt-0.5">
              Configured domains stored in your Supabase backend. Order is prioritized by weight.
            </p>
          </div>
        </div>

        {/* Life Areas List */}
        {isLoading && lifeAreas.length === 0 ? (
          <div className="flex flex-col gap-3 py-4">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        ) : lifeAreas.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border rounded-lg text-text-muted text-sm">
            No life areas configured. Click &ldquo;+&rdquo; above to add one.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {lifeAreas.map((area) => {
              const IconComp = iconMap[area.iconName] || Layers
              return (
                <div
                  key={area.id}
                  className="flex items-center justify-between p-3.5 rounded-lg bg-bg-base/60 border border-border-subtle hover:border-white/[0.12] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: area.accentColor }}
                      aria-hidden="true"
                    />
                    <div className="w-7 h-7 rounded-md bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                      <IconComp className="w-4 h-4 text-text-secondary" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-text-primary truncate">
                          {area.name}
                        </span>
                        {area.isSystemDefault && (
                          <Badge variant="outline" size="sm" className="text-[10px] py-0 px-1.5">
                            Default
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-text-muted truncate">
                        slug: {area.slug} • priority: {area.priorityWeight}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(area)}
                      className="h-8 px-2 text-text-muted hover:text-text-primary"
                      title="Edit life area"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>

                    {!area.isSystemDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAreaToDelete(area)}
                        className="h-8 px-2 text-text-muted hover:text-status-danger"
                        title="Delete custom life area"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Dialog: Create Life Area ── */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogCloseButton onClose={() => setCreateDialogOpen(false)} />
        <form onSubmit={handleCreateSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Life Area</DialogTitle>
            <DialogDescription>
              Create a custom life domain. This record will be persisted directly to your Supabase tenant.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 flex flex-col gap-4">
            {createError && (
              <Alert variant="danger">{createError}</Alert>
            )}

            <FormField id="new-area-name" label="Domain Name" required>
              <Input
                placeholder="e.g. Research &amp; Publications"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                disabled={createSubmitting}
                autoFocus
              />
            </FormField>

            <FormField id="new-area-priority" label="Priority Weight (1–10)" helperText="1 is highest priority in schedules">
              <Input
                type="number"
                min={1}
                max={10}
                value={newPriority}
                onChange={(e) => setNewPriority(parseInt(e.target.value, 10) || 5)}
                disabled={createSubmitting}
              />
            </FormField>

            {/* Color Swatches */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-medium text-text-secondary">Accent Color</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setNewColor(c.hex)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      newColor === c.hex ? 'border-accent scale-110 shadow-md' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            {/* Icon Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-medium text-text-secondary">Icon</label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 border border-border-subtle rounded-md bg-bg-base/40">
                {ICON_OPTIONS.map((opt) => {
                  const Icon = opt.icon
                  const selected = newIcon === opt.name
                  return (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setNewIcon(opt.name)}
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
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCreateDialogOpen(false)}
              disabled={createSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={createSubmitting}>
              Create &amp; Save
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* ── Dialog: Edit Life Area ── */}
      <Dialog open={Boolean(editingArea)} onOpenChange={(open) => !open && setEditingArea(null)}>
        <DialogCloseButton onClose={() => setEditingArea(null)} />
        <form onSubmit={handleEditSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Life Area</DialogTitle>
            <DialogDescription>
              Update name, color, and priority weight for &ldquo;{editingArea?.name}&rdquo;.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 flex flex-col gap-4">
            {editError && (
              <Alert variant="danger">{editError}</Alert>
            )}

            <FormField id="edit-area-name" label="Domain Name" required>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                disabled={editSubmitting}
              />
            </FormField>

            <FormField id="edit-area-priority" label="Priority Weight (1–10)">
              <Input
                type="number"
                min={1}
                max={10}
                value={editPriority}
                onChange={(e) => setEditPriority(parseInt(e.target.value, 10) || 5)}
                disabled={editSubmitting}
              />
            </FormField>

            {/* Color Swatches */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-medium text-text-secondary">Accent Color</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setEditColor(c.hex)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      editColor === c.hex ? 'border-accent scale-110 shadow-md' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditingArea(null)}
              disabled={editSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={editSubmitting}>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* ── Dialog: Confirm Deletion ── */}
      <ConfirmationDialog
        open={Boolean(areaToDelete)}
        onOpenChange={(open) => !open && setAreaToDelete(null)}
        title={`Delete "${areaToDelete?.name}"?`}
        description="Are you sure you want to delete this custom life area? This action will permanently remove it from your database."
        confirmText="Delete Life Area"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

export const settingsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/settings',
  component: SettingsPage,
})
