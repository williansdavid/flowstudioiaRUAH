import { CalendarClock } from 'lucide-react';
import type { DashboardAppointmentItem } from '@/features/dashboard/types';

const STATUS_LABEL: Record<DashboardAppointmentItem['status'], string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  no_show: 'Não compareceu',
};

const timeFmt = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
});

interface Props {
  items: DashboardAppointmentItem[];
}

export function UpcomingAppointments({ items }: Props) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold">Agendamentos de hoje</h2>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhum agendamento para hoje.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((a) => (
            <li key={a.id} className="flex items-center gap-3 py-3">
              <span className="flex items-center gap-1.5 text-sm font-medium tabular-nums">
                <CalendarClock className="h-4 w-4 text-muted-foreground" aria-hidden />
                {timeFmt.format(new Date(a.startsAt))}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{a.clientName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {a.serviceName} · {a.staffName}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {STATUS_LABEL[a.status]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
