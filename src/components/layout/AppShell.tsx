import { Outlet } from '@tanstack/react-router'
import { Sidebar } from './Sidebar'

export function AppShell() {
  return (
    <div className="flex min-h-screen bg-bg text-text-primary font-sans antialiased">
      {/* ── Persistent Desktop Sidebar ── */}
      <Sidebar />

      {/* ── Main Content Region ── */}
      <main
        id="main-content"
        className="flex-1 flex flex-col min-w-0 overflow-y-auto"
        tabIndex={-1}
      >
        <Outlet />
      </main>
    </div>
  )
}
