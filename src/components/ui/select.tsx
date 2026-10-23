import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid = false, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          aria-invalid={invalid || undefined}
          className={cn(
            'flex h-9 w-full appearance-none rounded-md px-3 pr-8 py-1.5 font-sans text-[13px] text-text-primary',
            'bg-bg-elevated border border-border shadow-inner/10',
            'transition-colors duration-150',
            'hover:border-white/[0.14]',
            'focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent',
            invalid &&
              'border-status-danger text-status-danger focus-visible:border-status-danger focus-visible:ring-status-danger',
            'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
          aria-hidden="true"
        />
      </div>
    )
  },
)

Select.displayName = 'Select'
