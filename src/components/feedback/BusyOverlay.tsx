// src/components/feedback/BusyOverlay.tsx
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

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
          <div className="relative flex items-center justify-center" role="status" aria-label="Carregando">
            {/* Anel externo giratório */}
            <motion.div
              className="absolute h-16 w-16"
              style={{ border: '3px solid transparent', borderRadius: '50%', borderTopColor: 'var(--color-accent)' }}
              animate={reduce ? {} : { rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            />
            {/* Anel interno giratório (sentido oposto) */}
            <motion.div
              className="absolute h-10 w-10"
              style={{ border: '2px solid transparent', borderRadius: '50%', borderBottomColor: 'var(--color-accent)' }}
              animate={reduce ? {} : { rotate: -360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
            {/* Glow pulsante central */}
            <motion.div
              className="h-3 w-3 rounded-full"
              style={{ background: 'var(--color-accent)' }}
              animate={
                reduce
                  ? { opacity: [0.3, 1, 0.3] }
                  : { scale: [0.8, 1.2, 0.8], opacity: [0.3, 1, 0.3], boxShadow: [
                      '0 0 6px var(--color-accent)',
                      '0 0 20px var(--color-accent)',
                      '0 0 6px var(--color-accent)',
                    ]}
              }
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}