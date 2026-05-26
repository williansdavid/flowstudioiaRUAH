import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useRouter } from '@tanstack/react-router';
import {
  Calendar,
  CalendarDays,
  Users,
  Scissors,
  DollarSign,
  MessageSquare,
  LayoutDashboard,
  UserCog,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

import { toast } from 'sonner';
import { studioConfig } from '@/config/studio.config';
import type { SessionUser } from '@/lib/auth/types';
import { getRoleLabel } from '@/lib/auth/roles';
import { userHasPermission, type Permission } from '@/lib/auth/permissions';
import { logout } from '@/lib/auth/logout';

interface AdminLayoutProps {
  user: SessionUser;
}

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission: Permission;
};

const NAV_ITEMS: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard.view' },
  { to: '/admin/appointments', label: 'Agendamentos', icon: Calendar, permission: 'appointments.view' },
  { to: '/admin/calendar', label: 'Calendário', icon: CalendarDays, permission: 'appointments.view' },
  { to: '/admin/clients', label: 'Clientes', icon: Users, permission: 'clients.view' },
  { to: '/admin/services', label: 'Serviços', icon: Scissors, permission: 'services.view' },
  { to: '/admin/staff', label: 'Equipe', icon: UserCog, permission: 'team.manage' },
  { to: '/admin/finance', label: 'Financeiro', icon: DollarSign, permission: 'finance.view' },
  { to: '/admin/whatsapp', label: 'WhatsApp', icon: MessageSquare, permission: 'whatsapp.view' },
  { to: '/admin/settings', label: 'Configurações', icon: Settings, permission: 'settings.manage' },
];

function getInitials(fullName: string | null, email: string | null): string {
  const source = (fullName?.trim() || email?.trim() || '').trim();
  if (!source) return '?';
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0];
  if (!first) return '?';
  if (parts.length === 1) return first.slice(0, 2).toUpperCase() || '?';
  const last = parts[parts.length - 1];
  const firstChar = first[0] ?? '';
  const lastChar = last?.[0] ?? '';
  return (firstChar + lastChar).toUpperCase() || '?';
}

function getUserLabel(user: SessionUser): string {
  return user.fullName?.trim() || user.email?.trim() || 'Usuário';
}

export function AdminLayout({ user }: AdminLayoutProps) {
  const navigate = useNavigate();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const visibleNavItems = NAV_ITEMS.filter((item) =>
    userHasPermission(user, item.permission),
  );

  useEffect(() => {
    if (!drawerOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [drawerOpen]);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      await router.invalidate();
      toast.success('Sessão encerrada com sucesso');
      navigate({ to: '/login' });
    } catch (err) {
      console.error('[AdminLayout] logout falhou:', err);
      toast.error('Não foi possível encerrar a sessão. Tente novamente.');
      setLoggingOut(false);
    }
  }

  const initials = getInitials(user.fullName, user.email);
  const userLabel = getUserLabel(user);

  return (
    <div className="flex min-h-screen bg-bg-page text-text-default">
      {/* === SIDEBAR DESKTOP === */}
      <aside className="hidden w-60 flex-col border-r border-border-subtle bg-sidebar md:flex">
        <SidebarContent
          user={user}
          userLabel={userLabel}
          initials={initials}
          visibleNavItems={visibleNavItems}
          onLogout={handleLogout}
          loggingOut={loggingOut}
          onNavigate={() => {}}
        />
      </aside>

      {/* === DRAWER MOBILE === */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-border-subtle bg-sidebar md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
          >
            <SidebarContent
              user={user}
              userLabel={userLabel}
              initials={initials}
              visibleNavItems={visibleNavItems}
              onLogout={handleLogout}
              loggingOut={loggingOut}
              onNavigate={() => setDrawerOpen(false)}
              showClose
              onClose={() => setDrawerOpen(false)}
            />
          </aside>
        </>
      )}

      {/* === ÁREA PRINCIPAL === */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header mobile */}
        <header className="flex items-center justify-between border-b border-border-subtle bg-bg-card px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="rounded-md p-2 text-text-subtle transition-colors hover:bg-brand-500/[0.08] hover:text-brand-400"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <img
            src={studioConfig.branding.logoUrl}
            alt={studioConfig.name}
            className="h-7"
          />
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/[0.12] text-xs font-semibold text-brand-400 ring-1 ring-brand-500/30"
            aria-label={userLabel}
          >
            {initials}
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

// ============================================
// Sidebar content (desktop + mobile drawer)
// ============================================
interface SidebarContentProps {
  user: SessionUser;
  userLabel: string;
  initials: string;
  visibleNavItems: NavItem[];
  onLogout: () => void;
  loggingOut: boolean;
  onNavigate: () => void;
  showClose?: boolean;
  onClose?: () => void;
}

function SidebarContent({
  user,
  userLabel,
  initials,
  visibleNavItems,
  onLogout,
  loggingOut,
  onNavigate,
  showClose,
  onClose,
}: SidebarContentProps) {
  return (
    <>
      {/* Logo header */}
      <div className="flex items-center justify-between border-b border-sidebar-border px-6 py-5">
        <img
          src={studioConfig.branding.logoUrl}
          alt={studioConfig.name}
          className="h-8 w-auto"
        />
        {showClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-sidebar-fg-muted transition-colors hover:bg-brand-500/[0.08] hover:text-brand-400"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
        aria-label="Navegação administrativa"
      >
        {visibleNavItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={[
              'group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium',
              'text-sidebar-fg-muted',
              'transition-all duration-150',
              'hover:bg-brand-500/[0.05] hover:text-sidebar-fg',
            ].join(' ')}
            activeProps={{
              className: [
                '!bg-brand-500/[0.08]',
                '!text-brand-400',
                'before:absolute before:left-0 before:top-1/2',
                'before:h-6 before:w-[3px]',
                'before:-translate-y-1/2 before:rounded-r-sm',
                'before:bg-brand-500',
                'before:shadow-[0_0_8px_oklch(0.72_0.12_80/.5)]',
              ].join(' '),
            }}
            activeOptions={{ exact: to === '/admin' }}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-sidebar-border px-4 py-4">
        <div className="mb-3 flex items-center gap-3">
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-500/[0.12] text-xs font-semibold text-brand-400 ring-1 ring-brand-500/30"
            aria-hidden="true"
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-sidebar-fg">
              {userLabel}
            </div>
            <div className="truncate text-[10px] font-semibold uppercase tracking-[0.1em] text-brand-400/80">
              {getRoleLabel(user.role)}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          className={[
            'flex w-full items-center justify-center gap-2 rounded-md',
            'border border-sidebar-border bg-transparent',
            'px-3 py-2 text-sm font-medium text-sidebar-fg-muted',
            'transition-all duration-150',
            'hover:border-brand-500/40 hover:bg-brand-500/[0.05] hover:text-brand-400',
            'disabled:cursor-not-allowed disabled:opacity-50',
          ].join(' ')}
        >
          <LogOut className="h-4 w-4" />
          {loggingOut ? 'Saindo...' : 'Sair'}
        </button>
      </div>
    </>
  );
}
