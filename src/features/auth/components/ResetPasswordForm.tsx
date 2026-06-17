import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Loader2, KeyRound, Lock, Eye, EyeOff } from 'lucide-react';
import { useUpdatePassword } from '../hooks';

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.08, duration: 0.4, ease: 'easeOut' },
  }),
} as const;

const MIN_LEN = 6;

export function ResetPasswordForm() {
  const updatePassword = useUpdatePassword();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (updatePassword.isPending) return;

    if (password.length < MIN_LEN) {
      setError(`A senha deve ter ao menos ${MIN_LEN} caracteres.`);
      return;
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    setError(null);
    updatePassword.mutate(password);
  }

  const inputBaseClass =
    'w-full rounded-[var(--radius-button)] border border-white/10 ' +
    'bg-white/5 py-3 pl-11 pr-4 text-base text-[var(--color-text-body)] ' +
    'backdrop-blur-sm placeholder:text-[var(--color-text-muted)] outline-none ' +
    'transition-colors focus:border-[var(--color-accent)] focus:bg-white/[0.07] ' +
    'disabled:opacity-60';

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5" noValidate>
      {/* Nova senha */}
      <motion.div
        custom={0}
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
          Nova senha
        </label>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]"
            aria-hidden
          />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={updatePassword.isPending}
            className={`${inputBaseClass} pr-11`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            disabled={updatePassword.isPending}
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

      {/* Confirmar senha */}
      <motion.div
        custom={1}
        variants={fieldVariants}
        initial="hidden"
        animate="show"
        className="space-y-2"
      >
        <label
          htmlFor="confirm"
          className="block text-sm font-medium text-[var(--color-text-heading)]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Confirmar senha
        </label>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]"
            aria-hidden
          />
          <input
            id="confirm"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={updatePassword.isPending}
            className={inputBaseClass}
            placeholder="••••••••"
          />
        </div>
      </motion.div>

      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <motion.button
        custom={2}
        variants={fieldVariants}
        initial="hidden"
        animate="show"
        type="submit"
        disabled={updatePassword.isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-button bg-accent px-7 py-3.5 text-base font-heading font-semibold uppercase tracking-wide text-surface-dark shadow-md transition-all hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-accent active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60"
      >
        {updatePassword.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <KeyRound className="h-4 w-4" />
            Redefinir senha
          </>
        )}
      </motion.button>
    </form>
  );
}
