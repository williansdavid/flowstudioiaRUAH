/**
 * ============================================
 * WeekView
 * ============================================
 *
 * Visualizacao semanal da agenda (segunda a domingo).
 * Uma coluna por dia da semana.
 *
 * Diferencas vs DayView:
 *  - Sempre renderiza as 7 colunas (mesmo sem agendamentos)
 *    -> usuario precisa ver a estrutura semanal pra navegar
 *  - Nao agrupa por staff (cor do status diferencia visualmente)
 *  - Header destaca o "dia de hoje" com cor diferente
 *  - showNowLine apenas na coluna do dia de hoje
 *
 * Composicao:
 *  - CalendarGrid (estrutura)
 *  - AppointmentCard (cards posicionados)
 *  - CalendarNowLine (renderizada internamente pelo grid)
 *
 * Empty state:
 *  - NAO renderiza placeholder. Semana vazia mostra grid limpo.
 *  - Decisao consciente: oposto do DayView (que mostra EmptyState).
 */

import { useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import type { AdminAppointmentItem } from "@/features/appointments/types";
import { buildWeekViewData } from "../slot-mapping";
import type { PositionedAppointment, WeekViewColumn } from "../types";
import { CalendarGrid, type CalendarGridColumn } from "./CalendarGrid";
import { AppointmentCard } from "./AppointmentCard";

interface WeekViewProps {
  /** Lista de appointments. Pode conter de outras semanas — o WeekView filtra. */
  appointments: AdminAppointmentItem[];
  /**
   * Qualquer dia DENTRO da semana alvo. WeekView normaliza pra segunda-feira.
   * (segue o mesmo contrato que o CalendarHeader passa).
   */
  currentDate: Date;
  /** Callback ao clicar em um card. */
  onAppointmentClick?: (positioned: PositionedAppointment) => void;
  /** Callback ao clicar em slot vazio. Recebe data do dia + indice do slot. */
  onSlotClick?: (params: { date: Date; slotIndex: number }) => void;
}

/**
 * Normaliza qualquer dia da semana pra segunda-feira 00:00 local.
 * Padrao brasileiro: semana comeca na segunda.
 *
 * NOTA: replica logica do CalendarHeader.getWeekStart.
 * Futura refatoracao: extrair pra @/features/calendar/utils/date.ts.
 */
function getMondayOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay(); // 0=domingo, 1=segunda, ..., 6=sabado
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * True se as duas datas sao o mesmo dia civil local.
 */
function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Formatters memoizaveis (modulo-scope = criados 1x)
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

  // Hoje (calculado 1x na renderizacao — barato, sem precisar de useMemo)
  const today = new Date();

  const gridColumns: CalendarGridColumn<WeekViewColumn>[] = data.columns.map(
    (col) => ({
      key: col.date.toISOString(),
      data: col,
      showNowLine: isSameLocalDay(col.date, today),
    }),
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
          <div className="flex flex-col items-center justify-center leading-tight">
            <span
              className={cn(
                "text-[11px] font-medium uppercase",
                isCurrentDay ? "text-blue-600" : "text-neutral-500",
              )}
            >
              {weekdayLabel}
            </span>
            <span
              className={cn(
                "text-sm font-semibold tabular-nums",
                isCurrentDay ? "text-blue-600" : "text-neutral-900",
              )}
            >
              {dayMonthLabel}
            </span>
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

/**
 * Capitaliza primeira letra (replica de CalendarHeader.capitalize).
 */
function capitalize(str: string): string {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
