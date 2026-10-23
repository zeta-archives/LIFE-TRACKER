import { createRoute } from '@tanstack/react-router'
import { Share2 } from 'lucide-react'
import { shellRoute } from './shell'
import { WorkspacePlaceholder } from '@/components/layout/WorkspacePlaceholder'

export const lifeMapRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/life-map',
  component: () => (
    <WorkspacePlaceholder
      icon={Share2}
      title="Life Map"
      description="An analytical relationship graph connecting your goals, tasks, habits, and life areas."
      note="Life Map uses a node-graph layout. The provisional library is @xyflow/react with dagre layout, evaluated at implementation."
      modules={[
        {
          title: 'Relational Graph Canvas',
          description: 'Interactive node-link graph mapping structural dependencies across all canonical records.',
        },
        {
          title: 'Impact Ripple Visualizer',
          description: 'Select any goal, milestone, or habit to illuminate all downstream tasks and connected life areas.',
        },
        {
          title: 'Domain Cluster Filtering',
          description: 'Focus exploration on specific life area sub-graphs or inspect cross-domain bridging nodes.',
        },
      ]}
    />
  ),
})
