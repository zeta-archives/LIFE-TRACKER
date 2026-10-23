import { createRoute } from '@tanstack/react-router'
import { User } from 'lucide-react'
import { shellRoute } from './shell'
import { WorkspacePlaceholder } from '@/components/layout/WorkspacePlaceholder'

export const profileRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/profile',
  component: () => (
    <WorkspacePlaceholder
      icon={User}
      title="Profile"
      description="Your account identity, academic context, and personal operational parameters."
      modules={[
        {
          title: 'Academic Term & Schedule Context',
          description: 'Current term dates, exam horizons, and credit hour capacity tracking.',
        },
        {
          title: 'Personal Capacity Baseline',
          description: 'Target sleep allocation, daily study limits, and personal rest preferences.',
        },
        {
          title: 'Account & Authentication',
          description: 'Manage Supabase user profile, credentials, and connected sessions.',
        },
      ]}
    />
  ),
})
