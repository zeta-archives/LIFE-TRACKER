import { createRoute } from '@tanstack/react-router'
import { Orbit } from 'lucide-react'
import { shellRoute } from './shell'
import { WorkspacePlaceholder } from '@/components/layout/WorkspacePlaceholder'

export const lifeOrbitRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/life-orbit',
  component: () => (
    <WorkspacePlaceholder
      icon={Orbit}
      title="Life Orbit"
      description="A visual constellation of your life areas — see the shape, balance, and rhythm of your life at a glance."
      note="Life Orbit is an atmospheric navigation surface. Rendering technology (SVG, Canvas, or CSS 3D) will be confirmed at implementation."
      modules={[
        {
          title: 'Life Area Constellation',
          description: 'Spatially arranged orbital nodes representing each configured life domain and its relative activity.',
        },
        {
          title: 'Soul Orb Core Anchor',
          description: 'Atmospheric luminous core anchoring the intelligence layer and serving as ambient AI interaction point.',
        },
        {
          title: 'Dynamic Status Beacons',
          description: 'Derived health indicators reflecting attendance warnings, overdue commitments, and active streaks.',
        },
      ]}
    />
  ),
})
