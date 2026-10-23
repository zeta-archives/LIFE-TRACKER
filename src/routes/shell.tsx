import { createRoute, redirect } from '@tanstack/react-router'
import { rootRoute } from './root'
import { AppShell } from '@/components/layout/AppShell'

/**
 * Shell route: layout-only route that wraps all workspace routes.
 * Renders the AppShell (sidebar + main content region) via Outlet.
 * Redirects the application root (/) to /today.
 */
export const shellRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'shell',
  component: AppShell,
})

/**
 * Index redirect: navigating to / redirects to /today.
 * Keeps the root path functional without duplicating the Today workspace.
 */
export const indexRedirectRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/today' })
  },
})
