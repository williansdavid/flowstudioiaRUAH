import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface PageHeaderProps {
  /** Título principal da página (renderizado em h1 com font-display) */
  title: string;
  /** Descrição opcional abaixo do título */
  description?: string;
  /** Ação principal à direita (ex: botão "Novo serviço") */
  action?: ReactNode;
  /** Conteúdo extra abaixo do header (ex: tabs, breadcrumb) */
  children?: ReactNode;
  /** Classes adicionais */
  className?: string;
}

/**
 * PageHeader — cabeçalho padrão de página administrativa.
 *
 * Visual:
 * - Título em font-display (Cinzel) com tracking ajustado
 * - Descrição em texto sutil
 * - Ação alinhada à direita no desktop, abaixo no mobile
 *
 * @example
 * <PageHeader
 *   title="Serviços"
 *   description="Gerencie o catálogo de serviços do studio."
 *   action={<Button>+ Novo serviço</Button>}
 * />
 */
export function PageHeader({
  title,
  description,
  action,
  children,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-4',
        className,
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-text-strong sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-sm text-text-subtle">
              {description}
            </p>
          )}
        </div>

        {action && (
          <div className="flex flex-shrink-0 items-center gap-2">
            {action}
          </div>
        )}
      </div>

      {children && <div>{children}</div>}
    </header>
  );
}
