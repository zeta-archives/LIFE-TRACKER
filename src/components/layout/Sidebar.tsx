import {
  CalendarDays,
  LayoutDashboard,
  Orbit,
  Target,
  Flame,
  RefreshCcw,
  BarChart2,
  Share2,
  Settings,
  User,
  Layers,
} from 'lucide-react'
import { NavGroup } from './NavGroup'
import { NavItem } from './NavItem'

export function Sidebar() {
  return (
    <aside
      className="
        w-60 flex-shrink-0 flex flex-col
        bg-bg-elevated border-r border-border
        h-screen sticky top-0
        overflow-y-auto
      "
      aria-label="Primary navigation"
    >
      {/* ── Wordmark / Logo ── */}
      <div className="flex items-center gap-2.5 px-4 pt-5 pb-3">
        <span className="font-serif text-[22px] leading-none text-text-primary tracking-tight select-none">
          Aether
        </span>
      </div>

      {/* ── Hairline separator ── */}
      <div className="mx-3 border-t border-border-subtle" />

      {/* ── Navigation Groups — follow DESIGN.md §2.1 exactly ── */}
      <nav className="flex-1 px-2 py-1 flex flex-col gap-0" aria-label="Workspace navigation">

        {/* Daily */}
        <NavGroup label="Daily">
          <NavItem to="/today" icon={LayoutDashboard} label="Today" />
          <NavItem to="/calendar" icon={CalendarDays} label="Calendar" />
        </NavGroup>

        {/* Explore */}
        <NavGroup label="Explore">
          <NavItem to="/life-orbit" icon={Orbit} label="Life Orbit" />
        </NavGroup>

        {/* Life Areas — placeholder; populated with configured areas at feature implementation */}
        <NavGroup label="Life Areas">
          <div className="px-3 py-1.5 flex items-center gap-2 text-[12px] font-sans text-text-muted/50 select-none">
            <Layers className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            <span>No areas configured yet</span>
          </div>
        </NavGroup>

        {/* Goals */}
        <NavGroup label="Goals">
          <NavItem to="/goals" icon={Target} label="Goals & Milestones" />
          <NavItem to="/streaks" icon={Flame} label="Streaks" />
        </NavGroup>

        {/* Intelligence */}
        <NavGroup label="Intelligence">
          <NavItem to="/life-sync" icon={RefreshCcw} label="Life Sync" />
          <NavItem to="/insights" icon={BarChart2} label="Insights" />
          <NavItem to="/life-map" icon={Share2} label="Life Map" />
        </NavGroup>

      </nav>

      {/* ── Bottom actions: Settings / Profile ── */}
      <div className="px-2 pb-4 flex flex-col gap-0.5">
        <div className="mx-1 mb-2 border-t border-border-subtle" />
        <NavItem to="/settings" icon={Settings} label="Settings" />
        <NavItem to="/profile" icon={User} label="Profile" />
      </div>
    </aside>
  )
}
