import { createRoute, redirect } from '@tanstack/react-router'
import { rootRoute } from './root'
import { AppShell } from '@/components/layout/AppShell'

/**
 * Shell route: layout-only route that wraps all workspace routes.
 * Renders the AppShell (sidebar + main content region) via Outlet.
 * Enforces session authentication: unauthenticated visits redirect to /login.
 */
export const shellRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'shell',
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },
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
