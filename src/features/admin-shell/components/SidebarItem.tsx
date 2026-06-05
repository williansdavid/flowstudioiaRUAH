import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import type { NavItem } from '../types';

interface SidebarItemProps {
  item: NavItem;
  onNavigate?: () => void;
}

const baseClass =
  'group relative flex items-center gap-3 rounded-[var(--radius-button)] px-3 py-2.5 text-sm font-medium transition-all duration-200';

export function SidebarItem({ item, onNavigate }: SidebarItemProps) {
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      activeOptions={{ exact: item.to === '/admin' }}
      className={baseClass}
      style={{ color: 'var(--color-text-muted)' }}
      activeProps={{
        className: baseClass,
        style: {
          color: 'var(--color-text-heading)',
          backgroundColor: 'var(--color-surface-2)',
          boxShadow: 'var(--shadow-sm)',
        },
      }}
      // hover via inline handlers (mantém tokens, sem CSS extra)
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--color-text-heading)';
        e.currentTarget.style.backgroundColor = 'var(--color-surface-2)';
        e.currentTarget.style.transform = 'translateX(2px)';
      }}
      onMouseLeave={(e) => {
        // só limpa se não for o item ativo
        const active = e.currentTarget.dataset.status === 'active';
        if (!active) {
          e.currentTarget.style.color = 'var(--color-text-muted)';
          e.currentTarget.style.backgroundColor = 'transparent';
        }
        e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      {/* Barra dourada lateral — visível só no active via group */}
      <span
        aria-hidden
        className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full opacity-0 transition-opacity group-[.active]:opacity-100"
        style={{ backgroundColor: 'var(--color-accent)' }}
      />
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}
