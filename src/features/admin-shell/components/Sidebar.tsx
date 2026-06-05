import { LogOut } from 'lucide-react';
import { SidebarItem } from './SidebarItem';
import { getGroupedNavItemsForRole } from '../config/nav-items';
import { branding } from '@/sites/ruah/config/branding';
import type { SessionData } from '@/features/auth/types';

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

  return (
    <div
      className="flex h-full flex-col border-r"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Brand */}
      <div
        className="flex h-16 items-center gap-3 border-b px-5"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-button)]"
          style={{
            backgroundColor: 'var(--color-surface-dark)',
            boxShadow: 'var(--shadow-accent)',
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
            color: 'var(--color-text-heading)',
          }}
        >
          {studioName}
        </span>
      </div>

      {/* Nav agrupado */}
      <nav className="flex-1 space-y-6 overflow-y-auto p-3">
        {groups.map((group) => (
          <div key={group.section} className="space-y-1">
            <p
              className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {group.section}
            </p>
            {group.items.map((item) => (
              <SidebarItem key={item.to} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        ))}
      </nav>

      {/* Footer: usuário + sair */}
      <div
        className="flex items-center gap-3 border-t p-3"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
          style={{
            backgroundColor: 'var(--color-surface-alt)',
            color: 'var(--color-text-heading)',
          }}
        >
          {(displayName ?? '?').charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-sm font-medium"
            style={{ color: 'var(--color-text-heading)' }}
          >
            {displayName}
          </p>
          <p
            className="truncate text-xs capitalize"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {role}
          </p>
        </div>
        <button
          onClick={onSignOut}
          disabled={isSigningOut}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-button)] border transition-colors disabled:opacity-60"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-body)',
          }}
          aria-label="Sair"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
