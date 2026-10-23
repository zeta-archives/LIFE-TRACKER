import * as React from 'react'
import { Archive, RotateCcw, Trash2, Layers, type LucideIcon } from 'lucide-react'
import { useLifeAreas, type LifeArea } from '@/data'
import {
  Button,
  Badge,
  Alert,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogCloseButton,
  ConfirmationDialog,
} from '@/components/ui'
import { ICON_OPTIONS } from './CreateLifeAreaDialog'

const iconMap: Record<string, LucideIcon> = Object.fromEntries(
  ICON_OPTIONS.map((item) => [item.name, item.icon]),
)

interface ArchivedLifeAreasDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ArchivedLifeAreasDialog({
  open,
  onOpenChange,
}: ArchivedLifeAreasDialogProps) {
  const { archivedAreas, restoreArea, deleteArea } = useLifeAreas()

  const [restoringId, setRestoringId] = React.useState<string | null>(null)
  const [areaToDelete, setAreaToDelete] = React.useState<LifeArea | null>(null)
  const [feedback, setFeedback] = React.useState<{
    type: 'success' | 'danger'
    message: string
  } | null>(null)

  const handleRestore = async (area: LifeArea) => {
    setFeedback(null)
    setRestoringId(area.id)
    const res = await restoreArea(area.id)
    setRestoringId(null)

    if (!res.success) {
      setFeedback({
        type: 'danger',
        message: res.error || `Failed to restore "${area.name}".`,
      })
    } else {
      setFeedback({
        type: 'success',
        message: `Life area "${area.name}" restored to active navigation.`,
      })
    }
  }

  const handleDelete = async () => {
    if (!areaToDelete) return
    const name = areaToDelete.name
    const res = await deleteArea(areaToDelete.id)
    setAreaToDelete(null)

    if (!res.success) {
      setFeedback({
        type: 'danger',
        message: res.error || `Failed to delete "${name}".`,
      })
    } else {
      setFeedback({
        type: 'success',
        message: `Life area "${name}" permanently deleted.`,
      })
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogCloseButton onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-accent" />
            <DialogTitle>Archived Life Areas</DialogTitle>
          </div>
          <DialogDescription>
            Revisit or restore life areas that are no longer active in your everyday workspace. Historical goals and tasks remain safely preserved.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 flex flex-col gap-3 font-sans max-h-[60vh] overflow-y-auto">
          {feedback && (
            <Alert
              variant={feedback.type}
              onDismiss={() => setFeedback(null)}
            >
              {feedback.message}
            </Alert>
          )}

          {archivedAreas.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border rounded-xl text-text-muted flex flex-col items-center gap-2">
              <Archive className="w-8 h-8 opacity-40 text-text-muted" />
              <p className="text-sm font-medium text-text-primary">
                No archived life areas
              </p>
              <p className="text-[12px] text-text-secondary max-w-sm">
                Active life domains you archive will appear here. Archiving keeps your active sidebar focused without losing history.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {archivedAreas.map((area) => {
                const IconComp = iconMap[area.iconName] || Layers
                const formattedDate = area.archivedAt
                  ? new Date(area.archivedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : null

                return (
                  <div
                    key={area.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-bg-base/60 border border-border-subtle hover:border-white/[0.12] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0 opacity-80 shadow-sm"
                        style={{ backgroundColor: area.accentColor }}
                        aria-hidden="true"
                      />
                      <div className="w-7 h-7 rounded-md bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                        <IconComp className="w-3.5 h-3.5 text-text-muted" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium text-text-primary truncate">
                            {area.name}
                          </span>
                          <Badge variant="default" size="sm" className="text-[10px] py-0 px-1.5">
                            Archived
                          </Badge>
                          {area.isSystemDefault && (
                            <Badge variant="outline" size="sm" className="text-[10px] py-0 px-1.5">
                              Default
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] text-text-muted truncate">
                          {formattedDate ? `Archived ${formattedDate}` : 'Archived'} • priority: {area.priorityWeight}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRestore(area)}
                        loading={restoringId === area.id}
                        className="h-7 text-[12px] gap-1.5 px-2.5"
                        title="Restore area to active sidebar"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restore</span>
                      </Button>

                      {!area.isSystemDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAreaToDelete(area)}
                          className="h-7 px-2 text-text-muted hover:text-status-danger"
                          title="Permanently delete from database"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={Boolean(areaToDelete)}
        onOpenChange={(open) => !open && setAreaToDelete(null)}
        title={`Permanently delete "${areaToDelete?.name}"?`}
        description="Are you sure you want to permanently delete this archived life area from your database? This action cannot be undone."
        confirmText="Permanently Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  )
}
