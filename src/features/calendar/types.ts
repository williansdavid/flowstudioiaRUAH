/**
 * ============================================
 * Calendar - tipos da feature
 * ============================================
 *
 * Tipos consumidos pelos componentes de calendario.
 * Construidos a partir de AdminAppointmentItem via slot-mapping.
 */

import type { AdminAppointmentItem } from "@/features/appointments/types";

/**
 * Modo de visualizacao do calendario.
 * Mes fica como evolucao futura.
 */
export type CalendarView = "day" | "week";

/**
 * Appointment posicionado no grid.
 *
 * Inclui:
 *  - dados originais (appointment)
 *  - posicao calculada (slotStart, slotEnd)
 *  - flag de clipping (parte do appointment fora da janela visivel)
 *  - coluna alvo no grid (staffId no DayView, dayIndex no WeekView)
 */
export interface PositionedAppointment {
  appointment: AdminAppointmentItem;

  /**
   * Indice do slot inicial (0-based).
   * Pode ser NEGATIVO se o appointment comeca antes de 08:00 (clipped no topo).
   */
  slotStart: number;

  /**
   * Indice do slot final EXCLUSIVO.
   * Pode ser > CALENDAR_SLOTS_PER_DAY se termina depois das 20:00 (clipped no fim).
   */
  slotEnd: number;

  /**
   * Indices "seguros" (clamped na janela visivel).
   * Sao esses que vao no gridRowStart/gridRowEnd do CSS Grid.
   */
  visibleSlotStart: number;
  visibleSlotEnd: number;

  /**
   * True se parte do appointment foi cortada pra caber na janela visivel.
   */
  isClippedStart: boolean;
  isClippedEnd: boolean;
}

/**
 * Coluna do DayView: um staff + seus appointments naquele dia.
 */
export interface DayViewColumn {
  staffId: string;
  staffName: string;
  appointments: PositionedAppointment[];
}

/**
 * Estrutura completa do DayView pronta pra renderizar.
 */
export interface DayViewData {
  /** Data alvo (00:00:00 local). */
  date: Date;
  /** Uma coluna por staff. Ordem alfabetica por nome. */
  columns: DayViewColumn[];
  /** Total de appointments do dia (independente de clipping). */
  totalAppointments: number;
}

/**
 * Coluna do WeekView: um dia da semana + seus appointments.
 */
export interface WeekViewColumn {
  /** Data do dia (00:00:00 local). */
  date: Date;
  /** Indice da semana (0 = segunda, 6 = domingo). */
  dayIndex: number;
  /** Appointments do dia, posicionados. NAO agrupados por staff (cor distingue). */
  appointments: PositionedAppointment[];
}

/**
 * Estrutura completa do WeekView pronta pra renderizar.
 */
export interface WeekViewData {
  /** Segunda-feira da semana (00:00:00 local). */
  weekStart: Date;
  /** 7 colunas, segunda a domingo. */
  columns: WeekViewColumn[];
  /** Total de appointments da semana. */
  totalAppointments: number;
}
