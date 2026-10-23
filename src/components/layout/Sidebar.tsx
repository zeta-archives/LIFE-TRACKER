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
  LogOut,
  GraduationCap,
  Activity,
  Briefcase,
  Moon,
  Users,
  Smile,
  Sparkles,
  BookOpen,
  Heart,
  Palette,
  Compass,
  Code,
  Dumbbell,
  Music,
  Globe,
  type LucideIcon,
} from 'lucide-react'
import { NavGroup } from './NavGroup'
import { NavItem } from './NavItem'
import { useAuth, useLifeAreas } from '@/data'

const iconMap: Record<string, LucideIcon> = {
  GraduationCap,
  Activity,
  Briefcase,
  Moon,
  Users,
  Smile,
  Layers,
  Sparkles,
  BookOpen,
  Heart,
  Palette,
  Compass,
  Code,
  Dumbbell,
  Music,
  Globe,
}

export function Sidebar() {
  const auth = useAuth()
  const { lifeAreas, isLoading: lifeAreasLoading } = useLifeAreas()

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

        {/* Life Areas — dynamically bound to persistent Supabase records */}
        <NavGroup label="Life Areas">
          {lifeAreasLoading ? (
            <div className="px-3 py-1.5 flex items-center gap-2 text-[12px] font-sans text-text-muted/60 select-none animate-pulse">
              <Layers className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Loading areas...</span>
            </div>
          ) : lifeAreas.length === 0 ? (
            <div className="px-3 py-1.5 flex items-center gap-2 text-[12px] font-sans text-text-muted/50 select-none">
              <Layers className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
              <span>No areas configured yet</span>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {lifeAreas.map((area) => {
                const IconComponent = iconMap[area.iconName] || Layers
                return (
                  <div
                    key={area.id}
                    className="px-3 py-1.5 flex items-center gap-2.5 text-[12.5px] font-sans text-text-secondary hover:text-text-primary hover:bg-white/[0.04] rounded-md transition-colors select-none"
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: area.accentColor }}
                      aria-hidden="true"
                    />
                    <IconComponent
                      className="w-3.5 h-3.5 flex-shrink-0 opacity-70"
                      aria-hidden="true"
                    />
                    <span className="truncate">{area.name}</span>
                  </div>
                )
              })}
            </div>
          )}
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

      {/* ── Bottom actions: Settings / Profile / Authenticated Session ── */}
      <div className="px-2 pb-3 flex flex-col gap-1">
        <div className="mx-1 mb-1 border-t border-border-subtle" />
        <NavItem to="/settings" icon={Settings} label="Settings" />
        <NavItem to="/profile" icon={User} label="Profile" />

        {auth.user && (
          <div className="mt-1.5 pt-2 border-t border-border-subtle/80 px-2 flex items-center justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <span className="text-[12px] font-medium text-text-primary truncate">
                {auth.user.fullName || auth.user.email.split('@')[0]}
              </span>
              <span className="text-[11px] text-text-muted truncate">
                {auth.user.email}
              </span>
            </div>
            <button
              type="button"
              onClick={() => auth.signOut()}
              title="Sign out of Aether"
              aria-label="Sign out"
              className="p-1.5 rounded-md text-text-muted hover:text-status-danger hover:bg-status-danger/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
