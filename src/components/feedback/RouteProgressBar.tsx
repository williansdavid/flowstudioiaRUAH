import { useEffect, useRef, useState } from 'react';
import { useNavigationState } from '@/hooks/useNavigationState';

/**
 * RouteProgressBar
 * Barra de progresso global de navegacao SSR (estilo NProgress).
 *
 * - Consome useNavigationState (hook central)
 * - Delay de 40ms para evitar flicker em navegacoes instantaneas
 * - Cor hardcoded #d4af37 (dourado RUAH) por seguranca de pintura SSR
 *   (variaveis CSS no <html> podem nao estar disponiveis no primeiro paint)
 */
export function RouteProgressBar() {
  const { isNavigating } = useNavigationState();

  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const clearAll = () => {
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      if (tickTimerRef.current) {
        clearInterval(tickTimerRef.current);
        tickTimerRef.current = null;
      }
    };

    if (isNavigating) {
      clearAll();
      showTimerRef.current = setTimeout(() => {
        setVisible(true);
        setProgress(20);
        tickTimerRef.current = setInterval(() => {
          setProgress((p) => {
            if (p >= 90) return p;
            const remaining = 90 - p;
            const inc = remaining * 0.08;
            return Math.min(90, p + Math.max(inc, 0.5));
          });
        }, 200);
      }, 40);
    } else {
      clearAll();
      setVisible((wasVisible) => {
        if (wasVisible) {
          setProgress(100);
          hideTimerRef.current = setTimeout(() => {
            setVisible(false);
            setProgress(0);
          }, 250);
          return true;
        }
        return false;
      });
    }

    return clearAll;
  }, [isNavigating]);

  if (!visible && progress === 0) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-[3px] bg-transparent"
    >
      <div
        className="h-full transition-[width,opacity] duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
          backgroundColor: '#d4af37',
          boxShadow: '0 0 14px #d4af37, 0 0 6px #d4af37, 0 0 2px #d4af37',
        }}
      />
    </div>
  );
}
