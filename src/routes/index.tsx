/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root'
import {
  Sparkles,
  ShieldCheck,
  ChevronRight,
  MoreVertical,
  Inbox,
  Pencil,
  Trash2,
} from 'lucide-react'
import {
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  Switch,
  FormField,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogCloseButton,
  ConfirmationDialog,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Alert,
  Badge,
  Spinner,
  Skeleton,
  EmptyState,
  Divider,
  PageHeader,
  Tooltip,
} from '@/components/ui'

function ShowcaseContent() {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [switchChecked, setSwitchChecked] = React.useState(true)
  const [checkboxChecked, setCheckboxChecked] = React.useState(true)
  const [btnLoading, setBtnLoading] = React.useState(false)
  const [alertVisible, setAlertVisible] = React.useState(true)

  const toggleLoading = () => {
    setBtnLoading(true)
    setTimeout(() => setBtnLoading(false), 1500)
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary font-sans antialiased selection:bg-accent/20 selection:text-accent pb-20">
      {/* Isolated Header */}
      <PageHeader
        title="Interface Component Showcase"
        description="Design-system verification environment for Aether's shared UI primitives (Checkpoint 4.3)."
        badge={<Badge variant="accent">Checkpoint 4.3</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.history.back()}
            >
              Back to App
            </Button>
          </div>
        }
      />

      <main className="max-w-4xl mx-auto px-10 pt-8 flex flex-col gap-12">
        {/* Verification Overview */}
        <section aria-labelledby="status-overview">
          <div className="flex items-center gap-2 text-xs font-medium text-status-success mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span id="status-overview">Foundation Status: Fully Verified</span>
          </div>
          <p className="text-text-secondary text-[13px] leading-relaxed max-w-2xl">
            All primitives strictly adhere to the Aether visual design system in{' '}
            <code className="text-accent text-xs">DESIGN.md</code>: Instrument Serif display moments, Plus Jakarta Sans functional hierarchy, geometric radius harmony, accessible focus-visible rings, anti-card open layout, and semantic tokens.
          </p>
        </section>

        {/* 1. Buttons */}
        <section className="flex flex-col gap-4" aria-labelledby="buttons-heading">
          <h2
            id="buttons-heading"
            className="text-xs font-semibold uppercase tracking-widest text-text-muted"
          >
            1. Buttons &amp; Interactive Variants
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary Action</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="subtle">Subtle</Button>
            <Button variant="destructive">Destructive</Button>
            <Button
              variant="primary"
              loading={btnLoading}
              onClick={toggleLoading}
            >
              {btnLoading ? 'Processing...' : 'Click for Loading'}
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
            <Tooltip content="Icon Button Tooltip">
              <Button variant="secondary" size="icon" aria-label="More options">
                <MoreVertical className="w-4 h-4 text-text-secondary" />
              </Button>
            </Tooltip>
          </div>
        </section>

        <Divider />

        {/* 2. Form Controls */}
        <section className="flex flex-col gap-5" aria-labelledby="forms-heading">
          <h2
            id="forms-heading"
            className="text-xs font-semibold uppercase tracking-widest text-text-muted"
          >
            2. Form Controls &amp; Validation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              id="showcase-goal-input"
              label="Goal Title"
              required
              helperText="Brief name describing your aspiration."
            >
              <Input placeholder="e.g. Master Operating Systems" />
            </FormField>

            <FormField
              id="showcase-input-error"
              label="Target Attendance Percentage"
              required
              error="Attendance percentage must be between 0 and 100."
            >
              <Input defaultValue="105%" />
            </FormField>

            <FormField
              id="showcase-area-select"
              label="Assigned Life Area"
              helperText="Associates record with domain metrics."
            >
              <Select defaultValue="academics">
                <option value="academics">Academics &amp; Study</option>
                <option value="health">Health &amp; Fitness</option>
                <option value="skills">Skills &amp; Career</option>
                <option value="sleep">Sleep &amp; Recovery</option>
              </Select>
            </FormField>

            <FormField
              id="showcase-textarea"
              label="Reflection Notes"
              helperText="Optional notes on this commitment."
            >
              <Textarea placeholder="Context or thoughts..." rows={3} />
            </FormField>
          </div>

          <div className="flex flex-wrap items-center gap-8 pt-2">
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="checkbox-1"
                checked={checkboxChecked}
                onCheckedChange={setCheckboxChecked}
              />
              <label
                htmlFor="checkbox-1"
                className="text-[13px] text-text-secondary font-medium cursor-pointer select-none"
              >
                Track streak momentum
              </label>
            </div>

            <div className="flex items-center gap-2.5">
              <Switch
                id="switch-1"
                checked={switchChecked}
                onCheckedChange={setSwitchChecked}
              />
              <label
                htmlFor="switch-1"
                className="text-[13px] text-text-secondary font-medium cursor-pointer select-none"
              >
                Ambient notifications
              </label>
            </div>
          </div>
        </section>

        <Divider />

        {/* 3. Dialogs & Menus */}
        <section className="flex flex-col gap-4" aria-labelledby="dialogs-heading">
          <h2
            id="dialogs-heading"
            className="text-xs font-semibold uppercase tracking-widest text-text-muted"
          >
            3. Dialogs, Modals &amp; Dropdown Menus
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="secondary" onClick={() => setDialogOpen(true)}>
              Open Test Dialog
            </Button>
            <Button
              variant="destructive"
              onClick={() => setConfirmOpen(true)}
            >
              Open Confirmation Dialog
            </Button>

            {/* Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline" className="gap-2">
                  <span>Menu Actions</span>
                  <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="left">
                <DropdownMenuItem onClick={() => alert('Quick log triggered')}>
                  <Pencil className="w-3.5 h-3.5 text-text-muted" />
                  <span>Log Activity</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => alert('Focus session triggered')}>
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span>Start Focus Session</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  destructive
                  onClick={() => alert('Delete triggered')}
                >
                  <Trash2 className="w-3.5 h-3.5 text-status-danger" />
                  <span>Delete Record</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Test Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogCloseButton onClose={() => setDialogOpen(false)} />
            <DialogHeader>
              <DialogTitle>Quick Log Prototype</DialogTitle>
              <DialogDescription>
                Record an action, schedule a commitment, or query the assistant.
              </DialogDescription>
            </DialogHeader>
            <div className="py-3 flex flex-col gap-4">
              <FormField id="dlg-input" label="Activity Description">
                <Input placeholder="Completed 45m discrete math lecture..." />
              </FormField>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setDialogOpen(false)}>
                Save to Canonical Log
              </Button>
            </DialogFooter>
          </Dialog>

          {/* Confirmation Dialog */}
          <ConfirmationDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title="Discard Goal?"
            description="Are you sure you want to discard this goal? This action cannot be undone."
            confirmText="Discard Goal"
            variant="destructive"
            onConfirm={() => {
              setConfirmOpen(false)
            }}
          />
        </section>

        <Divider />

        {/* 4. Feedback, Alerts & Status */}
        <section className="flex flex-col gap-4" aria-labelledby="feedback-heading">
          <h2
            id="feedback-heading"
            className="text-xs font-semibold uppercase tracking-widest text-text-muted"
          >
            4. Notifications, Status &amp; Badges
          </h2>
          <div className="flex flex-col gap-3">
            {alertVisible && (
              <Alert
                variant="info"
                title="Cross-Area Synchronization"
                onDismiss={() => setAlertVisible(false)}
              >
                Upcoming exam period detected next week. Consider adjusting target study hours.
              </Alert>
            )}
            <Alert variant="success" title="Milestone Fulfilled">
              All 4 core objectives completed for semester milestone.
            </Alert>
            <Alert variant="warning" title="Schedule Warning">
              Warning amber is intentionally distinct from primary-action amber per DESIGN.md.
            </Alert>
            <Alert variant="danger" title="Attendance Alert">
              Attendance in Operating Systems dropped below required 75% threshold.
            </Alert>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="accent">Accent Amber</Badge>
            <Badge variant="success">Active Streak</Badge>
            <Badge variant="warning">At Risk</Badge>
            <Badge variant="danger">Overdue</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="accent" size="pill">
              Pill Badge
            </Badge>
          </div>
        </section>

        <Divider />

        {/* 5. Structural States */}
        <section className="flex flex-col gap-4" aria-labelledby="states-heading">
          <h2
            id="states-heading"
            className="text-xs font-semibold uppercase tracking-widest text-text-muted"
          >
            5. Loading &amp; Empty State Primitives
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Loading Skeletons */}
            <div className="p-4 rounded-md border border-border-subtle flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-secondary">
                  Loading Skeleton
                </span>
                <Spinner size="sm" />
              </div>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>

            {/* Empty State */}
            <div className="p-4 rounded-md border border-border-subtle">
              <EmptyState
                icon={Inbox}
                title="No Pending Milestones"
                description="You have fulfilled all active commitments for this academic block."
                action={
                  <Button variant="secondary" size="sm">
                    Define New Milestone
                  </Button>
                }
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/verify',
  component: ShowcaseContent,
})
