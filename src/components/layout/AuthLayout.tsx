import { type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { AuthBrandPanel } from '@/components/auth/AuthBrandPanel';

export interface AuthLayoutProps {
  children: ReactNode;
  /**
   * Mostra o link "voltar para o site" no topo do form (mobile).
   * Padrão: true
   */
  showBackLink?: boolean;
}

/**
 * Layout split-screen para páginas de autenticação.
 * - Desktop (lg+): brand panel à esquerda + form à direita
 * - Mobile: apenas o form, com link de voltar no topo
 *
 * Reutilizável para /login, /forgot-password, /reset-password.
 */
export function AuthLayout({ children, showBackLink = true }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-surface">
      {/* Painel esquerdo — apenas desktop */}
      <AuthBrandPanel />

      {/* Painel direito — form */}
      <main className="flex w-full flex-col lg:w-1/2">
        {showBackLink ? (
          <div className="px-6 pt-6 lg:px-10 lg:hidden">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Voltar para o site
            </Link>
          </div>
        ) : null}

        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  );
}
