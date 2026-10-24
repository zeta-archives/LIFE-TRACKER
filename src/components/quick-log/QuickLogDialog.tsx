import * as React from 'react'
import {
  Sparkles,
  CheckSquare,
  CalendarDays,
  Clock,
  TrendingUp,
  MapPin,
  CheckCircle2,
} from 'lucide-react'
import {
  useLifeAreas,
  useGoals,
  useTasks,
  createCalendarEvent,
  createProgressRecord,
  logCompletedFocusSession,
  type TaskPriorityCategory,
  type CalendarEventType,
} from '@/data'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogCloseButton,
  Button,
  Input,
  Select,
  Textarea,
  FormField,
  DatePicker,
  Alert,
} from '@/components/ui'
import { useQuickLog, type QuickLogActivityType } from './QuickLogContext'

export function QuickLogDialog() {
  const { isOpen, closeQuickLog, options } = useQuickLog()
  const { lifeAreas } = useLifeAreas()
  const { goals } = useGoals()
  const { tasks, createTask, refetch: refetchTasks } = useTasks()

  // Selected Activity Type
  const [activityType, setActivityType] = React.useState<QuickLogActivityType>('task')

  // Shared Core Field: Life Area (Required across all canonical tables)
  const [lifeAreaId, setLifeAreaId] = React.useState('')

  // 1. Task State (Action / Todo)
  const [taskMode, setTaskMode] = React.useState<'todo' | 'completed'>('completed')
  const [taskTitle, setTaskTitle] = React.useState('')
  const [taskDescription, setTaskDescription] = React.useState('')
  const [taskGoalId, setTaskGoalId] = React.useState('')
  const [taskMilestoneId, setTaskMilestoneId] = React.useState('')
  const [taskPriority, setTaskPriority] = React.useState<TaskPriorityCategory>('should_happen')
  const [taskDueDate, setTaskDueDate] = React.useState<string | null>(null)
  const [taskDuration, setTaskDuration] = React.useState<number | null>(null)

  // 2. Calendar Commitment State
  const [eventTitle, setEventTitle] = React.useState('')
  const [eventType, setEventType] = React.useState<CalendarEventType>('study_block')
  const [eventDate, setEventDate] = React.useState('')
  const [eventStartTime, setEventStartTime] = React.useState('09:00')
  const [eventEndTime, setEventEndTime] = React.useState('10:00')
  const [eventLocation, setEventLocation] = React.useState('')
  const [eventTaskId, setEventTaskId] = React.useState('')

  // 3. Focus Session State
  const [focusTaskId, setFocusTaskId] = React.useState('')
  const [focusDurationMinutes, setFocusDurationMinutes] = React.useState(25)
  const [focusReflection, setFocusReflection] = React.useState('')

  // 4. Progress Metric State
  const [metricName, setMetricName] = React.useState('')
  const [metricValue, setMetricValue] = React.useState('')
  const [metricUnit, setMetricUnit] = React.useState('')
  const [metricGoalId, setMetricGoalId] = React.useState('')
  const [metricNotes, setMetricNotes] = React.useState('')

  // UI Flow State
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)

  // Initialize and synchronize with options when opened
  React.useEffect(() => {
    if (isOpen) {
      setError(null)
      setSuccessMessage(null)

      // Initial activity type based on mode/options
      if (options.activityType) {
        setActivityType(options.activityType)
      } else if (options.mode === 'plan') {
        setActivityType('task')
        setTaskMode('todo')
      } else {
        setActivityType('task')
        setTaskMode('completed')
      }

      if (options.lifeAreaId) {
        setLifeAreaId(options.lifeAreaId)
      } else if (lifeAreas.length > 0) {
        setLifeAreaId(lifeAreas[0].id)
      }

      // Initial Task fields
      setTaskTitle(options.initialTitle || '')
      setTaskDescription('')
      setTaskGoalId(options.goalId || '')
      setTaskMilestoneId('')
      setTaskPriority('should_happen')
      setTaskDueDate(null)
      setTaskDuration(null)

      // Initial Event fields
      setEventTitle(options.initialTitle || '')
      setEventType('study_block')
      setEventDate(new Date().toISOString().split('T')[0])
      setEventStartTime('09:00')
      setEventEndTime('10:00')
      setEventLocation('')
      setEventTaskId(options.taskId || '')

      // Initial Focus fields
      setFocusTaskId(options.taskId || '')
      setFocusDurationMinutes(25)
      setFocusReflection('')

      // Initial Metric fields
      setMetricName('')
      setMetricValue('')
      setMetricUnit('')
      setMetricGoalId(options.goalId || '')
      setMetricNotes('')
    }
  }, [isOpen, options, lifeAreas])

  // Filter available goals by selected Life Area
  const availableGoals = React.useMemo(() => {
    if (!lifeAreaId) return []
    return goals.filter((g) => g.lifeAreaId === lifeAreaId && g.status !== 'achieved' && g.status !== 'abandoned')
  }, [goals, lifeAreaId])

  // Filter milestones by selected Goal
  const availableMilestones = React.useMemo(() => {
    if (!taskGoalId) return []
    const selectedGoal = goals.find((g) => g.id === taskGoalId)
    return selectedGoal ? selectedGoal.milestones.filter((m) => m.status !== 'completed') : []
  }, [goals, taskGoalId])

  // Filter active tasks for linking in Focus and Calendar Event by selected Life Area
  const availableTasks = React.useMemo(() => {
    if (!lifeAreaId) return []
    return tasks.filter((t) => t.lifeAreaId === lifeAreaId && t.status !== 'completed')
  }, [tasks, lifeAreaId])

  // Form Submission Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lifeAreaId) {
      setError('Please select a life domain.')
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      if (activityType === 'task') {
        const trimmedTitle = taskTitle.trim()
        if (!trimmedTitle) {
          setError('Task title cannot be empty.')
          setSubmitting(false)
          return
        }

        const isCompleted = taskMode === 'completed'
        const todayStr = new Date().toISOString().split('T')[0]

        const res = await createTask({
          title: trimmedTitle,
          description: taskDescription.trim() || null,
          lifeAreaId,
          goalId: taskGoalId || null,
          milestoneId: taskMilestoneId || null,
          priority: taskPriority,
          dueDate: taskDueDate || null,
          scheduledDate: isCompleted ? todayStr : (taskDueDate || todayStr),
          estimatedDurationMinutes: taskDuration || null,
          status: isCompleted ? 'completed' : 'todo',
          sourceType: 'quick_log',
        })

        if (res.error) {
          setError(res.error)
          setSubmitting(false)
          return
        }

        await refetchTasks()
        setSuccessMessage(isCompleted ? 'Completed action recorded!' : 'Task scheduled!')
      } else if (activityType === 'commitment') {
        const trimmedTitle = eventTitle.trim()
        if (!trimmedTitle) {
          setError('Commitment title cannot be empty.')
          setSubmitting(false)
          return
        }

        const startIso = new Date(`${eventDate}T${eventStartTime}:00`).toISOString()
        const endIso = new Date(`${eventDate}T${eventEndTime}:00`).toISOString()

        if (endIso < startIso) {
          setError('End time must be after start time.')
          setSubmitting(false)
          return
        }

        const res = await createCalendarEvent({
          title: trimmedTitle,
          lifeAreaId,
          taskId: eventTaskId || null,
          eventType,
          startTime: startIso,
          endTime: endIso,
          location: eventLocation.trim() || null,
        })

        if (res.error) {
          setError(res.error.message)
          setSubmitting(false)
          return
        }

        setSuccessMessage('Schedule commitment added!')
      } else if (activityType === 'focus') {
        if (!focusDurationMinutes || focusDurationMinutes <= 0) {
          setError('Duration must be greater than 0.')
          setSubmitting(false)
          return
        }

        const res = await logCompletedFocusSession({
          lifeAreaId,
          taskId: focusTaskId || null,
          durationMinutes: focusDurationMinutes,
          reflectionNote: focusReflection.trim() || null,
        })

        if (res.error) {
          setError(res.error.message)
          setSubmitting(false)
          return
        }

        setSuccessMessage('Focus session logged!')
      } else if (activityType === 'metric') {
        const trimmedMetric = metricName.trim()
        if (!trimmedMetric) {
          setError('Metric name cannot be empty.')
          setSubmitting(false)
          return
        }

        const numVal = parseFloat(metricValue)
        if (isNaN(numVal)) {
          setError('Please provide a valid numeric value.')
          setSubmitting(false)
          return
        }

        const res = await createProgressRecord({
          lifeAreaId,
          goalId: metricGoalId || null,
          metricName: trimmedMetric,
          numericValue: numVal,
          unit: metricUnit.trim() || null,
          notes: metricNotes.trim() || null,
        })

        if (res.error) {
          setError(res.error.message)
          setSubmitting(false)
          return
        }

        setSuccessMessage('Progress metric logged!')
      }

      setSubmitting(false)

      // Close dialog smoothly after brief success acknowledgement
      setTimeout(() => {
        closeQuickLog()
      }, 550)
    } catch (err: unknown) {
      setSubmitting(false)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    }
  }

  const selectedArea = lifeAreas.find((a) => a.id === lifeAreaId)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeQuickLog()}>
      <DialogCloseButton onClose={closeQuickLog} />

      <form onSubmit={handleSubmit} className="font-sans">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/25 flex items-center justify-center text-accent">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle>Quick Log</DialogTitle>
              <DialogDescription>
                Fast universal entry into your life domains and goals without leaving your workspace.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 flex flex-col gap-4">
          {error && <Alert variant="danger">{error}</Alert>}

          {successMessage && (
            <div className="p-3 rounded-lg bg-status-success/15 border border-status-success/30 flex items-center gap-2 text-status-success text-xs font-medium animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ── Activity Type Selector (4 canonical record types) ── */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-bg-elevated border border-border-subtle overflow-x-auto domain-filter-slider">
            <button
              type="button"
              onClick={() => {
                setActivityType('task')
                setError(null)
              }}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                activityType === 'task'
                  ? 'bg-accent/15 text-accent border border-accent/30 shadow-sm'
                  : 'text-text-muted hover:text-text-primary hover:bg-white/[0.04]'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Action / Task</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActivityType('commitment')
                setError(null)
              }}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                activityType === 'commitment'
                  ? 'bg-accent/15 text-accent border border-accent/30 shadow-sm'
                  : 'text-text-muted hover:text-text-primary hover:bg-white/[0.04]'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Commitment</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActivityType('focus')
                setError(null)
              }}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                activityType === 'focus'
                  ? 'bg-accent/15 text-accent border border-accent/30 shadow-sm'
                  : 'text-text-muted hover:text-text-primary hover:bg-white/[0.04]'
              }`}
            >
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Focus Time</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActivityType('metric')
                setError(null)
              }}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                activityType === 'metric'
                  ? 'bg-accent/15 text-accent border border-accent/30 shadow-sm'
                  : 'text-text-muted hover:text-text-primary hover:bg-white/[0.04]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Metric</span>
            </button>
          </div>

          {/* ── Universal Anchor: Life Domain Selection (Mandatory) ── */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="quicklog-life-area" className="text-xs font-medium text-text-secondary flex items-center justify-between">
              <span>Life Domain <span className="text-status-danger">*</span></span>
              {selectedArea && (
                <span className="text-[11px] flex items-center gap-1 font-normal text-text-muted">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: selectedArea.accentColor }}
                    aria-hidden="true"
                  />
                  <span>Active domain</span>
                </span>
              )}
            </label>
            <Select
              id="quicklog-life-area"
              value={lifeAreaId}
              onChange={(e) => {
                setLifeAreaId(e.target.value)
                setTaskGoalId('')
                setTaskMilestoneId('')
                setEventTaskId('')
                setFocusTaskId('')
                setMetricGoalId('')
              }}
              disabled={submitting}
              required
            >
              {lifeAreas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </Select>
          </div>

          {/* ── 1. TASK ACTIVITY FORM ── */}
          {activityType === 'task' && (
            <div className="flex flex-col gap-3.5 animate-in fade-in">
              {/* Task Mode Sub-toggle: Log Completed vs Plan Todo */}
              <div className="grid grid-cols-2 gap-2 p-0.5 rounded-lg bg-bg-elevated/60 border border-border-subtle">
                <button
                  type="button"
                  onClick={() => setTaskMode('completed')}
                  className={`py-1 text-xs font-medium rounded-md transition-all ${
                    taskMode === 'completed'
                      ? 'bg-status-success/20 text-status-success font-semibold shadow-sm'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  ✓ Log Completed Action
                </button>
                <button
                  type="button"
                  onClick={() => setTaskMode('todo')}
                  className={`py-1 text-xs font-medium rounded-md transition-all ${
                    taskMode === 'todo'
                      ? 'bg-accent/20 text-accent font-semibold shadow-sm'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  + Plan Action / Todo
                </button>
              </div>

              <FormField id="quicklog-task-title" label="What did you do / what needs doing?" required>
                <Input
                  id="quicklog-task-title"
                  placeholder={
                    taskMode === 'completed'
                      ? 'e.g. Completed Chapter 4 exercises, Finished 5k run'
                      : 'e.g. Submit essay draft, Review discrete math'
                  }
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  disabled={submitting}
                  autoFocus
                  required
                />
              </FormField>

              {/* Relationship: Goal & Milestone (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField id="quicklog-task-goal" label="Connected Goal (Optional)">
                  <Select
                    id="quicklog-task-goal"
                    value={taskGoalId}
                    onChange={(e) => {
                      setTaskGoalId(e.target.value)
                      setTaskMilestoneId('')
                    }}
                    disabled={submitting || availableGoals.length === 0}
                  >
                    <option value="">No goal linked</option>
                    {availableGoals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField id="quicklog-task-milestone" label="Milestone (Optional)">
                  <Select
                    id="quicklog-task-milestone"
                    value={taskMilestoneId}
                    onChange={(e) => setTaskMilestoneId(e.target.value)}
                    disabled={submitting || !taskGoalId || availableMilestones.length === 0}
                  >
                    <option value="">No milestone linked</option>
                    {availableMilestones.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </div>

              {/* Priority & Scheduling */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField id="quicklog-task-priority" label="Priority">
                  <Select
                    id="quicklog-task-priority"
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriorityCategory)}
                    disabled={submitting}
                  >
                    <option value="must_happen">1. Must Happen (Essential)</option>
                    <option value="should_happen">2. Should Happen (Important)</option>
                    <option value="could_happen">3. Could Happen (Optional)</option>
                  </Select>
                </FormField>

                <FormField id="quicklog-task-due" label={taskMode === 'completed' ? 'Completed Date' : 'Target Deadline'}>
                  <DatePicker
                    id="quicklog-task-due"
                    value={taskDueDate}
                    onChange={setTaskDueDate}
                    disabled={submitting}
                  />
                </FormField>
              </div>
            </div>
          )}

          {/* ── 2. COMMITMENT / SCHEDULE ACTIVITY FORM ── */}
          {activityType === 'commitment' && (
            <div className="flex flex-col gap-3.5 animate-in fade-in">
              <FormField id="quicklog-event-title" label="Commitment Title" required>
                <Input
                  id="quicklog-event-title"
                  placeholder="e.g. Distributed Systems Lecture, Group Study"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  disabled={submitting}
                  autoFocus
                  required
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField id="quicklog-event-type" label="Event Type">
                  <Select
                    id="quicklog-event-type"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as CalendarEventType)}
                    disabled={submitting}
                  >
                    <option value="study_block">Study / Focus Block</option>
                    <option value="class_timetable">Class / Lecture</option>
                    <option value="exam">Exam / Assessment</option>
                    <option value="personal">Personal / Wellbeing</option>
                    <option value="task_block">Task Execution Block</option>
                  </Select>
                </FormField>

                {/* Relationship: Link to Task (Optional) */}
                <FormField id="quicklog-event-task" label="Linked Task (Optional)">
                  <Select
                    id="quicklog-event-task"
                    value={eventTaskId}
                    onChange={(e) => setEventTaskId(e.target.value)}
                    disabled={submitting || availableTasks.length === 0}
                  >
                    <option value="">No task linked</option>
                    {availableTasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField id="quicklog-event-date" label="Date">
                  <DatePicker
                    id="quicklog-event-date"
                    value={eventDate}
                    onChange={(d) => setEventDate(d || new Date().toISOString().split('T')[0])}
                    disabled={submitting}
                  />
                </FormField>

                <FormField id="quicklog-event-start" label="Start Time">
                  <Input
                    id="quicklog-event-start"
                    type="time"
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    disabled={submitting}
                    className="tabular-nums"
                  />
                </FormField>

                <FormField id="quicklog-event-end" label="End Time">
                  <Input
                    id="quicklog-event-end"
                    type="time"
                    value={eventEndTime}
                    onChange={(e) => setEventEndTime(e.target.value)}
                    disabled={submitting}
                    className="tabular-nums"
                  />
                </FormField>
              </div>

              <FormField id="quicklog-event-location" label="Location / Venue (Optional)">
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="quicklog-event-location"
                    placeholder="e.g. Lab 2B, Library 3rd Floor, Zoom"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    disabled={submitting}
                    className="pl-8"
                  />
                </div>
              </FormField>
            </div>
          )}

          {/* ── 3. FOCUS SESSION FORM ── */}
          {activityType === 'focus' && (
            <div className="flex flex-col gap-3.5 animate-in fade-in">
              <FormField id="quicklog-focus-task" label="Target Task (Optional)">
                <Select
                  id="quicklog-focus-task"
                  value={focusTaskId}
                  onChange={(e) => setFocusTaskId(e.target.value)}
                  disabled={submitting || availableTasks.length === 0}
                >
                  <option value="">General domain focus (No task linked)</option>
                  {availableTasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </Select>
              </FormField>

              {/* Preset Duration Chips */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary">
                  Focus Duration (Minutes)
                </label>
                <div className="flex items-center gap-2">
                  {[15, 25, 45, 60, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setFocusDurationMinutes(mins)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all ${
                        focusDurationMinutes === mins
                          ? 'bg-accent/20 border-accent text-accent'
                          : 'bg-white/[0.03] border-border-subtle text-text-muted hover:text-text-primary'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              <FormField id="quicklog-focus-reflection" label="Quick Reflection / Notes (Optional)">
                <Textarea
                  id="quicklog-focus-reflection"
                  placeholder="Key concepts mastered, blockers resolved..."
                  value={focusReflection}
                  onChange={(e) => setFocusReflection(e.target.value)}
                  disabled={submitting}
                  rows={2}
                />
              </FormField>
            </div>
          )}

          {/* ── 4. PROGRESS METRIC FORM ── */}
          {activityType === 'metric' && (
            <div className="flex flex-col gap-3.5 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField id="quicklog-metric-name" label="Metric Name" required>
                  <Input
                    id="quicklog-metric-name"
                    placeholder="e.g. Problems Solved, Pages Read, Workout Weight"
                    value={metricName}
                    onChange={(e) => setMetricName(e.target.value)}
                    disabled={submitting}
                    autoFocus
                    required
                  />
                </FormField>

                <FormField id="quicklog-metric-goal" label="Track Toward Goal (Optional)">
                  <Select
                    id="quicklog-metric-goal"
                    value={metricGoalId}
                    onChange={(e) => setMetricGoalId(e.target.value)}
                    disabled={submitting || availableGoals.length === 0}
                  >
                    <option value="">Independent metric</option>
                    {availableGoals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField id="quicklog-metric-val" label="Numeric Value" required>
                  <Input
                    id="quicklog-metric-val"
                    type="number"
                    step="any"
                    placeholder="e.g. 15"
                    value={metricValue}
                    onChange={(e) => setMetricValue(e.target.value)}
                    disabled={submitting}
                    required
                  />
                </FormField>

                <FormField id="quicklog-metric-unit" label="Unit (Optional)">
                  <Input
                    id="quicklog-metric-unit"
                    placeholder="e.g. problems, pages, kg, km"
                    value={metricUnit}
                    onChange={(e) => setMetricUnit(e.target.value)}
                    disabled={submitting}
                  />
                </FormField>
              </div>

              <FormField id="quicklog-metric-notes" label="Notes (Optional)">
                <Input
                  id="quicklog-metric-notes"
                  placeholder="Context, set details, or notes..."
                  value={metricNotes}
                  onChange={(e) => setMetricNotes(e.target.value)}
                  disabled={submitting}
                />
              </FormField>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] text-text-muted hidden sm:inline">
              Press <kbd className="px-1.5 py-0.5 rounded bg-bg border border-border-subtle font-mono text-[10px]">Esc</kbd> to close
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <Button
                type="button"
                variant="secondary"
                onClick={closeQuickLog}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={submitting}>
                Save Record
              </Button>
            </div>
          </div>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
