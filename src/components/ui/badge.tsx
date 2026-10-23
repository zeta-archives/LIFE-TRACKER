/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const badgeVariants = cva(
  'inline-flex items-center font-sans font-medium transition-colors select-none tracking-wide',
  {
    variants: {
      variant: {
        default: 'bg-white/[0.06] text-text-secondary border border-border',
        accent: 'bg-accent-subtle text-accent border border-accent/20',
        success: 'bg-status-success/[0.12] text-status-success border border-status-success/25',
        warning: 'bg-status-warning/[0.12] text-status-warning border border-status-warning/25',
        danger: 'bg-status-danger/[0.12] text-status-danger border border-status-danger/25',
        outline: 'border border-border text-text-muted bg-transparent',
      },
      size: {
        sm: 'text-[10px] px-1.5 py-0.5 rounded-sm',
        md: 'text-[11px] px-2 py-0.5 rounded-sm',
        pill: 'text-[11px] px-2.5 py-0.5 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}
