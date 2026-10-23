import { AlertCircle, Clock, CircleDot } from 'lucide-react'
import { type TaskPriorityCategory } from '@/data'
import { cn } from '@/lib/utils'

interface TaskPriorityBadgeProps {
  priority: TaskPriorityCategory
  size?: 'sm' | 'md'
  className?: string
}

export function TaskPriorityBadge({
  priority,
  size = 'sm',
  className,
}: TaskPriorityBadgeProps) {
  switch (priority) {
    case 'must_happen':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 font-sans font-semibold rounded',
            'bg-status-danger/15 text-status-danger border border-status-danger/30 shadow-xs',
            size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5',
            className,
          )}
          title="Must happen — Essential, highest-priority commitment"
        >
          <AlertCircle className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
          <span>Must happen</span>
        </span>
      )

    case 'should_happen':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 font-sans font-medium rounded',
            'bg-accent/15 text-accent border border-accent/30',
            size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5',
            className,
          )}
          title="Should happen — Important work to complete"
        >
          <Clock className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
          <span>Should happen</span>
        </span>
      )

    case 'could_happen':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 font-sans font-normal rounded',
            'bg-white/[0.04] text-text-secondary border border-border-subtle',
            size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5',
            className,
          )}
          title="Could happen — Optional work when capacity allows"
        >
          <CircleDot className="w-3 h-3 flex-shrink-0 opacity-70" aria-hidden="true" />
          <span>Could happen</span>
        </span>
      )
  }
}
