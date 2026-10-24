import * as React from 'react'
import { Calendar as CalendarIcon, MapPin } from 'lucide-react'
import { useLifeAreas, createCalendarEvent, type CalendarEvent, type CalendarEventType } from '@/data'
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
  Alert,
  DatePicker,
} from '@/components/ui'

interface CreateEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEventCreated?: (event: CalendarEvent) => void
  defaultDate?: string
  defaultEventType?: CalendarEventType
  defaultTitle?: string
}

export function CreateEventDialog({
  open,
  onOpenChange,
  onEventCreated,
  defaultDate,
  defaultEventType,
  defaultTitle,
}: CreateEventDialogProps) {
  const { lifeAreas } = useLifeAreas()

  const todayStr = React.useMemo(() => {
    return defaultDate || new Date().toISOString().split('T')[0]
  }, [defaultDate])

  const [title, setTitle] = React.useState(defaultTitle || '')
  const [lifeAreaId, setLifeAreaId] = React.useState('')
  const [eventType, setEventType] = React.useState<CalendarEventType>(defaultEventType || 'study_block')
  const [date, setDate] = React.useState(todayStr)
  const [startTime, setStartTime] = React.useState('09:00')
  const [endTime, setEndTime] = React.useState('10:30')
  const [location, setLocation] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Initialize lifeAreaId when lifeAreas load
  React.useEffect(() => {
    if (lifeAreas.length > 0 && !lifeAreaId) {
      setLifeAreaId(lifeAreas[0].id)
    }
  }, [lifeAreas, lifeAreaId])

  React.useEffect(() => {
    if (open) {
      setTitle(defaultTitle || '')
      setEventType(defaultEventType || 'study_block')
      setDate(defaultDate || new Date().toISOString().split('T')[0])
      setStartTime('09:00')
      setEndTime('10:30')
      setLocation('')
      setDescription('')
      setError(null)
      if (lifeAreas.length > 0 && !lifeAreaId) {
        setLifeAreaId(lifeAreas[0].id)
      }
    }
  }, [open, defaultDate, defaultTitle, defaultEventType, lifeAreas, lifeAreaId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Event title is required.')
      return
    }
    if (!lifeAreaId) {
      setError('Please select a life domain for this commitment.')
      return
    }

    setSubmitting(true)
    setError(null)

    const startIso = new Date(`${date}T${startTime}:00`).toISOString()
    const endIso = new Date(`${date}T${endTime}:00`).toISOString()

    if (endIso < startIso) {
      setError('End time must be after start time.')
      setSubmitting(false)
      return
    }

    const result = await createCalendarEvent({
      title: title.trim(),
      lifeAreaId,
      eventType,
      startTime: startIso,
      endTime: endIso,
      location: location.trim() || null,
      description: description.trim() || null,
    })

    setSubmitting(false)

    if (result.error) {
      setError(result.error.message)
    } else {
      if (result.data && onEventCreated) {
        onEventCreated(result.data)
      }
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogCloseButton onClose={() => onOpenChange(false)} />
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-accent" />
            <DialogTitle>Schedule Commitment</DialogTitle>
          </div>
          <DialogDescription>
            Record planned schedule blocks, classes, study sessions, or appointments.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 flex flex-col gap-4 font-sans">
          {error && <Alert variant="danger">{error}</Alert>}

          <FormField id="event-title" label="Commitment Title" required>
            <Input
              placeholder="e.g. Algorithms Lecture, Deep Work Sprint, Gym"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={submitting}
              autoFocus
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField id="event-life-area" label="Life Domain" required>
              <Select
                id="event-life-area"
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

            <FormField id="event-type" label="Commitment Type">
              <Select
                id="event-type"
                value={eventType}
                onChange={(e) => setEventType(e.target.value as CalendarEventType)}
                disabled={submitting}
              >
                <option value="study_block">Study / Focus Block</option>
                <option value="class_timetable">Class / Lecture</option>
                <option value="exam">Exam / Assessment</option>
                <option value="personal">Personal / Wellbeing</option>
                <option value="task_block">Dedicated Task Block</option>
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField id="event-date" label="Date">
              <DatePicker
                id="event-date"
                value={date}
                onChange={(d) => setDate(d || todayStr)}
                disabled={submitting}
              />
            </FormField>

            <FormField id="event-start-time" label="Start Time">
              <div className="relative">
                <Input
                  id="event-start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={submitting}
                  className="tabular-nums"
                />
              </div>
            </FormField>

            <FormField id="event-end-time" label="End Time">
              <div className="relative">
                <Input
                  id="event-end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={submitting}
                  className="tabular-nums"
                />
              </div>
            </FormField>
          </div>

          <FormField id="event-location" label="Location / Link (Optional)">
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="e.g. Hall 3B, Library 2nd Floor, Zoom link"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={submitting}
                className="pl-8"
              />
            </div>
          </FormField>

          <FormField id="event-description" label="Notes & Objectives (Optional)">
            <Textarea
              placeholder="Key topics to cover, prep materials..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              rows={2}
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
            Schedule Event
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
