import { createFileRoute, Outlet, Link, useRouter } from '@tanstack/react-router'
import { LogOut, ArrowLeftFromLine, CalendarCheck, Menu } from 'lucide-react'
import { useState } from 'react'
import { useSession, useSignOut } from '@/features/auth/hooks'

export const Route = createFileRoute('/_client/cliente')({
  component: ClientLayout,
})

function ClientLayout() {
  const { data: session } = useSession()
  const signOut = useSignOut()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const studioName = import.meta.env.VITE_STUDIO_NAME ?? 'FlowStudio'
  const firstName = session?.profile?.full_name?.split(' ')[0] ?? 'Cliente'

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      {/* ─── Topbar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-slate-800/60 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          {/* Logo + nome do studio */}
          <Link to="/cliente" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <span className="text-sm font-bold">FS</span>
            </div>
            <span className="hidden text-sm font-semibold sm:inline">
              {studioName}
            </span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden items-center gap-4 sm:flex">
            <Link
              to="/cliente/agendamentos"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
              activeProps={{ className: 'bg-slate-800/60 text-cyan-400' }}
            >
              <CalendarCheck className="h-4 w-4" />
              Meus agendamentos
            </Link>

            <a
              href="/"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
            >
              <ArrowLeftFromLine className="h-4 w-4" />
              Voltar ao site
            </a>

            <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
              <span className="text-sm text-slate-300">
                Olá, <span className="font-medium">{firstName}</span>
              </span>
              <button
                onClick={() => signOut.mutate()}
                disabled={signOut.isPending}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                aria-label="Sair"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </nav>

          {/* Mobile: hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center gap-2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 sm:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-800/60 bg-slate-950 sm:hidden">
            <div className="space-y-1 px-4 py-3">
              <div className="mb-3 px-3 text-sm text-slate-300">
                Olá, <span className="font-medium">{firstName}</span>
              </div>
              <Link
                to="/cliente/agendamentos"
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition hover:bg-slate-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                <CalendarCheck className="h-4 w-4" />
                Meus agendamentos
              </Link>
              <a
                href="/"
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition hover:bg-slate-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ArrowLeftFromLine className="h-4 w-4" />
                Voltar ao site
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  signOut.mutate()
                }}
                disabled={signOut.isPending}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                {signOut.isPending ? 'Saindo...' : 'Sair'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ─── Conteúdo ─────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto h-full max-w-7xl p-4 sm:p-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}