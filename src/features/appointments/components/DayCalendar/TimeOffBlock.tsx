// src/features/appointments/components/DayCalendar/TimeOffBlock.tsx
import { staffColor } from './staffColor';
import { calculateTop, calculateHeight } from '../../utils/calendarUtils';

interface Props {
  startsAt: string;
  endsAt: string;
  reason: string | null;
  staffId: string;
  staffColorFromDb: string | null;
}

export function TimeOffBlock({
  startsAt,
  endsAt,
  reason,
  staffId,
  staffColorFromDb,
}: Props) {
  const color = staffColorFromDb ?? staffColor(staffId);
  const top = calculateTop(startsAt);
  const height = calculateHeight(startsAt, endsAt);

  return (
    <div
      className="absolute left-1 right-1 rounded-md overflow-hidden pointer-events-none select-none z-5"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        minHeight: '24px',
      }}
    >
      {/* Fundo translúcido na cor do staff */}
      <div
        className="absolute inset-0 rounded-md"
        style={{
          backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
        }}
      />
      {/* Listras diagonais na cor #805158 */}
      <div
        className="absolute inset-0 rounded-md"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 4px,
            #f700254d 4px,
            #e70e2e91 8px
          )`,
          opacity: 0.3,
        }}
      />
      {/* Borda lateral grossa na cor do staff */}
      <div
        className="absolute left-0 top-0 bottom-0 rounded-l-md"
        style={{
          width: '3px',
          backgroundColor: color,
        }}
      />
      {/* Conteúdo */}
      <div className="relative z-10 flex flex-col justify-center h-full px-2.5 py-1">
        <p className="truncate text-[11px] font-semibold leading-tight" style={{ color }}>
          {reason || 'Indisponível'}
        </p>
        <p className="truncate text-[9px] leading-tight text-slate-500 mt-0.5">
          {new Date(startsAt).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
          {' — '}
          {new Date(endsAt).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}