import * as React from 'react'
import { cn } from '@/lib/utils'

export interface DropdownMenuContextValue {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(
  null,
)

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  // Close when clicking outside
  React.useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  // Escape key handler
  React.useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div ref={menuRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

export function DropdownMenuTrigger({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const context = React.useContext(DropdownMenuContext)
  if (!context) throw new Error('DropdownMenuTrigger must be used within DropdownMenu')

  return (
    <div
      onClick={() => context.setOpen((prev) => !prev)}
      className={cn('inline-flex cursor-pointer', className)}
      aria-haspopup="menu"
      aria-expanded={context.open}
    >
      {children}
    </div>
  )
}

export function DropdownMenuContent({
  children,
  align = 'left',
  className,
}: {
  children: React.ReactNode
  align?: 'left' | 'right'
  className?: string
}) {
  const context = React.useContext(DropdownMenuContext)
  if (!context) throw new Error('DropdownMenuContent must be used within DropdownMenu')

  if (!context.open) return null

  return (
    <div
      role="menu"
      aria-orientation="vertical"
      className={cn(
        'absolute z-50 mt-1.5 min-w-[180px] rounded-md bg-bg-elevated border border-border p-1 shadow-xl',
        'animate-in fade-in-0 zoom-in-95 duration-150',
        align === 'right' ? 'right-0' : 'left-0',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function DropdownMenuItem({
  children,
  onClick,
  destructive = false,
  disabled = false,
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  destructive?: boolean
  disabled?: boolean
  className?: string
}) {
  const context = React.useContext(DropdownMenuContext)

  const handleClick = () => {
    if (disabled) return
    onClick?.()
    context?.setOpen(false)
  }

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'flex w-full items-center gap-2 px-2.5 py-1.5 rounded-sm font-sans text-[13px] text-text-primary text-left',
        'transition-colors duration-100 select-none',
        'hover:bg-white/[0.05]',
        'focus-visible:outline-none focus-visible:bg-white/[0.06]',
        destructive &&
          'text-status-danger hover:bg-status-danger/10 focus-visible:bg-status-danger/10',
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function DropdownMenuSeparator() {
  return <div className="my-1 border-t border-border-subtle" />
}
