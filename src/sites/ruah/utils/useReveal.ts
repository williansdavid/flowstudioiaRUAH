/**
 * useReveal — Reveal on Scroll Hook
 * ----------------------------------------------------------------
 * Hook React que aplica a classe `.is-visible` quando o elemento
 * entra na viewport, disparando a animação CSS definida em
 * `styles/animations.css`.
 *
 * SSR-safe:
 *   - Não acessa `window` ou `IntersectionObserver` no render.
 *   - Toda lógica fica dentro de useEffect (client-only).
 *   - Markup renderizado no servidor tem opacity:0 inicial.
 *     Se JS falhar, fallback CSS deve ser considerado (ex: noscript).
 *
 * Uso típico:
 *   const ref = useReveal<HTMLDivElement>()
 *   return <div ref={ref} className="ruah-reveal ruah-reveal--up">...</div>
 *
 * Com opções:
 *   const ref = useReveal<HTMLDivElement>({ threshold: 0.3, once: true })
 *
 * Performance:
 *   - Observer é criado por elemento (simples e suficiente para landing).
 *   - Quando `once: true` (default), desconecta após primeiro disparo.
 * ----------------------------------------------------------------
 */

import { useEffect, useRef } from 'react'

export interface UseRevealOptions {
  /** Quão visível o elemento precisa estar para disparar (0..1). Default: 0.15 */
  threshold?: number
  /** Margem da viewport (CSS-like). Default: '0px 0px -10% 0px' */
  rootMargin?: string
  /** Se true, anima só uma vez. Default: true */
  once?: boolean
  /** Classe aplicada quando visível. Default: 'is-visible' */
  visibleClass?: string
}

const DEFAULT_OPTIONS: Required<UseRevealOptions> = {
  threshold: 0.15,
  rootMargin: '0px 0px -10% 0px',
  once: true,
  visibleClass: 'is-visible',
}

/**
 * Hook que retorna uma ref para anexar ao elemento que deve
 * ser observado e animado quando entrar na viewport.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseRevealOptions = {},
) {
  const ref = useRef<T | null>(null)
  const opts = { ...DEFAULT_OPTIONS, ...options }

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // Guarda SSR / browsers antigos
    if (typeof window === 'undefined') return
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback: aplica direto (sem animação)
      node.classList.add(opts.visibleClass)
      return
    }

    // Respeita prefers-reduced-motion → revela direto, sem observar
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (reduceMotion) {
      node.classList.add(opts.visibleClass)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.classList.add(opts.visibleClass)
            if (opts.once) observer.disconnect()
          } else if (!opts.once) {
            node.classList.remove(opts.visibleClass)
          }
        }
      },
      {
        threshold: opts.threshold,
        rootMargin: opts.rootMargin,
      },
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return ref
}
