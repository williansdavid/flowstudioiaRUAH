import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { SidebarItem } from './SidebarItem';
import { getGroupedNavItemsForRole } from '../config/nav-items';
import { branding } from '@/config/active-studio';
import type { SessionData } from '@/features/auth/types';

// ─── Cores do sistema ───────────────────────────────────────
const COLORS = {
  bgStart: '#070E1B',     // topo do gradiente diagonal
  bgEnd: '#0C1327',       // base do gradiente diagonal
  surface: '#16232E',     // superfícies / hover
  border: '#192335',      // bordas sutis
  textMuted: '#64748B',   // texto secundário (slate-500)
  textHeading: '#F1F5F9', // títulos (slate-100)
  textBody: '#94A3B8',    // texto corrido (slate-400)
  active: '#1895AD',      // ciano — destaque
  danger: '#EF4444',      // vermelho — hover do botão sair
} as const;
// ────────────────────────────────────────────────────────────

interface SidebarProps {
  session: SessionData;
  studioName: string;
  onSignOut: () => void;
  isSigningOut: boolean;
  onNavigate?: () => void;
}

export function Sidebar({
  session,
  studioName,
  onSignOut,
  isSigningOut,
  onNavigate,
}: SidebarProps) {
  const role = session.profile.role;
  const groups = getGroupedNavItemsForRole(role);
  const displayName = session.profile.full_name ?? session.email;
  const avatarUrl = session.profile.avatar_url;

  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(avatarUrl) && !imgFailed;
  const initial = (displayName ?? '?').charAt(0).toUpperCase();

  
  

  return (
    <div
      className="flex h-full flex-col border-r backdrop-blur-xl"
style={{
  background: `linear-gradient(135deg, ${COLORS.bgStart} 0%, ${COLORS.bgEnd} 100%)`,
  borderColor: COLORS.border,
}}
    >
      {/* Brand */}
      <div
        className="flex h-16 items-center gap-3 border-b px-5"
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
          style={{
            fontFamily: 'var(--font-heading)',
            color: COLORS.textHeading,
          }}
        >
          {studioName}
        </span>
      </div>

      {/* Nav agrupado */}
      <nav className="flex-1 space-y-5 overflow-y-auto p-3 pt-4">
        {groups.map((group) => (
          <div key={group.section} className="space-y-1">
            {/* Título da seção com linhas decorativas */}
            <div className="flex items-center gap-2 px-3 pb-1.5">
              <span
                className="h-px flex-1"
                style={{
                  background: `linear-gradient(90deg, ${COLORS.border} 0%, transparent 100%)`,
                }}
              />
              <p
                className="text-[10px] font-bold uppercase tracking-[0.15em]"
                style={{ color: COLORS.textMuted }}
              >
                {group.section}
              </p>
              <span
                className="h-px flex-1"
                style={{
                  background: `linear-gradient(270deg, ${COLORS.border} 0%, transparent 100%)`,
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

      {/* Footer: usuário + sair */}
      <div
        className="relative mx-3 mb-3 mt-2 flex items-center gap-3 rounded-xl border p-3"
        style={{
          borderColor: COLORS.border,
          background: `linear-gradient(135deg, ${COLORS.surface} 0%, transparent 100%)`,
        }}
      >
        {/* Avatar com glow */}
        <div className="relative shrink-0">
          {showImage ? (
            <>
              <img
                src={avatarUrl ?? undefined}
                alt={displayName ?? 'Avatar'}
                onError={() => setImgFailed(true)}
                className="relative h-9 w-9 rounded-full object-cover"
                style={{ backgroundColor: COLORS.surface }}
              />
              <span
              aria-hidden
              className="absolute -inset-0.5 rounded-full opacity-80 blur-sm"
              />
            </>
          ) : (
            <div
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold"
              style={{
                backgroundColor: COLORS.surface,
                color: COLORS.textHeading,
              }}
            >
              {initial}
              <span
                aria-hidden
                className="absolute -inset-0.5 rounded-full opacity-30 blur-sm"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.active}, transparent)`,
                }}
              />
            </div>
          )}
        </div>

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
            {role}
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
    </div>
  );
}