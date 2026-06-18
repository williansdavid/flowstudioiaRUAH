// src/features/appointments/components/DayCalendar/AppointmentBlock.tsx
import React from 'react';
import type { AppointmentItem, AppointmentStatus } from '../../types';
import { topPx, heightPx } from './geometry';

/** Opacidade/estilo por status — completed e no_show ficam mais apagados. */
const STATUS_STYLE: Record<AppointmentStatus, string> = {
  pending: 'opacity-100',
  confirmed: 'opacity-100 ring-1 ring-inset ring-white/40',
  completed: 'opacity-60',
  cancelled: 'opacity-40 line-through',
  no_show: 'opacity-50',
};

interface Props {
  appointment: AppointmentItem;
  color: string;
  widthFraction: number;
  leftFraction: number;
  isDragging?: boolean;
  onPointerDown?: (e: React.PointerEvent, appointmentId: string, mode: 'drag' | 'resize') => void;
  onClick?: (a: AppointmentItem) => void;
}

export function AppointmentBlock({
  appointment: a,
  color,
  widthFraction,
  leftFraction,
  isDragging = false,
  onPointerDown,
  onClick,
}: Props) {
  const top = topPx(a.startsAt);
  const height = heightPx(a.startsAt, a.endsAt);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Se o clique for no handle de redimensionamento (últimos 12px), ativa resize
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const mode = relativeY > height - 12 ? 'resize' : 'drag';
    onPointerDown?.(e, a.id, mode);
  };

  return (
    <div
      role="button"
      onPointerDown={handlePointerDown}
      onClick={(e) => {
        // Evita abrir o modal se houve arraste
        if (!isDragging) onClick?.(a);
      }}
      className={`absolute overflow-hidden rounded-button px-1.5 py-1 text-left text-white shadow-sm transition-shadow hover:shadow-md focus:outline-none ${
        isDragging
          ? 'z-50 cursor-grabbing ring-2 ring-white shadow-xl scale-[1.02]'
          : 'z-10 cursor-grab'
      } ${STATUS_STYLE[a.status]}`}
      style={{
        top: `${top}px`,
        height: `${Math.max(height - 2, 0)}px`,
        left: `calc(${leftFraction * 100}% + 2px)`,
        width: `calc(${widthFraction * 100}% - 4px)`,
        backgroundColor: color,
        touchAction: 'none', // Crítico para mobile-first: impede o scroll nativo durante o drag
      }}
    >
      <div className="flex flex-col h-full justify-between">
        <div>
          <span className="block truncate text-[10px] font-semibold leading-tight tabular-nums">
            {new Date(a.startsAt).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          <span className="block truncate text-[11px] font-semibold leading-tight">
            {a.clientName}
          </span>
        </div>
        {/* Handle de redimensionamento visual */}
        <div className="w-full h-1.5 flex justify-center items-center opacity-30 group-hover:opacity-100">
          <div className="w-8 h-1 bg-white rounded-full" />
        </div>
      </div>
    </div>
  );
}