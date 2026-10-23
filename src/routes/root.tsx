import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { AuthContextValue } from '@/data'

export interface MyRouterContext {
  auth: AuthContextValue
}

export const rootRoute = createRootRouteWithContext<MyRouterContext>()({
  component: () => <Outlet />,
})
