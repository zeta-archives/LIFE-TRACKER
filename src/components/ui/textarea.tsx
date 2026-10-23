import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid = false, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          'flex min-h-[80px] w-full rounded-md px-3 py-2 font-sans text-[13px] text-text-primary',
          'bg-bg-elevated border border-border shadow-inner/10',
          'placeholder:text-text-muted',
          'transition-colors duration-150',
          'hover:border-white/[0.14]',
          'focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent',
          invalid &&
            'border-status-danger text-status-danger focus-visible:border-status-danger focus-visible:ring-status-danger',
          'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border',
          className,
        )}
        {...props}
      />
    )
  },
)

Textarea.displayName = 'Textarea'
