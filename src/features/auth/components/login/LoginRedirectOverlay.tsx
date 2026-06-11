// src/features/auth/components/login/LoginRedirectOverlay.tsx
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function LoginRedirectOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[var(--color-surface-dark)]/95 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <Loader2
        className="h-8 w-8 animate-spin text-[var(--color-accent)]"
        aria-hidden
      />
      <p
        className="text-sm font-medium uppercase tracking-wide text-[var(--color-text-heading)]"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        Entrando...
      </p>
    </motion.div>
  );
}
