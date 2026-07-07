import { Menu } from 'lucide-react';
import { useTopbarSlot } from '../contexts/topbar-slot';

interface TopbarProps {
  title: string;
  onOpenMenu: () => void;
}

export function Topbar({ title, onOpenMenu }: TopbarProps) {
  const { content: slotContent } = useTopbarSlot();

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-800/40 bg-slate-950/70 backdrop-blur-xl px-4 lg:px-6 sticky top-0 z-20 transform-gpu">
      <button
        onClick={onOpenMenu}
        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-slate-200 lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Slot mobile: substitui o título quando preenchido */}
      {slotContent ? (
        <div className="flex-1 min-w-0 lg:hidden">
          {slotContent}
        </div>
      ) : null}

      {/* Título padrão — visível em desktop sempre, em mobile só quando não tem slot */}
      <h1
        className={`truncate text-lg font-semibold text-slate-100 ${
          slotContent ? 'hidden lg:block' : ''
        }`}
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {title}
      </h1>
    </header>
  );
}