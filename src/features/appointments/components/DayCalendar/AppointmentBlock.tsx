// src/features/appointments/components/DayCalendar/AppointmentBlock.tsx
import type { AppointmentItem, AppointmentStatus } from '../../types';
import { topPx, heightPx } from './geometry';

const timeFmt = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
});

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
  /** Largura fracionária quando há sobreposição (0–1). */
  widthFraction: number;
  /** Deslocamento horizontal em fração (0–1). */
  leftFraction: number;
  onClick?: (a: AppointmentItem) => void;
}

export function AppointmentBlock({
  appointment: a,
  color,
  widthFraction,
  leftFraction,
  onClick,
}: Props) {
  const top = topPx(a.startsAt);
  const height = heightPx(a.startsAt, a.endsAt);

  return (
    <button
      type="button"
      onClick={() => onClick?.(a)}
      title={`${a.clientName} — ${a.serviceName}`}
      className={`absolute overflow-hidden rounded-button px-1.5 py-1 text-left text-white shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-white/60 ${STATUS_STYLE[a.status]}`}
      style={{
        top,
        height: Math.max(height - 2, 0),
        left: `calc(${leftFraction * 100}% + 2px)`,
        width: `calc(${widthFraction * 100}% - 4px)`,
        backgroundColor: color,
      }}
    >
      <span className="block truncate text-[10px] font-semibold leading-tight tabular-nums">
        {timeFmt.format(new Date(a.startsAt))}
      </span>
      <span className="block truncate text-[11px] font-semibold leading-tight">
        {a.clientName}
      </span>
      {height > 36 && (
        <span className="block truncate text-[10px] leading-tight opacity-90">
          {a.serviceName}
        </span>
      )}
    </button>
  );
}
