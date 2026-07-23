import { motion } from 'framer-motion';
import { branding, identity } from '@/config/active-studio';

/**
 * Painel visual (lado esquerdo no desktop / header compacto no mobile).
 * 100% white-label: consome branding.logo + identity do studio ativo.
 *
 * NAO tem fundo proprio — herda o mesh unico do LoginSplitLayout.
 * Bloco brand centralizado (vertical + horizontal). Enfeite no canto
 * inferior direito (so desktop). SSR-safe (strings estaticas).
 *
 * NOTA: titulo usa style inline (color + fontSize) porque a regra global
 * `.theme-dark h1` (theme.css) tem especificidade maior que classes
 * utilitarias e sobrescreveria a cor/ tamanho. Inline vence.
 */

export function LoginBrandPanel() {
  return (
    <div className="relative z-10 flex w-full flex-col items-center justify-center px-8 py-6 lg:px-14 lg:py-0">
      {/* Enfeite decorativo — canto inferior direito (so desktop) */}
      <div aria-hidden className="absolute bottom-8 right-8 hidden lg:block">
        <div
          className="ml-auto h-8 w-px"
          style={{ background: 'var(--color-accent)' }}
        />
        <div
          className="h-px w-8"
          style={{ background: 'var(--color-accent)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative flex flex-col items-center text-center"
      >
        {/* Moldura externa: fundo escuro + border dourada + radius + glow */}
        <div
          className="flex items-center justify-center rounded-[var(--radius-card)] border px-6 py-4 shadow-2xl"
          style={{
            borderColor: 'color-mix(in srgb, var(--color-accent) 45%, transparent)',
            background: 'color-mix(in srgb, var(--color-surface-dark) 70%, transparent)',
            boxShadow:
              '0 0 32px color-mix(in srgb, var(--color-accent) 18%, transparent)',
          }}
        >
          <img
            src={branding.logo.light}
            alt={branding.logo.alt}
            className="h-16 w-auto object-contain lg:h-20"
          />
        </div>

        {/* Divisoria dourada — entre logo e titulo */}
        <div
          aria-hidden
          className="mt-8 h-px w-24"
          style={{ background: 'var(--color-accent)' }}
        />

        {/* Titulo — cor + tamanho via style inline (vence .theme-dark h1) */}
        <h1
          className="mt-6 font-bold tracking-tight"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--color-accent)',
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
            lineHeight: 1.1,
          }}
        >
          {identity.name}
        </h1>

        {identity.slogan && (
          <p
            className="mt-4 max-w-xs leading-relaxed text-[var(--color-text-muted)]"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
            }}
          >
            {identity.slogan}
          </p>
        )}
      </motion.div>
    </div>
  );
}
