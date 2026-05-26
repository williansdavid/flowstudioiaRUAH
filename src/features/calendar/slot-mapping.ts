/**
 * ============================================
 * Calendar - slot mapping (funcoes puras)
 * ============================================
 *
 * Transformam AdminAppointmentItem[] em estruturas posicionadas
 * prontas pro grid renderizar.
 *
 * IMPORTANTE: tudo puro, sem React, sem estado.
 * Facilita testes e otimizacao via useMemo nos componentes.
 */

import type { AdminAppointmentItem } from "@/features/appointments/types";
import {
  CALENDAR_SLOTS_PER_DAY,
  dateToSlotIndex,
} from "./constants";
import type {
  DayViewColumn,
  DayViewData,
  PositionedAppointment,
  WeekViewColumn,
  WeekViewData,
} from "./types";

// ============================================================
// HELPERS PRIVADOS
// ============================================================

/**
 * Verifica se uma data esta no mesmo dia LOCAL que outra.
 */
function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Calcula o dayIndex (0 = segunda, 6 = domingo) de uma data.
 * getDay() nativo: 0 = domingo, 1 = segunda, ..., 6 = sabado.
 */
function getMondayBasedDayIndex(date: Date): number {
  const sundayBased = date.getDay();
  return sundayBased === 0 ? 6 : sundayBased - 1;
}

/**
 * Posiciona UM appointment no grid.
 *
 * - slotStart/slotEnd: posicao "verdadeira" (pode estar fora da janela)
 * - visibleSlotStart/visibleSlotEnd: clamped pra janela visivel
 * - isClippedStart/isClippedEnd: flags pra UI indicar overflow
 *
 * Retorna null se o appointment esta COMPLETAMENTE fora da janela
 * (ex: comeca 21:00 e termina 22:00 — nem entra no grid).
 */
function positionAppointment(
  appointment: AdminAppointmentItem,
): PositionedAppointment | null {
  const startsAt = new Date(appointment.startsAt);
  const endsAt = new Date(appointment.endsAt);

  const slotStart = dateToSlotIndex(startsAt);
  const slotEnd = dateToSlotIndex(endsAt);

  // Caso degenerado: ends <= starts — assume 1 slot
  const safeSlotEnd = slotEnd > slotStart ? slotEnd : slotStart + 1;

  // Completamente fora da janela?
  if (safeSlotEnd <= 0 || slotStart >= CALENDAR_SLOTS_PER_DAY) {
    return null;
  }

  const visibleSlotStart = Math.max(0, slotStart);
  const visibleSlotEnd = Math.min(CALENDAR_SLOTS_PER_DAY, safeSlotEnd);

  return {
    appointment,
    slotStart,
    slotEnd: safeSlotEnd,
    visibleSlotStart,
    visibleSlotEnd,
    isClippedStart: slotStart < 0,
    isClippedEnd: safeSlotEnd > CALENDAR_SLOTS_PER_DAY,
  };
}

// ============================================================
// API PUBLICA — DAY VIEW
// ============================================================

/**
 * Monta DayViewData a partir de appointments + data alvo.
 *
 * - Filtra appointments que sao do dia local correto.
 * - Agrupa por staff (uma coluna por profissional).
 * - Ordena colunas alfabeticamente por nome do staff.
 * - Ignora appointments completamente fora da janela 08:00-20:00.
 *
 * @param appointments Lista (geralmente cobrindo apenas o dia, mas tolerante)
 * @param targetDate Data alvo (qualquer hora — usamos so YYYY-MM-DD local)
 */
export function buildDayViewData(
  appointments: AdminAppointmentItem[],
  targetDate: Date,
): DayViewData {
  const dayStart = new Date(targetDate);
  dayStart.setHours(0, 0, 0, 0);

  // 1. Filtrar appointments do dia
  const dayAppointments = appointments.filter((apt) =>
    isSameLocalDay(new Date(apt.startsAt), dayStart),
  );

  // 2. Agrupar por staffId
  const byStaff = new Map<
    string,
    { staffName: string; items: PositionedAppointment[] }
  >();

  for (const apt of dayAppointments) {
    const positioned = positionAppointment(apt);
    if (!positioned) continue;

    const existing = byStaff.get(apt.staffId);
    if (existing) {
      existing.items.push(positioned);
    } else {
      byStaff.set(apt.staffId, {
        staffName: apt.staffName,
        items: [positioned],
      });
    }
  }

  // 3. Converter em colunas ordenadas
  const columns: DayViewColumn[] = Array.from(byStaff.entries())
    .map(([staffId, { staffName, items }]) => ({
      staffId,
      staffName,
      appointments: items.sort((a, b) => a.slotStart - b.slotStart),
    }))
    .sort((a, b) =>
      a.staffName.localeCompare(b.staffName, "pt-BR", { sensitivity: "base" }),
    );

  return {
    date: dayStart,
    columns,
    totalAppointments: dayAppointments.length,
  };
}

// ============================================================
// API PUBLICA — WEEK VIEW
// ============================================================

/**
 * Monta WeekViewData a partir de appointments + segunda-feira da semana.
 *
 * - Cria 7 colunas (segunda a domingo).
 * - Distribui appointments na coluna do dia correto.
 * - Dentro de cada dia, NAO agrupa por staff (cor distingue na UI).
 * - Ignora appointments fora da janela.
 *
 * @param appointments Lista cobrindo a semana
 * @param weekStart Segunda-feira da semana alvo (00:00 local idealmente)
 */
export function buildWeekViewData(
  appointments: AdminAppointmentItem[],
  weekStart: Date,
): WeekViewData {
  const mondayStart = new Date(weekStart);
  mondayStart.setHours(0, 0, 0, 0);

  // 1. Inicializa 7 colunas vazias
  const columns: WeekViewColumn[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(mondayStart);
    date.setDate(date.getDate() + i);
    columns.push({
      date,
      dayIndex: i,
      appointments: [],
    });
  }

  let totalCount = 0;

  // 2. Distribui appointments
  for (const apt of appointments) {
    const startsAt = new Date(apt.startsAt);

    // So conta os que caem dentro da semana
    const matchingColumn = columns.find((col) =>
      isSameLocalDay(col.date, startsAt),
    );
    if (!matchingColumn) continue;

    totalCount++;

    const positioned = positionAppointment(apt);
    if (!positioned) continue;

    matchingColumn.appointments.push(positioned);
  }

  // 3. Ordena appointments dentro de cada dia
  for (const col of columns) {
    col.appointments.sort((a, b) => a.slotStart - b.slotStart);
  }

  return {
    weekStart: mondayStart,
    columns,
    totalAppointments: totalCount,
  };
}

// ============================================================
// API PUBLICA — UTILITARIOS EXPORTADOS
// ============================================================

export { getMondayBasedDayIndex };
