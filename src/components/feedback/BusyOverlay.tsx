import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

/**
 * BusyOverlay — glass premium durante I/O longo.
 * ----------------------------------------------------------------
 * Só renderiza após 400ms contínuos de operação (useGlobalBusy.showOverlay).
 * Sinaliza "sistema ocupado, aguarde" sem sensação de travamento.
 *
 * - Glass real: blur perceptível + saturate (cara de painel premium).
 * - transform:translateZ(0) + willChange → força camada GPU estável,
 *   matando o shimmer/tremor de subpixel do backdrop-filter em fullscreen.
 * - cursor:progress + pointer-events:auto → intercepta cliques (anti
 *   duplo-submit). Fade in/out suave só em opacity.
 * - Indicador central de 3 dots pulsando em onda (cor --color-accent).
 * - z-90 (abaixo da TopProgressBar = 100).
 * - prefers-reduced-motion: dots só pulsam opacidade, sem escala/delay.
 * ----------------------------------------------------------------
 */

interface BusyOverlayProps {
  active: boolean
}

export function BusyOverlay({ active }: BusyOverlayProps) {
  const reduce = useReducedMotion()

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          aria-hidden
          className="fixed inset-0 flex items-center justify-center"
          style={{
            zIndex: 90,
            cursor: 'progress',
            background: 'color-mix(in srgb, var(--color-surface-dark) 35%, transparent)',
            backdropFilter: 'blur(10px) saturate(140%)',
            WebkitBackdropFilter: 'blur(10px) saturate(140%)',
            transform: 'translateZ(0)',
            willChange: 'opacity',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <div
            className="flex items-center gap-2"
            role="status"
            aria-label="Carregando"
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="block h-3 w-3 rounded-full"
                style={{ background: 'var(--color-accent)' }}
                animate={
                  reduce
                    ? { opacity: [0.4, 1, 0.4] }
                    : { scale: [0.6, 1, 0.6], opacity: [0.4, 1, 0.4] }
                }
                transition={{
                  duration: reduce ? 1.2 : 0.9,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: reduce ? 0 : i * 0.15,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
