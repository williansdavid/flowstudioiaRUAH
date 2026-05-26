import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Spinner } from './Spinner';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { cn } from '@/lib/utils/cn';

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  cell: (item: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
  /** Esconder coluna em telas menores que md (opcional) */
  hideOnMobile?: boolean;
}

export interface DataTableEmptyState {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export interface DataTableProps<T> {
  data: T[] | undefined;
  columns: DataTableColumn<T>[];
  isLoading?: boolean;
  error?: Error | null;
  emptyState: DataTableEmptyState;
  /** Função para extrair chave única de cada item */
  rowKey: (item: T) => string;
  /** Render alternativo para mobile (cards). Se omitido, mostra a tabela com scroll. */
  mobileCard?: (item: T) => ReactNode;
  /** Marcar linha como inativa (aplica opacidade) */
  isRowInactive?: (item: T) => boolean;
  /** Label customizada do loading */
  loadingLabel?: string;
  /** Label customizada do erro */
  errorLabel?: string;
}

const alignStyles = {
  left:   'text-left',
  right:  'text-right',
  center: 'text-center',
} as const;

export function DataTable<T>({
  data,
  columns,
  isLoading,
  error,
  emptyState,
  rowKey,
  mobileCard,
  isRowInactive,
  loadingLabel = 'Carregando...',
  errorLabel = 'Erro ao carregar dados',
}: DataTableProps<T>) {
  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" label={loadingLabel} />
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return <ErrorState message={`${errorLabel}: ${error.message}`} />;
  }

  // ── Empty ──
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={emptyState.icon}
        title={emptyState.title}
        description={emptyState.description}
      />
    );
  }

  return (
    <>
      {/* ── Desktop: tabela ── */}
      <div className="hidden md:block">
        <div
          className={cn(
            'overflow-hidden rounded-xl',
            'border border-border-default',
            'bg-bg-card',
            'shadow-[0_1px_0_oklch(1_0_0/.04)_inset,0_12px_32px_-16px_oklch(0_0_0/.5)]',
          )}
        >
          <table className="w-full text-sm">
            <thead
              className={cn(
                'border-b border-border-subtle',
                'bg-bg-subtle/40',
              )}
            >
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      'px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em]',
                      'text-brand-400/70',
                      alignStyles[col.align ?? 'left'],
                      col.className,
                    )}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/60">
              {data.map((item) => {
                const inactive = isRowInactive?.(item) ?? false;
                return (
                  <tr
                    key={rowKey(item)}
                    data-inactive={inactive || undefined}
                    className={cn(
                      'transition-colors duration-150',
                      'hover:bg-brand-500/[0.04]',
                      inactive && 'opacity-50',
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'px-4 py-3.5 text-text-default',
                          alignStyles[col.align ?? 'left'],
                          col.className,
                        )}
                      >
                        {col.cell(item)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile: cards (se fornecido) ── */}
      {mobileCard && (
        <div className="grid gap-3 md:hidden">
          {data.map((item) => (
            <div key={rowKey(item)}>{mobileCard(item)}</div>
          ))}
        </div>
      )}

      {/* ── Mobile fallback: tabela com scroll horizontal ── */}
      {!mobileCard && (
        <div className="block md:hidden">
          <div
            className={cn(
              'overflow-x-auto rounded-xl',
              'border border-border-default',
              'bg-bg-card',
              'shadow-[0_1px_0_oklch(1_0_0/.04)_inset,0_8px_24px_-12px_oklch(0_0_0/.5)]',
            )}
          >
            <table className="w-full text-sm">
              <thead className="border-b border-border-subtle bg-bg-subtle/40">
                <tr>
                  {columns
                    .filter((c) => !c.hideOnMobile)
                    .map((col) => (
                      <th
                        key={col.key}
                        className={cn(
                          'px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] whitespace-nowrap',
                          'text-brand-400/70',
                          alignStyles[col.align ?? 'left'],
                        )}
                      >
                        {col.header}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/60">
                {data.map((item) => (
                  <tr
                    key={rowKey(item)}
                    className="transition-colors duration-150 hover:bg-brand-500/[0.04]"
                  >
                    {columns
                      .filter((c) => !c.hideOnMobile)
                      .map((col) => (
                        <td
                          key={col.key}
                          className={cn(
                            'px-4 py-3.5 text-text-default whitespace-nowrap',
                            alignStyles[col.align ?? 'left'],
                          )}
                        >
                          {col.cell(item)}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
