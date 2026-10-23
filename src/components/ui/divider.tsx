import * as React from 'react'
import { cn } from '@/lib/utils'

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'
  label?: string
}

export function Divider({
  orientation = 'horizontal',
  label,
  className,
  ...props
}: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn('w-px h-full bg-border-subtle shrink-0', className)}
        {...props}
      />
    )
  }

  if (label) {
    return (
      <div
        role="separator"
        className={cn('flex items-center gap-3 my-4', className)}
        {...props}
      >
        <div className="h-px flex-1 bg-border-subtle" />
        <span className="font-sans text-[11px] text-text-muted/60 uppercase tracking-widest select-none whitespace-nowrap font-medium">
          {label}
        </span>
        <div className="h-px flex-1 bg-border-subtle" />
      </div>
    )
  }

  return (
    <div
      role="separator"
      className={cn('w-full h-px bg-border-subtle my-2 shrink-0', className)}
      {...props}
    />
  )
}
