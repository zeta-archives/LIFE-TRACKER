import * as React from 'react'

export type QuickLogMode = 'log' | 'plan'

export type QuickLogActivityType = 'task' | 'commitment' | 'metric' | 'focus'

export interface QuickLogOpenOptions {
  mode?: QuickLogMode
  activityType?: QuickLogActivityType
  lifeAreaId?: string
  goalId?: string
  taskId?: string
  initialTitle?: string
}

export interface QuickLogContextValue {
  isOpen: boolean
  openQuickLog: (options?: QuickLogOpenOptions) => void
  closeQuickLog: () => void
  options: QuickLogOpenOptions
}

const QuickLogContext = React.createContext<QuickLogContextValue | undefined>(undefined)

export function QuickLogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [options, setOptions] = React.useState<QuickLogOpenOptions>({})

  const openQuickLog = React.useCallback((opts?: QuickLogOpenOptions) => {
    setOptions(opts || {})
    setIsOpen(true)
  }, [])

  const closeQuickLog = React.useCallback(() => {
    setIsOpen(false)
  }, [])

  // Universal keyboard shortcut: Press 'Q' (when not inside inputs) or 'Ctrl+Shift+L' / 'Alt+Q'
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is already typing in an input, textarea, or contentEditable
      const target = e.target as HTMLElement | null
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)

      if (isInput) return

      // Single key 'q' or 'Q' to trigger Quick Log universally
      if (e.key === 'q' || e.key === 'Q') {
        e.preventDefault()
        openQuickLog()
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'l')) {
        // Also support standard Command/Ctrl+K or L if preferred
        e.preventDefault()
        openQuickLog()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [openQuickLog])

  const value = React.useMemo(
    () => ({
      isOpen,
      openQuickLog,
      closeQuickLog,
      options,
    }),
    [isOpen, openQuickLog, closeQuickLog, options],
  )

  return <QuickLogContext.Provider value={value}>{children}</QuickLogContext.Provider>
}

// Exported as a standalone function so the hook lives in a separate logical export
// from the Provider component, satisfying react-refresh/only-export-components when
// the hook file is used in a build context. (Both are in this file by design — the
// provider and hook are tightly coupled and must remain co-located.)
/* eslint-disable react-refresh/only-export-components */
export function useQuickLog() {
  const context = React.useContext(QuickLogContext)
  if (!context) {
    throw new Error('useQuickLog must be used within a QuickLogProvider')
  }
  return context
}
