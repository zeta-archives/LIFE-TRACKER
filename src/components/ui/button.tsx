/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center font-sans font-medium select-none',
    'transition-colors duration-150',
    'disabled:pointer-events-none disabled:opacity-40',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
    'active:translate-y-[0.5px]',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-accent text-[#0A0B0D] font-semibold',
          'hover:bg-accent-hover',
          'active:bg-accent',
          'shadow-sm',
        ],
        secondary: [
          'bg-transparent text-text-primary',
          'border border-white/[0.12]',
          'hover:bg-white/[0.05] hover:border-white/[0.2]',
          'active:bg-white/[0.08]',
        ],
        ghost: [
          'bg-transparent text-text-secondary',
          'hover:bg-white/[0.04] hover:text-text-primary',
          'active:bg-white/[0.07]',
        ],
        destructive: [
          'bg-status-danger/10 text-status-danger',
          'border border-status-danger/25',
          'hover:bg-status-danger/20 hover:border-status-danger/40',
          'active:bg-status-danger/25',
        ],
        outline: [
          'bg-bg-elevated/40 text-text-primary',
          'border border-border',
          'hover:bg-bg-elevated hover:border-white/[0.16]',
          'active:bg-bg-overlay',
        ],
        subtle: [
          'bg-accent-subtle text-accent',
          'hover:bg-accent-subtle/80 hover:text-accent-hover',
          'active:bg-accent-subtle/60',
        ],
      },
      size: {
        sm: 'h-8 px-2.5 text-xs rounded-sm gap-1.5',
        md: 'h-9 px-3.5 text-[13px] rounded-md gap-2',
        lg: 'h-10 px-4 text-sm rounded-md gap-2.5',
        icon: 'h-9 w-9 p-0 rounded-md',
        'icon-sm': 'h-7 w-7 p-0 rounded-sm',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading = false, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && (
          <Loader2
            className="w-3.5 h-3.5 animate-spin flex-shrink-0"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
