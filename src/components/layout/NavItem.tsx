import { useRouterState, Link } from '@tanstack/react-router'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItemProps {
  to: string
  icon: LucideIcon
  label: string
}

export function NavItem({ to, icon: Icon, label }: NavItemProps) {
  const { location } = useRouterState()
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to))

  return (
    <Link
      to={to}
      className={cn(
        // Base layout — Plus Jakarta Sans, functional UI text
        'flex items-center gap-2.5 px-3 py-[7px] rounded-md text-[13px] font-medium font-sans',
        // Transitions
        'transition-colors duration-150',
        // Inactive state
        'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]',
        // Active state — amber text + subtle amber wash; text-accent supersedes text-text-secondary
        isActive && 'text-accent bg-accent-subtle hover:bg-accent-subtle hover:text-accent',
        // Focus-visible keyboard ring (amber, offset)
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon
        className={cn(
          'w-4 h-4 flex-shrink-0',
          isActive ? 'text-accent' : 'text-text-muted',
        )}
        aria-hidden="true"
      />
      <span className="truncate">{label}</span>
    </Link>
  )
}
