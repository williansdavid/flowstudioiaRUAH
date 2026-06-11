// src/features/auth/components/LoginForm.tsx
import { Link } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Loader2, LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useSignIn } from '../hooks';
import { LoginRedirectOverlay } from './login/LoginRedirectOverlay';

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.08, duration: 0.4, ease: 'easeOut' },
  }),
} as const;

export function LoginForm() {
  const signIn = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // isPending cai assim que a mutation resolve, mas o window.location.assign
  // do onSuccess ainda nao navegou -> frame morto (login reaparece sem busy).
  // isSuccess vira true no onSuccess e PERMANECE true ate o hard nav matar a
  // pagina. Somando os dois, o busy fica continuo do clique ao dashboard.
  const isBusy = signIn.isPending || signIn.isSuccess;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isBusy) return;
    signIn.mutate({ email, password });
  }

  const inputBaseClass =
    'w-full rounded-[var(--radius-button)] border border-white/10 ' +
    'bg-white/5 py-3 pl-11 pr-4 text-base text-[var(--color-text-body)] ' +
    'backdrop-blur-sm placeholder:text-[var(--color-text-muted)] outline-none ' +
    'transition-colors focus:border-[var(--color-accent)] focus:bg-white/[0.07] ' +
    'disabled:opacity-60';

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5" noValidate>
        {/* E-mail */}
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
              disabled={isBusy}
              className={inputBaseClass}
              placeholder="voce@exemplo.com"
            />
          </div>
        </motion.div>

        {/* Senha */}
        <motion.div
          custom={1}
          variants={fieldVariants}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[var(--color-text-heading)]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Senha
          </label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]"
              aria-hidden
            />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isBusy}
              className={`${inputBaseClass} pr-11`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              disabled={isBusy}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-[var(--radius-button)] p-1 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-accent)] disabled:opacity-60"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" aria-hidden />
              ) : (
                <Eye className="h-5 w-5" aria-hidden />
              )}
            </button>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.button
          custom={2}
          variants={fieldVariants}
          initial="hidden"
          animate="show"
          type="submit"
          disabled={isBusy}
          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-surface-dark)] transition-all hover:bg-[var(--color-accent-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {isBusy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Entrar
            </>
          )}
        </motion.button>

        {/* Esqueci minha senha */}
        <motion.div
          custom={3}
          variants={fieldVariants}
          initial="hidden"
          animate="show"
          className="text-center"
        >
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-accent)]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Esqueci minha senha
          </Link>
        </motion.div>
      </form>

      {signIn.isSuccess && <LoginRedirectOverlay />}
    </>
  );
}
