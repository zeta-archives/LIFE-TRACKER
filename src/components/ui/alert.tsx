import * as React from 'react'
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger'

export interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: React.ReactNode
  onDismiss?: () => void
  className?: string
}

const variantStyles: Record<
  AlertVariant,
  {
    container: string
    iconColor: string
    icon: typeof Info
  }
> = {
  info: {
    container: 'bg-white/[0.03] border-border text-text-primary',
    iconColor: 'text-accent',
    icon: Info,
  },
  success: {
    container: 'bg-status-success/[0.08] border-status-success/30 text-text-primary',
    iconColor: 'text-status-success',
    icon: CheckCircle2,
  },
  warning: {
    // Distinct status-warning amber, not primary action amber
    container: 'bg-status-warning/[0.08] border-status-warning/30 text-text-primary',
    iconColor: 'text-status-warning',
    icon: AlertTriangle,
  },
  danger: {
    container: 'bg-status-danger/[0.08] border-status-danger/30 text-text-primary',
    iconColor: 'text-status-danger',
    icon: AlertOctagon,
  },
}

export function Alert({
  variant = 'info',
  title,
  children,
  onDismiss,
  className,
}: AlertProps) {
  const current = variantStyles[variant]
  const Icon = current.icon

  return (
    <div
      role="alert"
      className={cn(
        'relative flex items-start gap-3 p-3.5 rounded-md border text-[13px] font-sans leading-relaxed',
        current.container,
        className,
      )}
    >
      <Icon
        className={cn('w-4 h-4 mt-0.5 flex-shrink-0', current.iconColor)}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        {title && (
          <div className="font-semibold text-text-primary mb-0.5 tracking-tight">
            {title}
          </div>
        )}
        <div className="text-text-secondary leading-normal">{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 p-1 -mr-1 -mt-1 rounded-sm text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          aria-label="Dismiss alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
