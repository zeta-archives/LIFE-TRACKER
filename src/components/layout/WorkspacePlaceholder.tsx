import { type LucideIcon } from 'lucide-react'

export interface PlannedModule {
  title: string
  description: string
}

interface WorkspacePlaceholderProps {
  icon: LucideIcon
  title: string
  description?: string
  /** Optional additional context shown beneath the description. */
  note?: string
  /** Planned capabilities/modules documented in FEATURES.md. */
  modules?: PlannedModule[]
}

/**
 * Minimal placeholder view for workspace routes not yet implemented.
 *
 * Establishes identity and communicates the workspace's purpose without
 * fabricating functional content. The visual weight is deliberately restrained —
 * this is an intentionally unfinished workspace within a polished application,
 * not an empty page and not a fake dashboard.
 *
 * Design rules respected:
 * - Instrument Serif for the expressive page heading only.
 * - Plus Jakarta Sans for all functional text (description, note, label, list items).
 * - Anti-card principle: no card wrappers; linear rows on the canvas separated by subtle hairlines.
 * - Consistent horizontal content lane (max-w-2xl) and vertical rhythm.
 * - Dark sanctuary tokens: bg-bg, elevated surfaces, subtle borders, restrained amber accent.
 */
export function WorkspacePlaceholder({
  icon: Icon,
  title,
  description,
  note,
  modules,
}: WorkspacePlaceholderProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-bg">
      {/* ── Page Header ── */}
      <header className="px-10 pt-10 pb-8 border-b border-border-subtle">
        <div className="max-w-2xl flex items-start gap-4">
          {/* Workspace icon badge */}
          <span
            className="mt-1 flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-accent-subtle border border-accent/20"
            aria-hidden="true"
          >
            <Icon className="w-5 h-5 text-accent" />
          </span>

          {/* Title + description */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <h1 className="font-serif text-[32px] leading-tight text-text-primary font-normal tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="font-sans text-[14px] text-text-secondary leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Workspace Canvas ── */}
      <div className="flex-1 px-10 py-8 overflow-y-auto">
        <div className="max-w-2xl flex flex-col gap-8">
          {/* Optional context note */}
          {note && (
            <p className="font-sans text-[13px] text-text-muted leading-relaxed">
              {note}
            </p>
          )}

          {/* Planned Structure — open list following the anti-card principle */}
          {modules && modules.length > 0 && (
            <section aria-labelledby="planned-structure-heading">
              <h2
                id="planned-structure-heading"
                className="text-[11px] font-sans font-semibold uppercase tracking-widest text-text-muted mb-3 select-none"
              >
                Planned Capabilities
              </h2>
              <div className="divide-y divide-border-subtle border-t border-b border-border-subtle">
                {modules.map((m) => (
                  <div
                    key={m.title}
                    className="py-3 flex items-start justify-between gap-4 hover:bg-white/[0.02] transition-colors px-1 -mx-1 rounded"
                  >
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium font-sans text-text-primary">
                        {m.title}
                      </div>
                      <div className="text-[12px] font-sans text-text-secondary mt-0.5 leading-normal">
                        {m.description}
                      </div>
                    </div>
                    <span className="flex-shrink-0 text-[10px] font-sans uppercase tracking-wider text-text-muted/60 mt-0.5 select-none font-medium">
                      Specification
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Workspace Status Marker */}
          <div className="pt-2 flex items-center gap-3">
            <div className="h-px flex-1 bg-border-subtle" aria-hidden="true" />
            <span className="font-sans text-[11px] text-text-muted/40 uppercase tracking-widest select-none whitespace-nowrap">
              Feature implementation pending
            </span>
            <div className="h-px flex-1 bg-border-subtle" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  )
}
