import { createRoute } from '@tanstack/react-router'
import { CalendarDays } from 'lucide-react'
import { shellRoute } from './shell'
import { WorkspacePlaceholder } from '@/components/layout/WorkspacePlaceholder'

export const calendarRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/calendar',
  component: () => (
    <WorkspacePlaceholder
      icon={CalendarDays}
      title="Calendar"
      description="Time-oriented view of your schedule — planned commitments across days, weeks, and months."
      modules={[
        {
          title: 'Multi-Horizon Timeline',
          description: 'Unified calendar grid supporting day, week, and month exploration of scheduled commitments.',
        },
        {
          title: 'Class Timetable Overlay',
          description: 'Academic schedule blocks rendered alongside personal milestones and deadlines.',
        },
        {
          title: 'Direct Task Rescheduling',
          description: 'Adjust task scheduled dates directly on the timeline without leaving the calendar context.',
        },
      ]}
    />
  ),
})
