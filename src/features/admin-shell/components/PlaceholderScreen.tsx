import type { LucideIcon } from 'lucide-react';

interface PlaceholderScreenProps {
  title: string;
  description?: string;
  icon: LucideIcon;
}

export function PlaceholderScreen({
  title,
  description,
  icon: Icon,
}: PlaceholderScreenProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[var(--radius-card)] bg-[var(--color-surface-alt)] text-[var(--color-primary)]">
        <Icon className="h-8 w-8" />
      </div>
      <h1 className="mb-2 text-xl font-semibold text-[var(--color-text-heading)]">
        {title}
      </h1>
      <p className="text-sm text-[var(--color-text-muted)]">
        {description ?? 'Tela em construção. Em breve por aqui.'}
      </p>
    </div>
  );
}
