import { cn } from '@/lib/utils'

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

const sizeClasses = {
  sm: 'w-3.5 h-3.5 border-2',
  md: 'w-5 h-5 border-2',
  lg: 'w-7 h-7 border-[2.5px]',
}

export function Spinner({
  size = 'md',
  className,
  label = 'Loading...',
}: SpinnerProps) {
  return (
    <div
      role="status"
      className="inline-flex items-center justify-center"
      aria-label={label}
    >
      <div
        className={cn(
          'animate-spin rounded-full border-border border-t-accent',
          sizeClasses[size],
          className,
        )}
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}
