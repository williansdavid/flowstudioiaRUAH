import { Loader2 } from 'lucide-react';
import { useEstablishRecoverySession } from '../hooks';
import { ResetPasswordForm } from './ResetPasswordForm';

/**
 * Gate do fluxo invite/recovery.
 *
 * Estabelece a sessão a partir do token na QUERY da URL
 * (?token_hash=...&type=recovery|invite) ANTES de liberar o form.
 * Sem isso, updateUser roda sem sessão -> "link inválido/expirado".
 *
 * Compartilhado por FirstAccessLayout (invite) e ResetPasswordLayout
 * (recovery): o hook lê o `type` da URL e chama verifyOtp de acordo.
 */
export function RecoverySessionGate() {
  const { status, errorMsg } = useEstablishRecoverySession();

  if (status === 'establishing') {
    return (
      <div
        className="flex w-full items-center justify-center py-10"
        role="status"
        aria-live="polite"
      >
        <Loader2
          className="h-6 w-6 animate-spin text-[var(--color-accent)]"
          aria-label="Validando link"
        />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="w-full space-y-3 text-center" role="alert">
        <p className="text-sm text-red-400">
          {errorMsg ?? 'Link inválido ou expirado. Solicite um novo.'}
        </p>
        <a
          href="/forgot-password"
          className="inline-block text-sm font-medium text-[var(--color-accent)] underline-offset-4 hover:underline"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Solicitar novo link
        </a>
      </div>
    );
  }

  return <ResetPasswordForm />;
}
