import { createRoute } from '@tanstack/react-router'
import { Settings } from 'lucide-react'
import { shellRoute } from './shell'
import { WorkspacePlaceholder } from '@/components/layout/WorkspacePlaceholder'

export const settingsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/settings',
  component: () => (
    <WorkspacePlaceholder
      icon={Settings}
      title="Settings"
      description="Configure life areas, notification thresholds, account preferences, and application storage."
      modules={[
        {
          title: 'Life Area Management',
          description: 'Add, reorder, and configure custom accents for your active life domains.',
        },
        {
          title: 'Notification & Urgency Thresholds',
          description: 'Set custom warning horizons for attendance percentages, streak freezes, and deadlines.',
        },
        {
          title: 'Storage & Sync Preferences',
          description: 'Manage Supabase data synchronization, offline cache persistence, and data export.',
        },
      ]}
    />
  ),
})
