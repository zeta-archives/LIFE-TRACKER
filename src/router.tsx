import { createRouter } from '@tanstack/react-router'
import { rootRoute } from './routes/root'
import { indexRoute } from './routes/index'
import { shellRoute, indexRedirectRoute } from './routes/shell'
import { todayRoute } from './routes/today'
import { calendarRoute } from './routes/calendar'
import { lifeOrbitRoute } from './routes/life-orbit'
import { goalsRoute } from './routes/goals'
import { streaksRoute } from './routes/streaks'
import { lifeSyncRoute } from './routes/life-sync'
import { insightsRoute } from './routes/insights'
import { lifeMapRoute } from './routes/life-map'
import { settingsRoute } from './routes/settings'
import { profileRoute } from './routes/profile'

// Shell subtree: all workspace routes rendered inside AppShell
const shellTree = shellRoute.addChildren([
  indexRedirectRoute,
  todayRoute,
  calendarRoute,
  lifeOrbitRoute,
  goalsRoute,
  streaksRoute,
  lifeSyncRoute,
  insightsRoute,
  lifeMapRoute,
  settingsRoute,
  profileRoute,
])

// Root tree: shell subtree + legacy index route (technical verification page)
const routeTree = rootRoute.addChildren([shellTree, indexRoute])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

// Register the router instance for type safety across the app
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
