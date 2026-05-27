/**
 * ============================================
 * DayView
 * ============================================
 *
 * Visualizacao de UM dia da agenda.
 * Uma coluna por staff que tem appointment no dia.
 *
 * Header de coluna premium:
 *  - Avatar circular dourado com inicial do nome
 *  - Nome do staff
 *  - Badge de contagem de agendamentos
 *
 * Tematizado via tokens CSS.
 */

import { useMemo } from "react";
import { CalendarX2 } from "lucide-react";
import type { AdminAppointmentItem } from "@/features/appointments/types";
import { buildDayViewData } from "../slot-mapping";
import type { DayViewColumn, PositionedAppointment } from "../types";
import { CalendarGrid, type CalendarGridColumn } from "./CalendarGrid";
import { AppointmentCard } from "./AppointmentCard";
import { EmptyState } from "@/components/ui/EmptyState";

interface DayViewProps {
  appointments: AdminAppointmentItem[];
  date: Date;
  onAppointmentClick?: (positioned: PositionedAppointment) => void;
  onSlotClick?: (params: { staffId: string; slotIndex: number }) => void;
}

function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

/**
 * Extrai a inicial (1 letra maiuscula) do nome.
 * "Maria Silva" -> "M"; "" -> "?".
 */
function getInitial(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length === 0) return "?";
  return trimmed.charAt(0).toUpperCase();
}

export function DayView({
  appointments,
  date,
  onAppointmentClick,
  onSlotClick,
}: DayViewProps) {
  const data = useMemo(
    () => buildDayViewData(appointments, date),
    [appointments, date],
  );

  const todayFlag = useMemo(() => isToday(data.date), [data.date]);

  if (data.columns.length === 0) {
    return (
      <EmptyState
        icon={CalendarX2}
        title="Nenhum agendamento neste dia"
        description="Use a navegacao acima pra trocar de dia ou criar um novo agendamento."
      />
    );
  }

  const gridColumns: CalendarGridColumn<DayViewColumn>[] = data.columns.map(
    (col) => ({
      key: col.staffId,
      data: col,
      showNowLine: todayFlag,
      // No DayView, "isToday" se aplica a TODAS as colunas se a data e hoje
      isToday: todayFlag,
    }),
  );

  return (
    <CalendarGrid
      columns={gridColumns}
      renderHeader={(col) => {
        const count = col.data.appointments.length;
        return (
          <div className="flex w-full items-center justify-center gap-2 px-1">
            {/* Avatar com inicial */}
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
              style={{
                background: "var(--brand-gradient, var(--brand-500))",
                color: "var(--brand-fg)",
                boxShadow: "var(--metal-highlight)",
              }}
              aria-hidden
            >
              {getInitial(col.data.staffName)}
            </div>

            {/* Nome */}
            <span
              className="truncate text-sm font-semibold"
              style={{ color: "var(--fg-strong)" }}
              title={col.data.staffName}
            >
              {col.data.staffName}
            </span>

            {/* Badge de contagem */}
            {count > 0 && (
              <span
                className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold tabular-nums"
                style={{
                  backgroundColor: "oklch(0.72 0.12 80 / 0.15)",
                  color: "var(--brand-300, var(--brand-500))",
                  border: "1px solid oklch(0.72 0.12 80 / 0.25)",
                }}
                aria-label={`${count} agendamentos`}
              >
                {count}
              </span>
            )}
          </div>
        );
      }}
      renderColumn={(col) =>
        col.data.appointments.map((positioned) => (
          <AppointmentCard
            key={positioned.appointment.id}
            positioned={positioned}
            onClick={onAppointmentClick}
          />
        ))
      }
      onSlotClick={
        onSlotClick
          ? (col, slotIndex) =>
              onSlotClick({ staffId: col.data.staffId, slotIndex })
          : undefined
      }
    />
  );
}
