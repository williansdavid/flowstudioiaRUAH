/**
 * LazyMotionProvider — Wrapper SSR-safe do Framer Motion
 * ----------------------------------------------------------------
 * Por quê?
 *   - LazyMotion + domAnimation reduz o bundle de ~50KB → ~25KB
 *   - strict={true} força uso de <m.div> em vez de <motion.div>
 *     impedindo importações pesadas acidentais
 *   - SSR-safe: animações só rodam após hydration
 *
 * Uso:
 *   <LazyMotionProvider>
 *     <m.div animate={{ opacity: 1 }} />
 *   </LazyMotionProvider>
 * ----------------------------------------------------------------
 */

import { LazyMotion, domAnimation } from 'framer-motion'
import type { ReactNode } from 'react'

interface LazyMotionProviderProps {
  children: ReactNode
}

export function LazyMotionProvider({ children }: LazyMotionProviderProps) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  )
}
