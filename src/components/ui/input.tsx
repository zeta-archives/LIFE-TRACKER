import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', invalid = false, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          'flex h-9 w-full rounded-md px-3 py-1.5 font-sans text-[13px] text-text-primary',
          'bg-bg-elevated border border-border shadow-inner/10',
          'placeholder:text-text-muted',
          'transition-colors duration-150',
          // Hover state
          'hover:border-white/[0.14]',
          // Focus state: amber ring, matches 10-12px radius harmony
          'focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent',
          // Invalid state
          invalid &&
            'border-status-danger text-status-danger focus-visible:border-status-danger focus-visible:ring-status-danger',
          // Disabled state
          'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border',
          className,
        )}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'
