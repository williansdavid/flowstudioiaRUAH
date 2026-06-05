import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

/**
 * TopProgressBar — barra de progresso no topo da tela (estilo NProgress).
 * ----------------------------------------------------------------
 * Comportamento:
 *   - active=true  → barra enche da esquerda, desacelerando, travando ~90%
 *                    (progresso "fake": indeterminado, nunca completa sozinho).
 *   - active=false → se estava ativa, dispara pra 100% rapido e some (fade).
 *
 * Tecnica: scaleX + transform-origin:left (GPU, mais leve que animar width).
 * Cor via branding do studio: --color-accent → --color-accent-bright.
 * prefers-reduced-motion: barra cheia pulsando opacidade (sem deslocamento).
 * ----------------------------------------------------------------
 */

interface TopProgressBarProps {
  active: boolean
}

const BAR_GRADIENT =
  'linear-gradient(90deg, var(--color-accent), var(--color-accent-bright), var(--color-accent))'

const BAR_GLOW =
  '0 0 8px color-mix(in srgb, var(--color-accent) 60%, transparent)'

type Phase = 'idle' | 'loading' | 'finishing'

export function TopProgressBar({ active }: TopProgressBarProps) {
  const reduce = useReducedMotion()
  const [phase, setPhase] = useState<Phase>('idle')

  useEffect(() => {
    if (active) {
      setPhase('loading')
      return
    }
    // active virou false: se estava carregando, completa antes de sumir.
    setPhase((prev) => (prev === 'loading' ? 'finishing' : 'idle'))
  }, [active])

  const visible = phase !== 'idle'

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 h-[3px] overflow-hidden"
          style={{ zIndex: 100 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25, ease: 'easeOut' } }}
        >
          {reduce ? (
            // Reduced motion: barra cheia pulsando opacidade.
            <motion.div
              className="h-full w-full"
              style={{ background: BAR_GRADIENT, boxShadow: BAR_GLOW }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          ) : (
            <motion.div
              className="h-full w-full origin-left"
              style={{ background: BAR_GRADIENT, boxShadow: BAR_GLOW }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: phase === 'finishing' ? 1 : [0, 0.5, 0.75, 0.9] }}
              transition={
                phase === 'finishing'
                  ? { duration: 0.3, ease: 'easeOut' }
                  : {
                      // Curva desacelerando: rapido no inicio, travando perto de 90%.
                      duration: 8,
                      ease: 'easeOut',
                      times: [0, 0.2, 0.5, 1],
                    }
              }
              onAnimationComplete={() => {
                // Quando o "finishing" (scaleX->1) termina, encerra de vez.
                if (phase === 'finishing') setPhase('idle')
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
