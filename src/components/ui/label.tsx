import * as React from 'react'
import { cn } from '@/lib/utils'

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'font-sans text-[12px] font-medium text-text-secondary select-none inline-flex items-center gap-1',
          'cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
          className,
        )}
        {...props}
      >
        <span>{children}</span>
        {required && (
          <span className="text-accent text-[11px]" aria-hidden="true">
            *
          </span>
        )}
      </label>
    )
  },
)

Label.displayName = 'Label'
