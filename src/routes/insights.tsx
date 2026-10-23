import { createRoute } from '@tanstack/react-router'
import { BarChart2 } from 'lucide-react'
import { shellRoute } from './shell'
import { WorkspacePlaceholder } from '@/components/layout/WorkspacePlaceholder'

export const insightsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/insights',
  component: () => (
    <WorkspacePlaceholder
      icon={BarChart2}
      title="Insights"
      description="Patterns and trends across your time, habits, and progress — reflection without judgment."
      modules={[
        {
          title: 'Time & Focus Allocation',
          description: 'Visual distribution of focus hours and task completions across configured life domains.',
        },
        {
          title: 'Cross-Area Correlations',
          description: 'Observational patterns linking sleep consistency, academic output, and habit completion.',
        },
        {
          title: 'Long-Term Rhythm Analysis',
          description: 'Multi-week momentum curves and retrospective summaries designed for thoughtful personal growth.',
        },
      ]}
    />
  ),
})
