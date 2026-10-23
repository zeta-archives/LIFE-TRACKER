/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DatePickerProps {
  id?: string
  value?: string | null // Expected format: 'YYYY-MM-DD'
  onChange?: (date: string | null) => void
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  minDate?: string // 'YYYY-MM-DD'
  maxDate?: string // 'YYYY-MM-DD'
  className?: string
  ariaLabel?: string
}

export function parseDateParts(dateStr: string | null | undefined): {
  year: number
  month: number // 0-indexed (0 = Jan)
  day: number
} | null {
  if (!dateStr) return null
  const clean = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr
  const parts = clean.split('-')
  if (parts.length < 3) return null
  const y = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10) - 1
  const d = parseInt(parts[2], 10)
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null
  return { year: y, month: m, day: d }
}

export function toDateString(year: number, month: number, day: number): string {
  const y = String(year)
  const m = String(month + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatHumanDate(dateStr: string | null | undefined): string {
  const parsed = parseDateParts(dateStr)
  if (!parsed) return ''
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  return `${months[parsed.month]} ${parsed.day}, ${parsed.year}`
}

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = 'Select date...',
  disabled = false,
  clearable = true,
  minDate,
  maxDate,
  className,
  ariaLabel = 'Select date',
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Current view year & month (0-indexed)
  const today = React.useMemo(() => {
    const now = new Date()
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      day: now.getDate(),
      str: toDateString(now.getFullYear(), now.getMonth(), now.getDate()),
    }
  }, [])

  const selectedParts = React.useMemo(() => parseDateParts(value), [value])

  const [viewYear, setViewYear] = React.useState(() => selectedParts?.year ?? today.year)
  const [viewMonth, setViewMonth] = React.useState(() => selectedParts?.month ?? today.month)

  // Sync view month/year when value changes externally
  React.useEffect(() => {
    if (selectedParts) {
      setViewYear(selectedParts.year)
      setViewMonth(selectedParts.month)
    }
  }, [selectedParts])

  // Click outside listener
  React.useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  // Escape key listener
  React.useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const handleSelectDate = (dateString: string) => {
    onChange?.(dateString)
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(null)
  }

  const handleJumpToday = (e: React.MouseEvent) => {
    e.stopPropagation()
    setViewYear(today.year)
    setViewMonth(today.month)
    onChange?.(today.str)
    setOpen(false)
  }

  // Generate calendar days matrix
  const calendarDays = React.useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay() // 0 = Sun
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate()

    const days: {
      day: number
      month: number
      year: number
      dateStr: string
      isCurrentMonth: boolean
      isToday: boolean
      isSelected: boolean
      isDisabled: boolean
    }[] = []

    // Previous month overflow days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i
      const m = viewMonth === 0 ? 11 : viewMonth - 1
      const y = viewMonth === 0 ? viewYear - 1 : viewYear
      const dateStr = toDateString(y, m, d)
      days.push({
        day: d,
        month: m,
        year: y,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === today.str,
        isSelected: dateStr === value,
        isDisabled: Boolean(
          (minDate && dateStr < minDate) || (maxDate && dateStr > maxDate),
        ),
      })
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateStr = toDateString(viewYear, viewMonth, d)
      days.push({
        day: d,
        month: viewMonth,
        year: viewYear,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === today.str,
        isSelected: dateStr === value,
        isDisabled: Boolean(
          (minDate && dateStr < minDate) || (maxDate && dateStr > maxDate),
        ),
      })
    }

    // Next month overflow days (fill grid to multiple of 7, up to 42 cells)
    const remaining = (7 - (days.length % 7)) % 7
    for (let d = 1; d <= remaining; d++) {
      const m = viewMonth === 11 ? 0 : viewMonth + 1
      const y = viewMonth === 11 ? viewYear + 1 : viewYear
      const dateStr = toDateString(y, m, d)
      days.push({
        day: d,
        month: m,
        year: y,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === today.str,
        isSelected: dateStr === value,
        isDisabled: Boolean(
          (minDate && dateStr < minDate) || (maxDate && dateStr > maxDate),
        ),
      })
    }

    return days
  }, [viewYear, viewMonth, today.str, value, minDate, maxDate])

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  return (
    <div ref={containerRef} className={cn('relative inline-block w-full', className)}>
      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={cn(
          'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left',
          'bg-bg-base/70 border border-border text-sm font-sans',
          'hover:border-white/[0.16] hover:bg-bg-base transition-colors duration-150',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1',
          disabled && 'opacity-50 cursor-not-allowed hover:border-border hover:bg-bg-base/70',
          open && 'border-accent ring-1 ring-accent/30',
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <CalendarIcon className="w-4 h-4 text-accent/80 flex-shrink-0" aria-hidden="true" />
          <span
            className={cn(
              'truncate',
              value ? 'text-text-primary font-medium' : 'text-text-muted',
            )}
          >
            {value ? formatHumanDate(value) : placeholder}
          </span>
        </div>

        {clearable && Boolean(value) && !disabled ? (
          <span
            role="button"
            tabIndex={0}
            onClick={handleClear}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleClear(e as unknown as React.MouseEvent)
              }
            }}
            title="Clear date"
            aria-label="Clear selected date"
            className="p-1 -mr-1 rounded text-text-muted hover:text-text-primary hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        ) : null}
      </button>

      {/* Calendar Popup Dialog */}
      {open && (
        <div
          role="dialog"
          aria-label="Calendar date picker"
          className="
            absolute z-50 mt-1.5 w-64 p-3 rounded-xl
            bg-bg-elevated/95 backdrop-blur-md
            border border-border shadow-2xl
            font-sans text-text-primary
            animate-in fade-in-0 zoom-in-95 duration-150
          "
        >
          {/* Calendar Header: Month/Year navigation */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-subtle">
            <span className="text-xs font-semibold tracking-tight text-text-primary">
              {monthNames[viewMonth]} {viewYear}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next month"
                className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10.5px] font-medium text-text-muted pb-1">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((item) => {
              return (
                <button
                  key={item.dateStr}
                  type="button"
                  disabled={item.isDisabled}
                  onClick={() => !item.isDisabled && handleSelectDate(item.dateStr)}
                  className={cn(
                    'h-7 w-7 rounded-md text-[11px] font-sans flex items-center justify-center transition-colors',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent',
                    // Selected state
                    item.isSelected &&
                      'bg-accent text-bg-base font-semibold shadow-sm hover:bg-accent-hover',
                    // Today state (not selected)
                    !item.isSelected &&
                      item.isToday &&
                      'border border-accent/60 text-accent font-semibold',
                    // Standard current month state
                    !item.isSelected &&
                      !item.isToday &&
                      item.isCurrentMonth &&
                      'text-text-primary hover:bg-white/[0.08]',
                    // Other month overflow
                    !item.isSelected &&
                      !item.isToday &&
                      !item.isCurrentMonth &&
                      'text-text-muted/40 hover:text-text-muted hover:bg-white/[0.04]',
                    // Disabled
                    item.isDisabled && 'opacity-20 cursor-not-allowed hover:bg-transparent',
                  )}
                  title={item.dateStr}
                >
                  {item.day}
                </button>
              )
            })}
          </div>

          {/* Calendar Footer: Today Shortcut & Clear */}
          <div className="mt-2.5 pt-2 border-t border-border-subtle flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={handleJumpToday}
              className="text-accent hover:text-accent-hover font-medium transition-colors"
            >
              Today
            </button>

            {clearable && value && (
              <button
                type="button"
                onClick={handleClear}
                className="text-text-muted hover:text-status-danger transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
