/**
 * Hours Helpers — Ruah Barber Lounge
 * ----------------------------------------------------------------
 * Helpers puros e testáveis para cálculo de status de funcionamento.
 *
 * Princípios:
 *   - Funções PURAS: recebem `now: Date` como parâmetro.
 *   - Nunca chamam `new Date()` internamente (SSR-safe).
 *   - Quem invoca (componente client) é quem injeta o tempo atual.
 *   - Compatível com `noUncheckedIndexedAccess: true`.
 *
 * Limitações conhecidas:
 *   - Não suporta intervalo de almoço (1 abertura por dia).
 *   - Não suporta feriados (futuro: criar `holidays.ts`).
 * ----------------------------------------------------------------
 */

import type { BusinessHours, DayHours, WeekDay } from '../types'

// ────────────────────────────────────────────────────────────────
// ORDEM DOS DIAS — Date.getDay() retorna 0 (dom) ... 6 (sáb)
// Tipado como tupla literal para preservar índices estáticos.
// ────────────────────────────────────────────────────────────────
const WEEK_ORDER = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const satisfies ReadonlyArray<WeekDay>

type WeekOrderTuple = typeof WEEK_ORDER

// ────────────────────────────────────────────────────────────────
// LABELS pt-BR (curto e longo)
// ────────────────────────────────────────────────────────────────
export const DAY_LABELS_LONG: Record<WeekDay, string> = {
  sunday: 'Domingo',
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
}

export const DAY_LABELS_SHORT: Record<WeekDay, string> = {
  sunday: 'Dom',
  monday: 'Seg',
  tuesday: 'Ter',
  wednesday: 'Qua',
  thursday: 'Qui',
  friday: 'Sex',
  saturday: 'Sáb',
}

// ────────────────────────────────────────────────────────────────
// TIPOS
// ────────────────────────────────────────────────────────────────
export type HoursStatus =
  | {
      isOpen: true
      today: WeekDay
      closesAt: string
      label: string
    }
  | {
      isOpen: false
      today: WeekDay
      nextOpenDay: WeekDay | null
      nextOpenAt: string | null
      label: string
    }

// ────────────────────────────────────────────────────────────────
// UTILS internos
// ────────────────────────────────────────────────────────────────

/** Acesso seguro ao WEEK_ORDER por índice numérico (0..6). */
function weekDayAt(index: number): WeekDay {
  // Normaliza para 0..6 e usa cast seguro (tupla fixa de 7 elementos).
  const safeIndex = ((index % 7) + 7) % 7
  return WEEK_ORDER[safeIndex as 0 | 1 | 2 | 3 | 4 | 5 | 6]
}

/** Converte "HH:mm" em minutos absolutos do dia (0–1439). */
function toMinutes(time: string): number {
  const parts = time.split(':')
  const h = Number(parts[0] ?? 0)
  const m = Number(parts[1] ?? 0)
  return h * 60 + m
}

/** Retorna a WeekDay correspondente ao Date informado. */
export function getWeekDay(now: Date): WeekDay {
  return weekDayAt(now.getDay())
}

/** Procura o próximo dia aberto a partir de `fromIndex`. */
function findNextOpenDay(
  hours: BusinessHours,
  fromIndex: number,
  inclusive: boolean,
): { day: WeekDay; schedule: DayHours } | null {
  const start = inclusive ? 0 : 1
  for (let i = start; i <= 7; i++) {
    const day = weekDayAt(fromIndex + i)
    const schedule = hours[day]
    if (schedule.open && schedule.opensAt && schedule.closesAt) {
      return { day, schedule }
    }
  }
  return null
}

// ────────────────────────────────────────────────────────────────
// API PÚBLICA
// ────────────────────────────────────────────────────────────────

/**
 * Calcula o status atual do studio.
 *
 * @param hours Configuração de horários (config/businessHours.ts)
 * @param now   Data/hora atual — DEVE vir do client (`new Date()` no useEffect)
 */
export function getCurrentStatus(
  hours: BusinessHours,
  now: Date,
): HoursStatus {
  const today = getWeekDay(now)
  const todayIndex = now.getDay()
  const todaySchedule = hours[today]
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  // ─── Caminho 1: hoje está aberto e dentro do horário ───
  if (
    todaySchedule.open &&
    todaySchedule.opensAt &&
    todaySchedule.closesAt
  ) {
    const opens = toMinutes(todaySchedule.opensAt)
    const closes = toMinutes(todaySchedule.closesAt)

    if (nowMinutes >= opens && nowMinutes < closes) {
      return {
        isOpen: true,
        today,
        closesAt: todaySchedule.closesAt,
        label: `Aberto agora · Fecha às ${todaySchedule.closesAt}`,
      }
    }

    // Ainda vai abrir hoje
    if (nowMinutes < opens) {
      return {
        isOpen: false,
        today,
        nextOpenDay: today,
        nextOpenAt: todaySchedule.opensAt,
        label: `Fechado · Abre hoje às ${todaySchedule.opensAt}`,
      }
    }
  }

  // ─── Caminho 2: fechado — procurar próximo dia aberto ───
  const next = findNextOpenDay(hours, todayIndex, false)

  if (!next || !next.schedule.opensAt) {
    return {
      isOpen: false,
      today,
      nextOpenDay: null,
      nextOpenAt: null,
      label: 'Fechado',
    }
  }

  // Próximo dia é amanhã?
  const tomorrow = weekDayAt(todayIndex + 1)
  const isTomorrow = tomorrow === next.day

  const dayLabel = isTomorrow
    ? 'amanhã'
    : DAY_LABELS_LONG[next.day].toLowerCase()

  return {
    isOpen: false,
    today,
    nextOpenDay: next.day,
    nextOpenAt: next.schedule.opensAt,
    label: `Fechado · Abre ${dayLabel} às ${next.schedule.opensAt}`,
  }
}

/**
 * Formata horário do dia para exibição.
 * Ex: { open: true, opensAt: '09:00', closesAt: '19:00' } → "09:00 – 19:00"
 *     { open: false } → "Fechado"
 */
export function formatDayHours(schedule: DayHours): string {
  if (!schedule.open || !schedule.opensAt || !schedule.closesAt) {
    return 'Fechado'
  }
  return `${schedule.opensAt} – ${schedule.closesAt}`
}

/** Lista os dias em ordem semanal (Seg → Dom, padrão pt-BR). */
export const WEEK_ORDER_PTBR: ReadonlyArray<WeekDay> = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

// Mantém a tupla exportada caso outros módulos precisem (não obrigatório)
export type { WeekOrderTuple }
