import * as React from 'react'
import { Label } from './label'
import { cn } from '@/lib/utils'

export interface FormFieldProps {
  id: string
  label?: string
  required?: boolean
  helperText?: string
  error?: string
  children: React.ReactElement<{
    id?: string
    invalid?: boolean
    'aria-describedby'?: string
  }>
  className?: string
}

export function FormField({
  id,
  label,
  required,
  helperText,
  error,
  children,
  className,
}: FormFieldProps) {
  const helperId = helperText ? `${id}-helper` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)}>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}
      {React.cloneElement(children, {
        id,
        invalid: Boolean(error),
        'aria-describedby': describedBy,
      })}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="font-sans text-[11px] text-status-danger font-medium tracking-tight mt-0.5"
        >
          {error}
        </p>
      )}
      {!error && helperText && (
        <p
          id={helperId}
          className="font-sans text-[11px] text-text-muted mt-0.5"
        >
          {helperText}
        </p>
      )}
    </div>
  )
}
