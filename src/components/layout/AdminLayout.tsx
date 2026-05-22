import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useRouter } from '@tanstack/react-router';
import {
  Calendar,
  Users,
  Scissors,
  DollarSign,
  MessageSquare,
  LayoutDashboard,
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
  { to: '/admin/clients', label: 'Clientes', icon: Users, permission: 'clients.view' },
  { to: '/admin/services', label: 'Serviços', icon: Scissors, permission: 'services.view' },
  { to: '/admin/finance', label: 'Financeiro', icon: DollarSign, permission: 'finance.view' },
  { to: '/admin/whatsapp', label: 'WhatsApp', icon: MessageSquare, permission: 'whatsapp.view' },
];

/**
 * Extrai iniciais de um nome ou email.
 * Defensivo: lida com null, strings vazias e tsconfig estrito.
 */
function getInitials(fullName: string | null, email: string | null): string {
  const source = (fullName?.trim() || email?.trim() || '').trim();
  if (!source) return '?';

  const parts = source.split(/[\s@.]+/).filter(Boolean);
  if (parts.length === 0) return '?';

  const first = parts[0];
  if (!first) return '?';

  if (parts.length === 1) {
    return first.slice(0, 2).toUpperCase() || '?';
  }

  const last = parts[parts.length - 1];
  const firstChar = first[0] ?? '';
  const lastChar = last?.[0] ?? '';
  const initials = (firstChar + lastChar).toUpperCase();
  return initials || '?';
}

/**
 * Label legível do usuário (nome > email > fallback).
 */
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

  // Fecha drawer ao pressionar ESC
  useEffect(() => {
    if (!drawerOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [drawerOpen]);

  // Bloqueia scroll do body quando drawer está aberto
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
    <div className="flex min-h-screen bg-neutral-50">
      {/* === SIDEBAR DESKTOP === */}
      <aside className="hidden w-64 flex-col border-r bg-white md:flex">
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
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-white md:hidden"
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
        {/* Header mobile com hamburger */}
        <header className="flex items-center justify-between border-b bg-white px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="rounded-lg p-2 hover:bg-neutral-100"
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
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-medium text-white"
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
// Subcomponente: conteúdo da sidebar
// (reutilizado em desktop e mobile)
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
      <div className="flex items-center justify-between border-b px-6 py-4">
        <img
          src={studioConfig.branding.logoUrl}
          alt={studioConfig.name}
          className="h-8"
        />
        {showClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-neutral-100"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav
        className="flex-1 space-y-1 overflow-y-auto p-4"
        aria-label="Navegação administrativa"
      >
        {visibleNavItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100"
            activeProps={{
              className: 'bg-neutral-900 text-white hover:bg-neutral-900',
            }}
            activeOptions={{ exact: to === '/admin' }}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </nav>

      <div className="border-t p-4">
        <div className="mb-3 flex items-center gap-3">
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-medium text-white"
            aria-hidden="true"
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-neutral-900">
              {userLabel}
            </div>
            <div className="truncate text-xs uppercase text-neutral-500">
              {getRoleLabel(user.role)}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {loggingOut ? 'Saindo…' : 'Sair'}
        </button>
      </div>
    </>
  );
}
