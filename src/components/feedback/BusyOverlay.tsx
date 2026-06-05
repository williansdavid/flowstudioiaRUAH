import { AnimatePresence, motion } from 'framer-motion'

/**
 * BusyOverlay â€” escurece a tela e troca o cursor durante I/O longo.
 * ----------------------------------------------------------------
 * Só renderiza após 400ms contínuos de operação (controlado por
 * useGlobalBusy.showOverlay). Sinaliza "sistema ocupado, aguarde" e
 * impede a sensação de travamento.
 *
 * - Escurecimento sutil (não bloqueia leitura do conteúdo embaixo).
 * - cursor: progress em toda a área.
 * - pointer-events: auto â†’ intercepta cliques durante a espera (evita
 *   duplo submit / cliques perdidos). Fade in/out suave.
 * - z-overlay (abaixo da barra de topo, que usa z-toast).
 * ----------------------------------------------------------------
 */

interface BusyOverlayProps {
  active: boolean
}

export function BusyOverlay({ active }: BusyOverlayProps) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          aria-hidden
          className="fixed inset-0"
          style={{
            zIndex: 'var(--z-overlay)',
            cursor: 'progress',
            background: 'color-mix(in srgb, var(--surface-dark) 45%, transparent)',
            backdropFilter: 'blur(1px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        />
      )}
    </AnimatePresence>
  )
}
