import { motion } from 'framer-motion';
import { LoginBrandPanel } from './LoginBrandPanel';
import { RecoverySessionGate } from '../RecoverySessionGate';


const NOISE_SVG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const MESH_BACKGROUND = [
  'radial-gradient(ellipse 120% 90% at 20% -10%, color-mix(in srgb, var(--color-accent) 9%, transparent) 0%, transparent 60%)',
  'radial-gradient(ellipse 100% 90% at 110% 110%, color-mix(in srgb, var(--color-accent-bright) 8%, transparent) 0%, transparent 65%)',
  'linear-gradient(160deg, var(--color-background) 0%, var(--color-surface-dark) 100%)',
].join(', ');

const DIVIDER_GRADIENT =
  'linear-gradient(to bottom, transparent 0%, var(--color-accent) 50%, transparent 100%)';

export function ResetPasswordLayout() {
  return (
    <main className="relative grid min-h-screen grid-cols-1 overflow-hidden lg:grid-cols-2">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: MESH_BACKGROUND }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: NOISE_SVG,
          backgroundRepeat: 'repeat',
          opacity: 0.06,
          mixBlendMode: 'overlay',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[40vh] w-px -translate-x-1/2 -translate-y-1/2 lg:block"
        style={{ background: DIVIDER_GRADIENT }}
      />

      <LoginBrandPanel />

      <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-12 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex w-full max-w-sm flex-col rounded-[var(--radius-card)] border border-white/15 bg-white/[0.07] px-7 py-8 shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-8">
            <h2
              className="text-2xl font-bold text-[var(--color-text-heading)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Definir nova senha
            </h2>
            <p
              className="mt-2 text-sm text-[var(--color-text-muted)]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Escolha uma nova senha para acessar sua conta
            </p>
          </div>

          <RecoverySessionGate />
        </motion.div>
      </div>
    </main>
  );
}
