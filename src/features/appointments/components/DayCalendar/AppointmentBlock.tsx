// src/features/appointments/components/DayCalendar/AppointmentBlock.tsx
import type { AppointmentItem } from '../../types';
import { staffColor } from './staffColor';

interface Props {
  appointment: AppointmentItem;
  top: number;
  height: number;
  onClick?: (e: React.MouseEvent) => void;
}

const STATUS_STYLE: Record<AppointmentItem['status'], { border: string; text: string }> = {
  confirmed: { border: '#10b981', text: 'text-emerald-400' },
  pending: { border: '#f59e0b', text: 'text-amber-400' },
  cancelled: { border: '#f43f5e', text: 'text-rose-400' },
  completed: { border: '#3b82f6', text: 'text-blue-400' },
  no_show: { border: '#f43f5e', text: 'text-rose-400' },
};

export function AppointmentBlock({ appointment, top, height, onClick }: Props) {
  const staffAccent = appointment.staffColor ?? staffColor(appointment.staffId);
  const status = STATUS_STYLE[appointment.status] ?? STATUS_STYLE.pending;

  const padClass = height < 60 ? 'p-1.5' : height < 100 ? 'p-2' : 'p-3';

  return (
    <div
      onClick={onClick}
      className={`absolute left-1.5 right-1.5 rounded-md border bg-black/20 ${padClass} cursor-pointer transition-all duration-200 hover:z-20 hover:scale-[1.02] hover:brightness-125 overflow-hidden backdrop-blur-md`}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        borderLeft: `3px solid ${status.border}`,
        borderTop: `2px solid ${staffAccent}`,
      }}
    >
      <div className="flex items-baseline justify-between gap-1">
        <p className="truncate text-xs font-semibold leading-tight text-white min-w-0">
          {appointment.clientName}
        </p>
        <span className="shrink-0 truncate text-[10px] font-bold leading-tight text-primary">
          {appointment.serviceName}
        </span>
      </div>

      <p className={`truncate text-[10px] font-medium leading-tight mt-1 ${status.text}`}>
        {new Date(appointment.startsAt).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </div>
  );
}