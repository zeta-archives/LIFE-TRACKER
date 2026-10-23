import { createRoute } from '@tanstack/react-router'
import { LayoutDashboard } from 'lucide-react'
import { shellRoute } from './shell'
import { WorkspacePlaceholder } from '@/components/layout/WorkspacePlaceholder'

export const todayRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/today',
  component: () => (
    <WorkspacePlaceholder
      icon={LayoutDashboard}
      title="Today"
      description="Your daily operational command center — tasks, schedule, and focus sessions for today."
      note="Today is the first workspace to be implemented (Checkpoint 4.3). It will consume canonical records from the domain layer."
      modules={[
        {
          title: 'Daily Task Matrix',
          description: 'Tasks due today or scheduled for today, surfaced from the canonical Task model.',
        },
        {
          title: 'Timetable & Scheduled Activities',
          description: 'Class blocks, study sessions, and commitments mapped directly from your schedule.',
        },
        {
          title: 'Urgent Alerts & Warnings',
          description: 'Contextual notifications for at-risk streaks, attendance thresholds, and calendar conflicts.',
        },
      ]}
    />
  ),
})
