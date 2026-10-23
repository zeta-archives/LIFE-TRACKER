import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onCheckedChange?: (checked: boolean) => void
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, defaultChecked, onChange, onCheckedChange, disabled, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState<boolean>(
      checked !== undefined ? Boolean(checked) : Boolean(defaultChecked),
    )

    React.useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(Boolean(checked))
      }
    }, [checked])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return
      const nextChecked = e.target.checked
      if (checked === undefined) {
        setIsChecked(nextChecked)
      }
      onChange?.(e)
      onCheckedChange?.(nextChecked)
    }

    return (
      <label
        className={cn(
          'relative inline-flex items-center justify-center w-4 h-4 rounded-sm cursor-pointer select-none',
          'border border-white/[0.16] bg-bg-elevated transition-colors duration-150',
          isChecked && 'bg-accent border-accent text-[#0A0B0D]',
          disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
          className,
        )}
      >
        <input
          type="checkbox"
          ref={ref}
          checked={isChecked}
          disabled={disabled}
          onChange={handleChange}
          className="peer sr-only"
          {...props}
        />
        {/* Amber focus ring on keyboard navigation */}
        <span
          className={cn(
            'pointer-events-none absolute -inset-0.5 rounded-sm',
            'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-accent peer-focus-visible:outline-offset-2',
          )}
          aria-hidden="true"
        />
        <Check
          className={cn(
            'w-3 h-3 stroke-[3] transition-transform duration-100',
            isChecked ? 'scale-100 opacity-100' : 'scale-75 opacity-0',
          )}
          aria-hidden="true"
        />
      </label>
    )
  },
)

Checkbox.displayName = 'Checkbox'
