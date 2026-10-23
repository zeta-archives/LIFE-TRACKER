import * as React from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const previousActiveElement = React.useRef<HTMLElement | null>(null)
  const dialogRef = React.useRef<HTMLDivElement>(null)

  // Focus restoration & body scroll lock
  React.useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement
      document.body.style.overflow = 'hidden'

      // Focus first focusable element inside dialog
      const timer = setTimeout(() => {
        if (dialogRef.current) {
          const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          )
          if (focusable.length > 0) {
            focusable[0].focus()
          } else {
            dialogRef.current.focus()
          }
        }
      }, 50)

      return () => {
        clearTimeout(timer)
      }
    } else {
      document.body.style.overflow = ''
      if (previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [open])

  // Escape key listener
  React.useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onOpenChange(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
        aria-hidden="true"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog container */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={cn(
          'relative z-10 w-full max-w-lg rounded-lg bg-bg-elevated border border-border p-6 shadow-2xl',
          'animate-in fade-in-0 zoom-in-95 duration-200',
          'focus:outline-none',
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}

export function DialogHeader({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('flex flex-col gap-1.5 pb-4 border-b border-border-subtle mb-4', className)}>
      {children}
    </div>
  )
}

export function DialogTitle({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <h2
      className={cn(
        'font-serif text-2xl text-text-primary font-normal tracking-tight leading-tight',
        className,
      )}
    >
      {children}
    </h2>
  )
}

export function DialogDescription({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <p className={cn('font-sans text-[13px] text-text-secondary leading-relaxed', className)}>
      {children}
    </p>
  )
}

export function DialogFooter({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-2.5 pt-4 border-t border-border-subtle mt-6',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function DialogCloseButton({
  onClose,
  className,
}: {
  onClose: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClose}
      className={cn(
        'absolute right-4 top-4 p-1.5 rounded-sm text-text-muted hover:text-text-primary hover:bg-white/[0.06]',
        'transition-colors duration-150',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
        className,
      )}
      aria-label="Close dialog"
    >
      <X className="w-4 h-4" />
    </button>
  )
}
