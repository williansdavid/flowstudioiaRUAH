import { useEffect, useState } from 'react'

/**
 * useScrolled
 * ----------------------------------------------------------------
 * Retorna true quando a página ultrapassa um threshold vertical.
 * Usado pelo Header pra alternar entre estado transparente (topo)
 * e estado solid/glass (rolado).
 *
 * @param threshold  Pixels de scroll a partir do topo. Default: 50.
 * @returns boolean
 *
 * SSR-safe: durante SSR retorna `false` (estado inicial = topo).
 * No client, registra listener passivo de scroll.
 * ----------------------------------------------------------------
 */
export function useScrolled(threshold: number = 50): boolean {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > threshold)
    }

    // Checa estado inicial (ex: refresh com scroll já rolado)
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return scrolled
}
