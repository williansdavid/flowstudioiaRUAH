import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Send, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useRequestPasswordReset } from '../hooks';

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.08, duration: 0.4, ease: 'easeOut' },
  }),
} as const;

export function ForgotPasswordForm() {
  const requestReset = useRequestPasswordReset();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (requestReset.isPending) return;
    requestReset.mutate(
      { email },
      { onSuccess: () => setSent(true) },
    );
  }

  const inputBaseClass =
    'w-full rounded-[var(--radius-button)] border border-white/10 ' +
    'bg-white/5 py-3 pl-11 pr-4 text-base text-[var(--color-text-body)] ' +
    'backdrop-blur-sm placeholder:text-[var(--color-text-muted)] outline-none ' +
    'transition-colors focus:border-[var(--color-accent)] focus:bg-white/[0.07] ' +
    'disabled:opacity-60';

  // Estado de sucesso (empty/confirmação)
  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex w-full max-w-sm flex-col items-center text-center"
      >
        <CheckCircle2
          className="h-12 w-12 text-[var(--color-accent)]"
          aria-hidden
        />
        <p
          className="mt-4 text-sm text-[var(--color-text-body)]"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Se houver uma conta com{' '}
          <span className="font-semibold text-[var(--color-text-heading)]">
            {email}
          </span>
          , você receberá um e-mail com o link para redefinir a senha.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-accent)]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao login
        </Link>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5" noValidate>
      <motion.div
        custom={0}
        variants={fieldVariants}
        initial="hidden"
        animate="show"
        className="space-y-2"
      >
        <label
          htmlFor="email"
          className="block text-sm font-medium text-[var(--color-text-heading)]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          E-mail
        </label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]"
            aria-hidden
          />
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={requestReset.isPending}
            className={inputBaseClass}
            placeholder="voce@exemplo.com"
          />
        </div>
      </motion.div>

      <motion.button
        custom={1}
        variants={fieldVariants}
        initial="hidden"
        animate="show"
        type="submit"
        disabled={requestReset.isPending}
        className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-surface-dark)] transition-all hover:bg-[var(--color-accent-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {requestReset.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Enviar link
          </>
        )}
      </motion.button>

      <motion.div
        custom={2}
        variants={fieldVariants}
        initial="hidden"
        animate="show"
        className="text-center"
      >
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-accent)]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao login
        </Link>
      </motion.div>
    </form>
  );
}
