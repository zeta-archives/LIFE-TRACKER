import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TooltipProps {
  content: string
  children: React.ReactElement
  className?: string
}

export function Tooltip({ content, children, className }: TooltipProps) {
  const [visible, setVisible] = React.useState(false)

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={cn(
            'pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50',
            'px-2 py-1 rounded-sm bg-bg-overlay border border-border text-[11px] font-sans font-medium text-text-primary whitespace-nowrap shadow-lg',
            'animate-in fade-in-0 zoom-in-95 duration-100',
            className,
          )}
        >
          {content}
        </div>
      )}
    </div>
  )
}
