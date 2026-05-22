import { type ComponentType, type ReactNode } from 'react';
import { type LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface EmptyStateProps {
  icon?: ComponentType<LucideProps>;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Estado vazio padronizado.
 *
 * @example
 * <EmptyState
 *   icon={Users}
 *   title="Nenhum cliente cadastrado"
 *   description="Comece adicionando seu primeiro cliente."
 *   action={<Button onClick={openModal}>Adicionar cliente</Button>}
 * />
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        'py-12 px-6 rounded-lg border border-dashed border-neutral-300 bg-neutral-50',
        className,
      )}
    >
      {Icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white border border-neutral-200">
          <Icon className="h-6 w-6 text-neutral-500" aria-hidden="true" />
        </div>
      ) : null}

      <h3 className="text-base font-semibold text-neutral-900">{title}</h3>

      {description ? (
        <p className="mt-1 max-w-sm text-sm text-neutral-600">{description}</p>
      ) : null}

      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
