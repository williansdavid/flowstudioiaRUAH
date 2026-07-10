import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  Users,
  Scissors,
  UserCog,
  Wallet,
  ShoppingCart,
  PackagePlus,
  NotebookIcon,
  NotebookPenIcon,
  DollarSign,
  BarChart3,
    
} from 'lucide-react';
import type { NavItem, NavSection } from '../types';
import type { UserRole } from '@/features/auth/types';

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, roles: ['admin', 'staff'], section: 'Operação' },
  { label: 'Tarefas', to: '/admin/crm', icon: NotebookPenIcon , roles: ['admin', 'staff'], section: 'Operação' },
  { label: 'Agendamentos', to: '/admin/agendamentos', icon: ClipboardList, roles: ['admin', 'staff'], section: 'Operação' },
  { label: 'Agenda', to: '/admin/agenda', icon: CalendarDays, roles: ['admin', 'staff'], section: 'Operação' },
  { label: 'PDV', to: '/admin/pdv', icon: ShoppingCart, roles: ['admin', 'staff'], section: 'Operação' },  
  { label: 'Clientes', to: '/admin/clientes', icon: Users, roles: ['admin', 'staff'], readonlyFor: ['staff'], section: 'Cadastros' },
  { label: 'Serviços', to: '/admin/servicos', icon: Scissors, roles: ['admin', 'staff'], section: 'Cadastros' },
  { label: 'Produtos', to: '/admin/produtos', icon: PackagePlus, roles: ['admin', 'staff'], section: 'Cadastros' },
  { label: 'Equipe', to: '/admin/equipe', icon: UserCog, roles: ['admin', 'staff'], section: 'Gestão' },
  { label: 'Financeiro', to: '/admin/financeiro', icon: Wallet, roles: ['admin'], section: 'Gestão' },
  { label: 'Comissões',  to: '/admin/comissoes',  icon: DollarSign, roles: ['admin', 'staff'], section: 'Gestão' },
   { label: 'Relatórios', to: '/admin/relatorios', icon: BarChart3, roles: ['admin'], section: 'Gestão' },  // ← novo
] as const;

/** Ordem fixa das seções na sidebar */
const SECTION_ORDER = ['Operação', 'Cadastros', 'Gestão'] as const;

export function getNavItemsForRole(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

/** Itens agrupados por seção, respeitando role e ordem fixa */
export function getGroupedNavItemsForRole(role: UserRole): NavSection[] {
  const visible = getNavItemsForRole(role);

  return SECTION_ORDER.map((section) => ({
    section,
    items: visible.filter((item) => item.section === section),
  })).filter((group) => group.items.length > 0);
}
