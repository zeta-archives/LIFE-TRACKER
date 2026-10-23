import * as React from 'react'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  badge?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  badge,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'px-10 pt-10 pb-6 border-b border-border-subtle flex flex-col md:flex-row md:items-start md:justify-between gap-4',
        className,
      )}
    >
      <div className="flex items-start gap-3.5 max-w-2xl min-w-0">
        {Icon && (
          <span
            className="mt-1 flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-accent-subtle border border-accent/20"
            aria-hidden="true"
          >
            <Icon className="w-5 h-5 text-accent" />
          </span>
        )}
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-serif text-[32px] leading-tight text-text-primary font-normal tracking-tight">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="font-sans text-[14px] text-text-secondary leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0 self-start mt-1">
          {actions}
        </div>
      )}
    </header>
  )
}
