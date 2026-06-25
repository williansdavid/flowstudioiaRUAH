import { Link } from '@tanstack/react-router';
import { ShoppingCart } from 'lucide-react';
import type { NavItem } from '../types';

interface SidebarItemProps {
  item: NavItem;
  onNavigate?: () => void;
  hasBadge?: boolean;
}

// ─── Cores do sistema ───────────────────────────────────────
const COLORS = {
  active: '#1895AD',     // ciano — destaque / glow
  activeBg: '#1895AD',   // fundo do item ativo (misturado com transparente via color-mix)
  text: '#94A3B8',       // texto padrão (slate-400)
  textHover: '#F1F5F9',  // texto no hover (slate-100)
  badge: '#EF4444',      // vermelho — badge do carrinho
} as const;
// ────────────────────────────────────────────────────────────

const itemBase = [
  'group relative flex items-center gap-3 rounded-xl',
  'px-3 py-2.5 text-sm font-medium',
  `text-[${COLORS.text}]!`,
  'transition-all duration-300',
  'hover:bg-white/[0.06]',
  'hover:backdrop-blur-sm',
  `hover:text-[${COLORS.textHover}]!`,
  'hover:translate-x-0.5',
  // Active: fundo rgba direto + borda sutil com glow
  `data-[status=active]:text-[${COLORS.active}]!`,
  `data-[status=active]:bg-[rgba(24,149,173,0.15)]`,
  'data-[status=active]:backdrop-blur-sm',
  `data-[status=active]:border-[${COLORS.active}]/25`,
  'data-[status=active]:border',
  'data-[status=active]:translate-x-0.5',
].join(' ');

export function SidebarItem({ item, onNavigate, hasBadge }: SidebarItemProps) {
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      activeOptions={{ exact: item.to === '/admin' }}
      className={itemBase}
    >
      {/* Barra lateral com glow */}
      <span
        aria-hidden
        className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full opacity-0 transition-all duration-300 group-data-[status=active]:opacity-100 group-hover:opacity-40"
        style={{
          backgroundColor: COLORS.active,
          boxShadow: `0 0 8px 1px ${COLORS.active}`,
        }}
      />

      {/* Ícone com glow no active */}
      <span className="relative shrink-0">
        <Icon className="h-[18px] w-[18px] transition-transform duration-300 group-data-[status=active]:scale-110" />
        <span
          aria-hidden
          className="absolute inset-0 rounded-full opacity-0 blur-md transition-opacity duration-300 group-data-[status=active]:opacity-25"
          style={{ backgroundColor: COLORS.active }}
        />
      </span>

      <span className="truncate">{item.label}</span>

      {/* Carrinho espelhado colado logo após o texto */}
      {hasBadge && item.label === 'PDV' && (
        <ShoppingCart
          className="h-3 w-3 shrink-0 -ml-1 -mt-2 scale-x-[-1]"
          style={{ color: COLORS.badge }}
        />
      )}
    </Link>
  );
}