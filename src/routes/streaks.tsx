import { createRoute } from '@tanstack/react-router'
import { Flame } from 'lucide-react'
import { shellRoute } from './shell'
import { WorkspacePlaceholder } from '@/components/layout/WorkspacePlaceholder'

export const streaksRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/streaks',
  component: () => (
    <WorkspacePlaceholder
      icon={Flame}
      title="Streaks"
      description="Build sustainable momentum through consistent habits tracked across your life areas."
      modules={[
        {
          title: 'Habit Consistency Tracker',
          description: 'Linear daily checklist and streak counters tracking routine completion without guilt mechanics.',
        },
        {
          title: 'Flexible Recurrence Schedules',
          description: 'Configurable cadences (daily, weekdays, specific frequency) tailored to real student routines.',
        },
        {
          title: 'Grace & Recovery Mechanisms',
          description: 'Forgiving streak policies that encourage long-term adherence over fragile perfection.',
        },
      ]}
    />
  ),
})
