/**
 * ErrorState — feedback de erro inline (core / Módulo 1).
 * ----------------------------------------------------------------
 * Uso típico: errorComponent de rotas filhas que renderizam dentro
 * de um shell (sidebar + topbar permanecem montados).
 * NÃO é full-screen — ocupa apenas a área de conteúdo.
 *
 * Consumir por: import { ErrorState } from '@/components/feedback'
 * ----------------------------------------------------------------
 */
import { AlertTriangle, RotateCw } from 'lucide-react';

export interface ErrorStateProps {
  /** Erro capturado (mensagem exibida só em DEV). */
  error?: Error;
  /** Título exibido ao usuário. */
  title?: string;
  /** Mensagem amigável. */
  message?: string;
  /** Se fornecido, renderiza o botão "Tentar novamente". */
  onRetry?: () => void;
}

export function ErrorState({
  error,
  title = 'Algo deu errado',
  message = 'Não foi possível carregar esta seção. Tente novamente.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-dark)]">
          <AlertTriangle
            className="h-6 w-6 text-[var(--color-accent)]"
            aria-hidden="true"
          />
        </div>

        <h2 className="text-lg font-semibold text-[var(--color-text)]">
          {title}
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          {message}
        </p>

        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-6 inline-flex items-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--color-surface-dark)] transition-opacity hover:opacity-90"
          >
            <RotateCw className="h-4 w-4" aria-hidden="true" />
            Tentar novamente
          </button>
        ) : null}

        {import.meta.env.DEV && error ? (
          <pre className="mt-6 overflow-auto rounded-[var(--radius-card)] bg-[var(--color-surface-dark)] p-3 text-left text-xs text-[var(--color-text-muted)]">
            {error.message}
          </pre>
        ) : null}
      </div>
    </div>
  );
}