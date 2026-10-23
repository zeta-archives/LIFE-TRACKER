import * as React from 'react'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-4 max-w-md mx-auto',
        className,
      )}
    >
      <div
        className="w-11 h-11 rounded-lg bg-white/[0.04] border border-border flex items-center justify-center mb-4 text-text-muted"
        aria-hidden="true"
      >
        <Icon className="w-5 h-5 text-text-secondary" />
      </div>
      <h3 className="font-serif text-xl font-normal text-text-primary tracking-tight mb-1.5">
        {title}
      </h3>
      <p className="font-sans text-[13px] text-text-muted leading-relaxed mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  )
}
