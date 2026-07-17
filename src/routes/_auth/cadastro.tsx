// src/routes/_auth/cadastro.tsx
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowLeft, Loader2, Mail, User, Phone, AlertCircle } from 'lucide-react';
import { clientSignUp } from '@/server/auth/clientSignUp';
import { systemThemeClass } from '@/lib/core/system';
import { cn } from '@/lib/cn';

export const Route = createFileRoute('/_auth/cadastro')({
  component: CadastroPage,
});

type Step = 'form' | 'success' | 'exists_no_profile' | 'exists_with_profile' | 'error';

function CadastroPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    const form = new FormData(e.currentTarget);
    const name = form.get('name') as string;
    const email = form.get('email') as string;
    const phone = form.get('phone') as string;

    const result = await clientSignUp({ data: { name, email, phone } });

    setIsSubmitting(false);
    setSubmittedEmail(email);

    if (result.status === 'success') {
      setStep('success');
    } else if (result.status === 'exists_with_profile') {
      setStep('exists_with_profile');
    } else if (result.status === 'exists_no_profile') {
      setStep('exists_no_profile');
    } else {
      setStep('error');
      setErrorMessage(result.message ?? 'Erro ao criar cadastro. Tente novamente.');
    }
  };

  return (
    <div className={cn(systemThemeClass, 'flex min-h-screen items-center justify-center bg-[var(--color-bg)] p-4')}>
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-lg">
        {/* ── Logo / Título ── */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            {import.meta.env.VITE_STUDIO_NAME ?? 'FlowStudio'}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Crie sua conta para agendar online
          </p>
        </div>

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                Nome completo
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Seu nome"
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] py-2.5 pl-10 pr-3 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none transition-colors focus:border-[var(--color-accent)]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                E-mail
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="seu@email.com"
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] py-2.5 pl-10 pr-3 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none transition-colors focus:border-[var(--color-accent)]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                WhatsApp / Telefone
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="(11) 99999-9999"
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] py-2.5 pl-10 pr-3 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none transition-colors focus:border-[var(--color-accent)]"
                />
              </div>
            </div>

            {errorMessage && (
              <p className="text-sm text-red-400">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-accent)] py-2.5 text-sm font-semibold text-[var(--color-surface-dark)] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar conta'
              )}
            </button>

            <p className="text-center text-sm text-[var(--color-text-muted)]">
              Já tem conta?{' '}
              <Link to="/login" className="font-medium text-[var(--color-accent)] hover:underline">
                Fazer login
              </Link>
            </p>
          </form>
        )}

        {step === 'success' && (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <Mail className="h-6 w-6 text-green-400" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Cadastro realizado!
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Enviamos um e-mail de confirmação para{' '}
              <strong className="text-[var(--color-text)]">{submittedEmail}</strong>.
              Clique no link para definir sua senha e acessar sua conta.
            </p>
            <Link
              to="/login"
              className="mt-4 inline-block text-sm font-medium text-[var(--color-accent)] hover:underline"
            >
              Ir para o login
            </Link>
          </div>
        )}

        {step === 'exists_with_profile' && (
          <div className="space-y-4 text-center">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Você já possui cadastro
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              O e-mail <strong className="text-[var(--color-text)]">{submittedEmail}</strong> já
              está registrado. Faça login para acessar sua conta.
            </p>
            <Link
              to="/login"
              className="mt-4 inline-block text-sm font-medium text-[var(--color-accent)] hover:underline"
            >
              Fazer login
            </Link>
          </div>
        )}

        {step === 'exists_no_profile' && (
          <div className="space-y-4 text-center">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Solicite acesso via WhatsApp
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              O e-mail <strong className="text-[var(--color-text)]">{submittedEmail}</strong> já
              está cadastrado em nossa base, mas não possui acesso online.
              Entre em contato pelo WhatsApp do studio para solicitar seu acesso.
            </p>
            <Link
              to="/login"
              className="mt-4 inline-block text-sm font-medium text-[var(--color-accent)] hover:underline"
            >
              Voltar ao login
            </Link>
          </div>
        )}

        {/* ── FIX: Novo bloco de erro ── */}
        {step === 'error' && (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Não foi possível criar sua conta
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              {errorMessage}
            </p>
            <button
              type="button"
              onClick={() => { setStep('form'); setErrorMessage(''); }}
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)] hover:underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* ── Voltar ── */}
        {step !== 'form' && (
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}