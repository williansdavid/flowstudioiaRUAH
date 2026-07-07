// src/features/admin-shell/components/BottomTab.tsx

import { useMatches, useNavigate } from '@tanstack/react-router';
import {
  NotebookPenIcon,
  ClipboardList,
  ShoppingCart,
  Users,
  CalendarDays,
  type LucideIcon,
} from 'lucide-react';

// ─── Itens ──────────────────────────────────────────────────
interface TabItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

const TAB_ITEMS: TabItem[] = [
  { label: 'Tarefas', to: '/admin/crm', icon: NotebookPenIcon },
  { label: 'Agendamentos', to: '/admin/agendamentos', icon: ClipboardList },
  { label: 'PDV', to: '/admin/pdv', icon: ShoppingCart },
  { label: 'Clientes', to: '/admin/clientes', icon: Users },
  { label: 'Agenda', to: '/admin/agenda', icon: CalendarDays },
];

// ─── Cores (match com Sidebar) ──────────────────────────────
const COLORS = {
  bg: 'rgba(7, 14, 27, 0.88)',
  border: '#192335',
  active: '#1895AD',
  muted: '#64748B',
  activeBg: 'rgba(24, 149, 173, 0.12)',
} as const;
// ────────────────────────────────────────────────────────────

export function BottomTab() {
  const navigate = useNavigate();
  const matches = useMatches();

  // Pega a routeId do match mais profundo (rota atual)
  const activeRoute = matches.at(-1)?.routeId ?? '';

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div
        className="flex items-center justify-evenly h-11 border-t backdrop-blur-xl"
        style={{
          backgroundColor: COLORS.bg,
          borderColor: COLORS.border,
        }}
      >
        {TAB_ITEMS.map((item) => {
          const isActive = activeRoute.includes(item.to);
          const Icon = item.icon;

          return (
            <button
              key={item.to}
              onClick={() => navigate({ to: item.to })}
              className="flex items-center justify-center rounded-lg transition-all duration-150 active:scale-90"
              style={{
                width: 40,
                height: 40,
                color: isActive ? COLORS.active : COLORS.muted,
                backgroundColor: isActive ? COLORS.activeBg : 'transparent',
              }}
              aria-label={item.label}
            >
              <Icon className="h-[18px] w-[18px]" />
            </button>
          );
        })}
      </div>
    </nav>
  );
}