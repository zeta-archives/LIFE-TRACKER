import { type ReactNode } from 'react'

interface NavGroupProps {
  label: string
  children: ReactNode
}

export function NavGroup({ label, children }: NavGroupProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {/* Group label — muted uppercase caption, Plus Jakarta Sans */}
      <span className="px-3 pt-3 pb-1 text-[10px] font-semibold tracking-widest uppercase text-text-muted font-sans select-none">
        {label}
      </span>
      {/* Nav items */}
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  )
}
