import { createRoute } from '@tanstack/react-router'
import { RefreshCcw } from 'lucide-react'
import { shellRoute } from './shell'
import { WorkspacePlaceholder } from '@/components/layout/WorkspacePlaceholder'

export const lifeSyncRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/life-sync',
  component: () => (
    <WorkspacePlaceholder
      icon={RefreshCcw}
      title="Life Sync"
      description="Surface conflicts, schedule overlaps, and recovery imbalances across life areas before they compound."
      modules={[
        {
          title: 'Cross-Domain Conflict Detection',
          description: 'Intelligent surfacing of clashing commitments between academics, fitness, and personal events.',
        },
        {
          title: 'Schedule Density Warnings',
          description: 'Early identification of overloaded days with insufficient recovery or study margins.',
        },
        {
          title: 'Actionable Resolution Proposals',
          description: 'One-click scheduling adjustments to resolve conflicts without losing momentum.',
        },
      ]}
    />
  ),
})
