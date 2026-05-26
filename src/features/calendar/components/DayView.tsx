/**
 * ============================================
 * DayView
 * ============================================
 *
 * Visualizacao de UM dia da agenda.
 * Uma coluna por staff que tem appointment no dia.
 *
 * Composicao:
 *  - CalendarGrid (estrutura)
 *  - AppointmentCard (cards posicionados)
 *  - CalendarNowLine (renderizada internamente pelo grid se showNowLine=true)
 *
 * Decisoes:
 *  - Dia sem appointments => EmptyState (nao renderiza grid vazio)
 *  - Linha do agora aparece em TODAS as colunas se a data for hoje
 *  - Filtro/agrupamento por staff fica em slot-mapping.ts (puro)
 *  - Sem estado interno — controlado 100% pelo parent
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
  /** Lista de appointments. Pode conter de outros dias — o DayView filtra. */
  appointments: AdminAppointmentItem[];
  /** Data alvo. So a parte de data (YYYY-MM-DD local) e usada. */
  date: Date;
  /** Callback ao clicar em um card. */
  onAppointmentClick?: (positioned: PositionedAppointment) => void;
  /** Callback ao clicar num slot vazio. Recebe staffId + indice do slot. */
  onSlotClick?: (params: { staffId: string; slotIndex: number }) => void;
}

/**
 * True se a data alvo e o dia local de hoje.
 */
function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
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

  // ============================================
  // EMPTY STATE: nenhum staff com appointment no dia
  // ============================================
  if (data.columns.length === 0) {
    return (
      <EmptyState
        icon={CalendarX2}
        title="Nenhum agendamento neste dia"
        description="Use a navegacao acima pra trocar de dia ou criar um novo agendamento."
      />
    );
  }

  // ============================================
  // GRID NORMAL
  // ============================================
  const gridColumns: CalendarGridColumn<DayViewColumn>[] = data.columns.map(
    (col) => ({
      key: col.staffId,
      data: col,
      showNowLine: todayFlag,
    }),
  );

  return (
    <CalendarGrid
      columns={gridColumns}
      renderHeader={(col) => (
        <span className="truncate" title={col.data.staffName}>
          {col.data.staffName}
        </span>
      )}
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
