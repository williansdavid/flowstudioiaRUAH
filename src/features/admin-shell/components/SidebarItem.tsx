import { Link } from '@tanstack/react-router';
import type { NavItem } from '../types';

interface SidebarItemProps {
  item: NavItem;
  onNavigate?: () => void;
}

/**
 * Estilo via classes Tailwind + data-[status=active] (setado pelo
 * TanStack Router). Sem manipulacao imperativa de style no mouse:
 * Router governa o ativo, CSS governa o hover. Os dois nao brigam.
 *
 * Camadas:
 *  - idle  : texto muted, fundo transparente
 *  - hover : texto heading, fundo surface-alt (camada leve)
 *  - active: texto heading, fundo surface-2 (camada elevada)
 *            + barra dourada + shadow-sm + translateX
 */
const itemClass = [
  'group relative flex items-center gap-3 rounded-[var(--radius-button)]',
  'px-3 py-2.5 text-sm font-medium',
  // normal: cinza-quente #8A857C — blindado contra .theme-*-dark a { color }
  'text-[var(--color-sidebar-text)]!',
  'transition-all duration-200',
  // hover (nao ativo): fundo discreto branco + clareia o texto
  'hover:bg-white/5',
  'hover:text-[var(--color-text-heading)]!',
  'hover:translate-x-0.5',
  // active: texto + icone dourados, fundo dourado discreto
  'data-[status=active]:text-[var(--color-sidebar-active)]!',
  'data-[status=active]:bg-[color-mix(in_srgb,var(--color-sidebar-active)_10%,transparent)]',
  'data-[status=active]:translate-x-0.5',
].join(' ');

export function SidebarItem({ item, onNavigate }: SidebarItemProps) {
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      activeOptions={{ exact: item.to === '/admin' }}
      className={itemClass}
    >
      {/* Barra dourada lateral — visivel so no ativo */}
      <span
        aria-hidden
        className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-[var(--color-sidebar-active)] opacity-0 transition-opacity duration-200 group-data-[status=active]:opacity-100"
      />
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}
