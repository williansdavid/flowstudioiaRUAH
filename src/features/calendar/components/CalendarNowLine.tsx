/**
 * ============================================
 * CalendarNowLine
 * ============================================
 *
 * Linha horizontal DOURADA indicando o horario atual.
 *
 * - Aparece SOMENTE se "agora" estiver dentro da janela 08:00-20:00
 *   e se a coluna corresponder ao DIA atual (controle do parent via prop `show`).
 * - Atualiza a cada 60 segundos.
 * - Glow sutil pra dar peso visual sem agressividade (linha vermelha era brega).
 */

import { useEffect, useState } from "react";
import {
  CALENDAR_DAY_END_HOUR,
  CALENDAR_DAY_START_HOUR,
  CALENDAR_SLOT_HEIGHT_PX,
  CALENDAR_SLOT_MINUTES,
} from "../constants";

interface CalendarNowLineProps {
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

  if (minutesFromDayStart < 0 || minutesFromDayStart >= minutesInWindow) {
    return null;
  }

  const pixelsPerMinute = CALENDAR_SLOT_HEIGHT_PX / CALENDAR_SLOT_MINUTES;
  const topPx = minutesFromDayStart * pixelsPerMinute;

  const timeLabel = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes(),
  ).padStart(2, "0")}`;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-30 flex items-center"
      style={{ top: `${topPx}px` }}
      aria-label={`Agora: ${timeLabel}`}
    >
      {/* Bolinha dourada com glow */}
      <div
        className="relative h-2.5 w-2.5 -translate-x-1/2 rounded-full"
        style={{
          backgroundColor: "var(--brand-500)",
          boxShadow:
            "0 0 0 3px var(--bg-card), 0 0 12px 2px oklch(0.72 0.12 80 / 0.55)",
        }}
      />
      {/* Linha dourada */}
      <div
        className="h-px flex-1"
        style={{
          background:
            "linear-gradient(to right, var(--brand-500) 0%, var(--brand-500) 60%, transparent 100%)",
          boxShadow: "0 0 6px 0 oklch(0.72 0.12 80 / 0.4)",
        }}
      />
    </div>
  );
}
