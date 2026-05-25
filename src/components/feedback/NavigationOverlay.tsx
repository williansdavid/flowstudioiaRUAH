import { useEffect, useState } from 'react';
import { useNavigationState } from '@/hooks/useNavigationState';

interface NavigationOverlayProps {
  children: React.ReactNode;
}

/**
 * NavigationOverlay
 *
 * Wrapper de UX para feedback de navegacao SSR.
 *
 * Responsabilidades:
 * 1. Aplica `cursor: wait` no <body> durante navegacao (apos delay anti-flicker)
 * 2. Atenua sutilmente o conteudo do <Outlet> durante transicao
 * 3. Bloqueia interacoes (pointer-events) durante navegacao ativa
 *
 * Delay de 80ms para evitar flicker em navegacoes instantaneas.
 * Mais conservador que o RouteProgressBar (40ms) porque mudancas
 * visuais no conteudo sao mais perceptiveis que uma barra de topo.
 *
 * SSR-safe: o estado inicial e sempre "sem navegacao".
 */
export function NavigationOverlay({ children }: NavigationOverlayProps) {
  const { isNavigating } = useNavigationState();
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (!isNavigating) {
      setShowFeedback(false);
      // Garante limpeza do cursor mesmo em transicoes instantaneas
      if (typeof document !== 'undefined') {
        document.body.style.removeProperty('cursor');
      }
      return;
    }

    const timer = setTimeout(() => {
      setShowFeedback(true);
      if (typeof document !== 'undefined') {
        document.body.style.cursor = 'wait';
      }
    }, 80);

    return () => {
      clearTimeout(timer);
      if (typeof document !== 'undefined') {
        document.body.style.removeProperty('cursor');
      }
    };
  }, [isNavigating]);

  return (
    <div
      className="transition-opacity duration-200 ease-out"
      style={{
        opacity: showFeedback ? 0.6 : 1,
        pointerEvents: showFeedback ? 'none' : 'auto',
      }}
    >
      {children}
    </div>
  );
}
