import type { LucideIcon } from 'lucide-react';
import type { UserRole } from '@/features/auth/types';

export interface NavItem {
  /** Rótulo exibido no menu */
  label: string;
  /** Rota de destino (TanStack Router) */
  to: string;
  /** Ícone Lucide */
  icon: LucideIcon;
  /** Roles que ENXERGAM o item no menu */
  roles: UserRole[];
  /** Seção/grupo do item na sidebar */
  section: string;
  /**
   * Intenção de permissão: roles que só têm leitura.
   * NÃO é aplicado pela Sidebar — apenas documenta a regra.
   * A restrição real vive na feature/RLS (techdeb).
   */
  readonlyFor?: UserRole[];
}

export interface NavSection {
  section: string;
  items: NavItem[];
}
