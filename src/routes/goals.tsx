import { createRoute } from '@tanstack/react-router'
import { Target } from 'lucide-react'
import { shellRoute } from './shell'
import { WorkspacePlaceholder } from '@/components/layout/WorkspacePlaceholder'

export const goalsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/goals',
  component: () => (
    <WorkspacePlaceholder
      icon={Target}
      title="Goals & Milestones"
      description="Define and track your long-term aspirations and the progressive milestones that mark your path."
      modules={[
        {
          title: 'Goal Hierarchy & Horizons',
          description: 'Multi-tiered goal planning linking long-term vision to monthly milestones and weekly deliverables.',
        },
        {
          title: 'Life Area Categorization',
          description: 'Explicit association of goals with life domains to maintain intentional equilibrium across priorities.',
        },
        {
          title: 'Canonical Task Linkage',
          description: 'Direct lineage linking daily tasks to the parent milestones they fulfill.',
        },
      ]}
    />
  ),
})
