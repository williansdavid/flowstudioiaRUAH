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
 * - Spinner central com cor do branding (--color-accent).
 * - z-overlay (abaixo da barra de topo).
 * - prefers-reduced-motion: spinner não gira, só pulsa opacidade.
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
            zIndex: 'var(--z-overlay)',
            cursor: 'progress',
            background: 'color-mix(in srgb, var(--surface-dark) 35%, transparent)',
            backdropFilter: 'blur(10px) saturate(140%)',
            WebkitBackdropFilter: 'blur(10px) saturate(140%)',
            // Camada GPU estável → mata o tremor de subpixel.
            transform: 'translateZ(0)',
            willChange: 'opacity',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <motion.div
            className="h-10 w-10 rounded-full"
            style={{
              border: '3px solid color-mix(in srgb, var(--color-accent) 25%, transparent)',
              borderTopColor: 'var(--color-accent)',
            }}
            animate={
              reduce
                ? { opacity: [0.4, 1, 0.4] }
                : { rotate: 360 }
            }
            transition={
              reduce
                ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.8, repeat: Infinity, ease: 'linear' }
            }
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
