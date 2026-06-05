import { Menu } from 'lucide-react';

interface TopbarProps {
  title: string;
  onOpenMenu: () => void;
}

export function Topbar({ title, onOpenMenu }: TopbarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 lg:px-6">
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
