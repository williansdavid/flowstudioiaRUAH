/**
 * ============================================
 * WeekView
 * ============================================
 *
 * Visualizacao semanal (segunda a domingo).
 * Uma coluna por dia.
 *
 * Header de coluna:
 *  - Weekday (abreviado) + dia/mes
 *  - Dia atual recebe destaque dourado (texto + tint na coluna)
 *  - Badge "HOJE" pra reforco visual
 *
 * Tematizado via tokens CSS.
 */

import { useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import type { AdminAppointmentItem } from "@/features/appointments/types";
import { buildWeekViewData } from "../slot-mapping";
import type { PositionedAppointment, WeekViewColumn } from "../types";
import { CalendarGrid, type CalendarGridColumn } from "./CalendarGrid";
import { AppointmentCard } from "./AppointmentCard";

interface WeekViewProps {
  appointments: AdminAppointmentItem[];
  currentDate: Date;
  onAppointmentClick?: (positioned: PositionedAppointment) => void;
  onSlotClick?: (params: { date: Date; slotIndex: number }) => void;
}

function getMondayOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const weekdayShortFmt = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });
const dayMonthFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
});

export function WeekView({
  appointments,
  currentDate,
  onAppointmentClick,
  onSlotClick,
}: WeekViewProps) {
  const weekStart = useMemo(() => getMondayOfWeek(currentDate), [currentDate]);

  const data = useMemo(
    () => buildWeekViewData(appointments, weekStart),
    [appointments, weekStart],
  );

  const today = new Date();

  const gridColumns: CalendarGridColumn<WeekViewColumn>[] = data.columns.map(
    (col) => {
      const isCurrentDay = isSameLocalDay(col.date, today);
      return {
        key: col.date.toISOString(),
        data: col,
        showNowLine: isCurrentDay,
        isToday: isCurrentDay,
      };
    },
  );

  return (
    <CalendarGrid
      columns={gridColumns}
      renderHeader={(col) => {
        const isCurrentDay = isSameLocalDay(col.data.date, today);
        const weekdayLabel = capitalize(
          weekdayShortFmt.format(col.data.date).replace(".", ""),
        );
        const dayMonthLabel = dayMonthFmt.format(col.data.date);

        return (
          <div className="flex flex-col items-center justify-center gap-0.5 leading-tight">
            <span
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wide",
              )}
              style={{
                color: isCurrentDay
                  ? "var(--brand-300, var(--brand-500))"
                  : "var(--fg-subtle)",
              }}
            >
              {weekdayLabel}
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className="text-sm font-bold tabular-nums"
                style={{
                  color: isCurrentDay
                    ? "var(--brand-300, var(--brand-500))"
                    : "var(--fg-strong)",
                }}
              >
                {dayMonthLabel}
              </span>
              {isCurrentDay && (
                <span
                  className="inline-flex items-center rounded-full px-1.5 text-[9px] font-bold uppercase tracking-wider"
                  style={{
                    background: "var(--brand-gradient, var(--brand-500))",
                    color: "var(--brand-fg)",
                    boxShadow: "var(--metal-highlight)",
                  }}
                >
                  Hoje
                </span>
              )}
            </div>
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
              onSlotClick({ date: col.data.date, slotIndex })
          : undefined
      }
    />
  );
}

function capitalize(str: string): string {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
