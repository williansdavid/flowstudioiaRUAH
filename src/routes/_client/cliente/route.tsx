import { createFileRoute, Outlet, Link } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useSession, useSignOut } from '@/features/auth/hooks'
import { Sidebar } from '@/features/client-shell/components/Sidebar'
import { branding } from '@/config/active-studio'

export const Route = createFileRoute('/_client/cliente')({
  component: ClientLayout,
})

function ClientLayout() {
  const { data: session } = useSession()
  const signOut = useSignOut()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const studioName = branding.logo.alt

  if (!session) return null

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* ─── Overlay mobile ──────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* ─── Sidebar ──────────────────────────────────── */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0`}
      >
        <Sidebar
          session={session}
          studioName={studioName}
          onSignOut={() => signOut.mutate()}
          isSigningOut={signOut.isPending}
          onNavigate={closeSidebar}
        />
      </div>

      {/* ─── Conteúdo ─────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar com logo + nome do studio (sempre visível, igual admin) */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-800/60 bg-slate-950/90 px-4 backdrop-blur-xl">
          {/* Hamburger só no mobile */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center justify-center rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 lg:hidden"
            aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          {/* Logo + Nome do studio (whitelabel) */}
          <Link
            to="/cliente"
            className="flex items-center gap-2 text-sm font-semibold text-slate-100"
          >
            <img
              src={branding.logo.dark}
              alt={studioName}
              className="h-7 w-auto object-contain"
            />
            {studioName}
          </Link>
        </header>

        {/* Área de scroll do conteúdo */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto h-full max-w-7xl p-4 sm:p-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}