import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className,
      checked,
      defaultChecked = false,
      onCheckedChange,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [isChecked, setIsChecked] = React.useState<boolean>(
      checked !== undefined ? checked : defaultChecked,
    )

    React.useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(checked)
      }
    }, [checked])

    const handleToggle = () => {
      if (disabled) return
      const nextChecked = !isChecked
      if (checked === undefined) {
        setIsChecked(nextChecked)
      }
      onCheckedChange?.(nextChecked)
    }

    return (
      <button
        type="button"
        role="switch"
        ref={ref}
        aria-checked={isChecked}
        disabled={disabled}
        onClick={handleToggle}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full p-0.5',
          'transition-colors duration-200 ease-in-out',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-40',
          isChecked ? 'bg-accent' : 'bg-white/[0.12] hover:bg-white/[0.16]',
          className,
        )}
        {...props}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm ring-0',
            'transition-transform duration-200 ease-in-out',
            isChecked ? 'translate-x-4 bg-[#0A0B0D]' : 'translate-x-0',
          )}
          aria-hidden="true"
        />
      </button>
    )
  },
)

Switch.displayName = 'Switch'
