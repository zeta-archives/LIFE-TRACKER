import { type ReactNode } from 'react'

interface NavGroupProps {
  label: string
  action?: ReactNode
  children: ReactNode
}

export function NavGroup({ label, action, children }: NavGroupProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {/* Group label row — muted uppercase caption, Plus Jakarta Sans */}
      <div className="px-3 pt-3 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-text-muted font-sans select-none">
            {label}
          </span>
          {action}
        </div>
      </div>
      {/* Nav items */}
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  )
}
