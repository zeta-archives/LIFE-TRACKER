import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import { AuthProvider, LifeAreasProvider, useAuth } from '@/data'

// Load approved fonts locally via Fontsource
import '@fontsource/instrument-serif/400.css'
import '@fontsource/plus-jakarta-sans/400.css'
import '@fontsource/plus-jakarta-sans/500.css'
import '@fontsource/plus-jakarta-sans/600.css'
import '@fontsource/plus-jakarta-sans/700.css'

// Base stylesheet with semantic design tokens and Tailwind directives
import './index.css'

function AppContent() {
  const auth = useAuth()

  // During initial session hydration from persistent storage, render the luminous sanctuary loader
  if (auth.isLoading) {
    return (
      <div className="min-h-screen w-full bg-bg-base flex flex-col items-center justify-center p-4 selection:bg-accent/20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center shadow-[0_0_24px_rgba(217,119,6,0.25)] animate-pulse">
            <div className="w-3.5 h-3.5 rounded-full bg-accent" />
          </div>
          <span className="font-serif text-2xl text-text-primary tracking-tight">Aether</span>
        </div>
      </div>
    )
  }

  return <RouterProvider router={router} context={{ auth }} />
}

export function App() {
  return (
    <AuthProvider>
      <LifeAreasProvider>
        <AppContent />
      </LifeAreasProvider>
    </AuthProvider>
  )
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Failed to find the root element in index.html')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
