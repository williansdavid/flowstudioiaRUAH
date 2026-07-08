import { LogOut } from 'lucide-react'
import { SidebarItem } from '@/features/admin-shell/components/SidebarItem'
import { getGroupedClientNavItems } from '../config/nav-items'
import { branding } from '@/config/active-studio'
import type { SessionData } from '@/features/auth/types'

const COLORS = {
  bgStart: '#070E1B',
  bgEnd: '#0C1327',
  surface: '#16232E',
  border: '#192335',
  textMuted: '#64748B',
  textHeading: '#F1F5F9',
  textBody: '#94A3B8',
  active: '#1895AD',
} as const

interface SidebarProps {
  session: SessionData
  studioName: string
  onSignOut: () => void
  isSigningOut: boolean
  onNavigate?: () => void
}

export function Sidebar({
  session,
  studioName,
  onSignOut,
  isSigningOut,
  onNavigate,
}: SidebarProps) {
  const groups = getGroupedClientNavItems()
  const displayName = session.profile.full_name ?? session.email

  return (
    <aside
      className="flex h-full w-64 flex-col overflow-y-auto border-r"
      style={{
        backgroundColor: COLORS.bgStart,
        borderColor: COLORS.border,
        backgroundImage: `linear-gradient(135deg, ${COLORS.bgStart}, ${COLORS.bgEnd})`,
      }}
    >
      {/* Brand */}
      <div
        className="flex shrink-0 items-center gap-3 border-b px-5 py-4"
        style={{ borderColor: COLORS.border }}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl"
          style={{
            backgroundColor: COLORS.bgStart,
            boxShadow: `0 0 12px -4px ${COLORS.active}`,
          }}
        >
          <img
            src={branding.logo.dark}
            alt={branding.logo.alt}
            className="h-full w-full object-contain"
          />
        </div>
        <span
          className="truncate text-base font-semibold"
          style={{ color: COLORS.textHeading }}
        >
          {studioName}
        </span>
      </div>

      {/* Nav agrupado */}
      <nav className="flex-1 space-y-5 px-3 py-4">
        {groups.map((group) => (
          <div key={group.section}>
            <div className="flex items-center gap-3 px-3 pb-1.5">
              <div
                className="h-px flex-1"
                style={{
                  background: `linear-gradient(90deg, ${COLORS.border}, transparent)`,
                }}
              />
              <span
                className="text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: COLORS.textMuted }}
              >
                {group.section}
              </span>
              <div
                className="h-px flex-1"
                style={{
                  background: `linear-gradient(270deg, ${COLORS.border}, transparent)`,
                }}
              />
            </div>
            {group.items.map((item) => (
              <SidebarItem
                key={item.to}
                item={item}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* Footer: nome do usuário (sem avatar) + sair */}
      <div
        className="relative mx-3 mb-3 mt-2 flex items-center gap-3 rounded-xl border p-3"
        style={{
          borderColor: COLORS.border,
          background: `linear-gradient(135deg, ${COLORS.surface} 0%, transparent 100%)`,
        }}
      >
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-sm font-medium"
            style={{ color: COLORS.textHeading }}
          >
            {displayName}
          </p>
          <p
            className="truncate text-xs capitalize"
            style={{ color: COLORS.textMuted }}
          >
            {session.profile.role}
          </p>
        </div>
        <button
          onClick={onSignOut}
          disabled={isSigningOut}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all duration-200 hover:border-red-500/30 hover:text-red-400 disabled:opacity-60"
          style={{
            borderColor: COLORS.border,
            color: COLORS.textBody,
          }}
          aria-label="Sair"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  )
}