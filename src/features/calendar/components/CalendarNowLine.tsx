/**
 * ============================================
 * CalendarNowLine
 * ============================================
 *
 * Linha horizontal vermelha indicando o horario atual.
 *
 * - Aparece SOMENTE se "agora" estiver dentro da janela 08:00-20:00
 *   e se a coluna corresponder ao DIA atual (controle do parent via prop `show`).
 * - Atualiza a cada 60 segundos.
 * - Posicionada absolutamente sobre as colunas de conteudo.
 */

import { useEffect, useState } from "react";
import {
  CALENDAR_DAY_END_HOUR,
  CALENDAR_DAY_START_HOUR,
  CALENDAR_SLOT_HEIGHT_PX,
  CALENDAR_SLOT_MINUTES,
} from "../constants";

interface CalendarNowLineProps {
  /** Se false, nao renderiza (ex: nao e hoje). */
  show: boolean;
}

export function CalendarNowLine({ show }: CalendarNowLineProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!show) return;
    const tick = () => setNow(new Date());
    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, [show]);

  if (!show) return null;

  const minutesFromMidnight = now.getHours() * 60 + now.getMinutes();
  const minutesFromDayStart =
    minutesFromMidnight - CALENDAR_DAY_START_HOUR * 60;
  const minutesInWindow =
    (CALENDAR_DAY_END_HOUR - CALENDAR_DAY_START_HOUR) * 60;

  // Fora da janela visivel — nao renderiza
  if (minutesFromDayStart < 0 || minutesFromDayStart >= minutesInWindow) {
    return null;
  }

  const pixelsPerMinute = CALENDAR_SLOT_HEIGHT_PX / CALENDAR_SLOT_MINUTES;
  const topPx = minutesFromDayStart * pixelsPerMinute;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-30 flex items-center"
      style={{ top: `${topPx}px` }}
      aria-hidden="true"
    >
      <div className="h-2 w-2 -translate-x-1/2 rounded-full bg-red-500" />
      <div className="h-px flex-1 bg-red-500" />
    </div>
  );
}
