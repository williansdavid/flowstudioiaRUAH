import type { AppointmentItem } from '../../types';

interface Props {
  appointment: AppointmentItem;
  top: number;
  height: number;
  onClick?: (e: React.MouseEvent) => void;
}

export function AppointmentBlock({ appointment, top, height, onClick }: Props) {
  // Paleta Premium para Dark Mode: Fundo translúcido, borda sutil e destaque na lateral esquerda
  const statusColors: Record<string, string> = {
    confirmed: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 border-l-emerald-500',
    pending: 'bg-amber-500/10 border-amber-500/20 text-amber-300 border-l-amber-500',
    cancelled: 'bg-rose-500/10 border-rose-500/20 text-rose-300 border-l-rose-500',
    completed: 'bg-blue-500/10 border-blue-500/20 text-blue-300 border-l-blue-500',
  };

  const colorClass = statusColors[appointment.status] || statusColors.pending;

  return (
    <div
      onClick={onClick}
      className={`absolute left-1.5 right-1.5 rounded-md border border-l-4 p-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:z-20 hover:brightness-110 overflow-hidden backdrop-blur-sm ${colorClass}`}
      style={{
        top: `${top}px`,
        height: `${height}px`,
      }}
    >
      <p className="truncate text-xs font-semibold tracking-wide leading-tight mb-0.5">
        {appointment.clientName}
      </p>
      <p className="truncate text-[10px] opacity-80 leading-tight">
        {appointment.serviceName}
      </p>
      <p className="truncate text-[10px] font-medium opacity-70 leading-tight mt-1">
        {new Date(appointment.startsAt).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </div>
  );
}