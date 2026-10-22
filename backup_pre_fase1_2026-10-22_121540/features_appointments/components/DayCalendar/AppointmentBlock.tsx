// src/features/appointments/components/DayCalendar/AppointmentBlock.tsx
import { Scissors } from 'lucide-react';
import type { AppointmentItem } from '../../types';

interface AppointmentBlockProps {
  appointment: AppointmentItem;
  /** Posição absoluta (px) no calendário — passado pelo StaffColumn */
  top?: number;
  /** Altura (px) do bloco no calendário — passado pelo StaffColumn */
  height?: number;
  /** Recebe o evento (para stopPropagation no StaffColumn) */
  onClick?: (e: React.MouseEvent) => void;
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'border-l-emerald-500',
  pending: 'border-l-amber-400',
  cancelled: 'border-l-rose-400 opacity-70',
  completed: 'border-l-sky-500',
};

export function AppointmentBlock({
  appointment,
  top,
  height,
  onClick,
}: AppointmentBlockProps) {
  const { services, serviceName, clientName, status } = appointment;

  // Lista de serviços exibida quando há multi (2+) ou snapshot único.
  // Fallback: serviceName legado (agendamento antigo de 1 serviço).
  const showServiceList = services.length > 0;
  const displayServices = showServiceList
    ? services
    : [{ serviceName } as { serviceName: string }];

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ top, height }}
      className={[
        'group w-full rounded-lg border-l-4 bg-black/60 px-2.5 py-2 text-left',
        'shadow-sm transition-colors hover:shadow-md',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500',
        // Posicionamento absoluto quando top/height são fornecidos (StaffColumn)
        typeof top === 'number' && typeof height === 'number'
          ? 'absolute overflow-hidden z-20'
          : 'relative',
        STATUS_STYLES[status] ?? 'border-l-slate-400',
      ].join(' ')}
    >
      {/* Linha 1: nome do cliente */}
      <p className="truncate text-[13px] font-semibold leading-tight text-slate-100">
        {clientName}
      </p>

      {/* Linha 2: serviços */}
      <div className="mt-1 flex flex-wrap gap-1">
        {displayServices.map((svc, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 rounded bg-white/10 px-1 py-px text-[10px] font-medium text-slate-300"
          >
            <Scissors className="h-2.5 w-2.5 text-slate-400" aria-hidden />
            {svc.serviceName}
          </span>
        ))}
      </div>
    </button>
  );
}