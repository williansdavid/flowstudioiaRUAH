import { useEffect, useState } from 'react'
import { useGlobalBusy } from './useGlobalBusy'
import { TopProgressBar } from './TopProgressBar'
import { BusyOverlay } from './BusyOverlay'

/**
 * GlobalLoadingIndicator — orquestrador do feedback global de I/O.
 * SSR-safe: no primeiro render (hidratação) retorna null, igual ao
 * servidor. Só renderiza o feedback visual após montar no client,
 * evitando hydration mismatch.
 */
export function GlobalLoadingIndicator() {
  const [mounted, setMounted] = useState(false)
  const { isBusy, showOverlay } = useGlobalBusy()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Primeiro render (hidratação) === SSR: nada. Evita mismatch.
  if (!mounted) return null

  return (
    <>
      <TopProgressBar active={isBusy} />
      <BusyOverlay active={showOverlay} />
    </>
  )
}
