import { useEffect, useRef, useState } from 'react'
import { useIsFetching, useIsMutating } from '@tanstack/react-query'
import { useRouterState } from '@tanstack/react-router'

/**
 * useGlobalBusy  detector global de I/O do core.
 * ----------------------------------------------------------------
 * Fonte de verdade do "sistema ocupado". Lê automaticamente:
 *   - React Query: queries em fetch + mutations em andamento
 *   - TanStack Router: navegação de rota pendente
 *
 * Zero acoplamento: nenhuma feature precisa marcar nada. Toda query/
 * mutation/navegação entra de graça no contador.
 *
 * Retorno:
 *   - isBusy:      true assim que QUALQUER I/O começa (barra → imediato)
 *   - showOverlay: true só após 400ms contínuos de I/O (overlay + cursor)
 *
 * SSR-safe: no servidor todos os contadores são 0 e o setTimeout não roda;
 * estado inicial = idle. Sem hydration mismatch.
 * ----------------------------------------------------------------
 */

const OVERLAY_DELAY_MS = 400

export interface GlobalBusyState {
  isBusy: boolean
  showOverlay: boolean
}

export function useGlobalBusy(): GlobalBusyState {
  const fetching = useIsFetching()
  const mutating = useIsMutating()
  const isRouting = useRouterState({
    select: (s) => s.status === 'pending',
  })

  const isBusy = fetching + mutating > 0 || isRouting

  const [showOverlay, setShowOverlay] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isBusy) {
      // Agenda overlay só se ainda não há timer rodando.
      if (timerRef.current === null) {
        timerRef.current = setTimeout(() => {
          setShowOverlay(true)
        }, OVERLAY_DELAY_MS)
      }
    } else {
      // I/O terminou: cancela timer pendente e esconde overlay.
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      setShowOverlay(false)
    }

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isBusy])

  return { isBusy, showOverlay }
}
