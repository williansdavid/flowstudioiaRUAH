// src/features/appointments/components/DayCalendar/NowLine.tsx
import { useEffect, useState } from 'react';
import { topPx, DAY_START_HOUR, DAY_END_HOUR } from './geometry';

function nowISO(): string {
  return new Date().toISOString();
}

function isVisible(): boolean {
  const now = new Date();
  // ✅ CORREÇÃO: usar getHours() em vez de getUTCHours()
  const h = now.getHours();
  return h >= DAY_START_HOUR && h < DAY_END_HOUR;
}

export function NowLine() {
  const [iso, setIso] = useState(nowISO);
  const [visible, setVisible] = useState(isVisible);

  useEffect(() => {
    const id = setInterval(() => {
      setIso(nowISO());
      setVisible(isVisible());
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  if (!visible) return null;

  const top = topPx(iso);

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
      style={{ top }}
      aria-hidden
    >
      <span className="h-2 w-2 shrink-0 rounded-full bg-red-500 -translate-x-1" />
      <div className="h-px flex-1 bg-red-500" />
    </div>
  );
}