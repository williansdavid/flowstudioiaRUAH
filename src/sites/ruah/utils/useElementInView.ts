// src/sites/ruah/utils/useElementInView.ts
import { useEffect, useState } from 'react'

/**
 * Observa um elemento por seletor e retorna se está na viewport.
 * SSR-safe. Default = true (no topo, o hero está visível).
 */
export function useElementInView(selector: string, rootMargin = '0px') {
  const [inView, setInView] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const el = document.querySelector(selector)
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false),
      { rootMargin, threshold: 0 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [selector, rootMargin])

  return inView
}
