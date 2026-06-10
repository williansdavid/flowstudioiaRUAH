import { Menu } from 'lucide-react';

const TOPBAR_GRADIENT =
  'radial-gradient(120% 120% at 0% 0%, #16233D 0%, #0D1629 45%, #070C16 100%)';

interface TopbarProps {
  title: string;
  onOpenMenu: () => void;
}

export function Topbar({ title, onOpenMenu }: TopbarProps) {
  return (
    <header
      className="flex h-16 shrink-0 items-center gap-3 border-b border-[var(--color-border)] px-4 lg:px-6"
      style={{ background: TOPBAR_GRADIENT }}
    >
      <button
        onClick={onOpenMenu}
        className="rounded-[var(--radius-button)] p-2 text-[var(--color-text-body)] hover:bg-[var(--color-surface-alt)] lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1
        className="truncate text-lg font-semibold"
        style={{
          fontFamily: 'var(--font-heading)',
          color: 'var(--color-text-heading)',
        }}
      >
        {title}
      </h1>
    </header>
  );
}
