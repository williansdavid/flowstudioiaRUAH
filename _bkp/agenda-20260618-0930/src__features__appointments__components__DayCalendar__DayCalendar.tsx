// src/features/appointments/components/DayCalendar/DayCalendar.tsx
import type { AppointmentItem, BookableStaffItem } from '../../types';
import { GRID_HEIGHT_PX } from './geometry';
import { staffColor } from './staffColor';
import { TimeAxis } from './TimeAxis';
import { StaffColumn } from './StaffColumn';

interface Props {
  /** 'YYYY-MM-DD' do dia exibido. */
  date: string;
  staff: BookableStaffItem[];
  appointments: AppointmentItem[];
  onAppointmentClick?: (a: AppointmentItem) => void;
}

export function DayCalendar({ staff, appointments, onAppointmentClick }: Props) {
  // Agrupa appointments por staff uma vez.
  const byStaff = new Map<string, AppointmentItem[]>();
  for (const a of appointments) {
    const list = byStaff.get(a.staffId);
    if (list) list.push(a);
    else byStaff.set(a.staffId, [a]);
  }

  if (staff.length === 0) {
    return (
      <div className="rounded-card border border-border bg-surface p-5 shadow-md">
        <p className="py-8 text-center text-sm text-text-muted">
          Nenhum profissional disponível para agendamento.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface shadow-md">
      {/* Cabeçalho de colunas (sticky) */}
      <div className="flex border-b border-border bg-surface-2">
        <div className="w-14 shrink-0 border-r border-border" aria-hidden />
        {staff.map((s) => {
          const color = staffColor(s.id);
          return (
            <div
              key={s.id}
              className="flex flex-1 items-center gap-1.5 border-r border-border px-2 py-2"
              style={{ minWidth: 120 }}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
                aria-hidden
              />
              <span
                className="truncate text-xs font-bold tracking-tight"
                style={{ color }}
              >
                {s.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Corpo scrollável */}
      <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
        <div className="flex" style={{ height: GRID_HEIGHT_PX }}>
          <TimeAxis />
          {staff.map((s) => (
            <StaffColumn
              key={s.id}
              staff={s}
              appointments={byStaff.get(s.id) ?? []}
              onAppointmentClick={onAppointmentClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
