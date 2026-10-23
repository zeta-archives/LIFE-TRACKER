/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'
import {
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
  Layers,
  type LucideIcon,
} from 'lucide-react'
import { useLifeAreas } from '@/data'
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
} from '@/components/ui'

export const ICON_OPTIONS: { name: string; icon: LucideIcon; label: string }[] = [
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

export const COLOR_OPTIONS = [
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

export interface CreateLifeAreaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (areaName: string) => void
}

export function CreateLifeAreaDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateLifeAreaDialogProps) {
  const { createArea } = useLifeAreas()

  const [name, setName] = React.useState('')
  const [color, setColor] = React.useState(COLOR_OPTIONS[6].hex) // Amber
  const [icon, setIcon] = React.useState('Layers')
  const [priority, setPriority] = React.useState(5)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleClose = () => {
    setError(null)
    onOpenChange(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const res = await createArea({
      name,
      accentColor: color,
      iconName: icon,
      priorityWeight: priority,
    })

    setSubmitting(false)

    if (!res.success) {
      setError(res.error || 'Failed to create life area.')
    } else {
      setName('')
      setColor(COLOR_OPTIONS[6].hex)
      setIcon('Layers')
      setPriority(5)
      onOpenChange(false)
      onSuccess?.(name)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogCloseButton onClose={handleClose} />
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Add New Life Area</DialogTitle>
          <DialogDescription>
            Create a custom life domain. This record will be persisted directly to your Supabase tenant.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 flex flex-col gap-4 font-sans">
          {error && <Alert variant="danger">{error}</Alert>}

          <FormField id="sidebar-new-area-name" label="Domain Name" required>
            <Input
              placeholder="e.g. Research &amp; Publications"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={submitting}
              autoFocus
            />
          </FormField>

          <FormField
            id="sidebar-new-area-priority"
            label="Priority Weight (1–10)"
            helperText="1 is highest priority in schedules"
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
            <label className="text-[12px] font-medium text-text-secondary">Accent Color</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    color === c.hex ? 'border-accent scale-110 shadow-md' : 'border-transparent hover:scale-105'
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
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={submitting}>
            Create &amp; Save
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
