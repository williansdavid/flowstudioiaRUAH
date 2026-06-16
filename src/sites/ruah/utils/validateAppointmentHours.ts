// src/sites/ruah/utils/validateAppointmentHours.ts
import type { BusinessHours } from '../types'
import { getWeekDay, DAY_LABELS_LONG } from '../lib/hours'

interface ValidateInput {
  /** 'YYYY-MM-DD' (fuso do studio) */
  date: string
  /** 'HH:mm' */
  startTime: string
  /** 'HH:mm' */
  endTime: string
  hours: BusinessHours
}

/** 'HH:mm' → minutos do dia (0–1439). */
function toMinutes(time: string): number {
  const [h, m] = time.split(':')
  return Number(h ?? 0) * 60 + Number(m ?? 0)
}

/**
 * Valida se o intervalo cabe no horário de funcionamento do dia.
 * Retorna mensagem de erro (pt-BR) ou `null` se válido.
 *
 * Puro / SSR-safe. Deriva o weekday via meio-dia local (T12:00:00)
 * para não cair no parse UTC de 'YYYY-MM-DD'.
 */
export function validateAppointmentHours({
  date,
  startTime,
  endTime,
  hours,
}: ValidateInput): string | null {
  if (!date || !startTime || !endTime) return null

  const day = getWeekDay(new Date(`${date}T12:00:00`))
  const schedule = hours[day]

  if (!schedule.open || !schedule.opensAt || !schedule.closesAt) {
    return `O studio não abre ${DAY_LABELS_LONG[day].toLowerCase()}.`
  }

  const opens = toMinutes(schedule.opensAt)
  const closes = toMinutes(schedule.closesAt)
  const start = toMinutes(startTime)
  const end = toMinutes(endTime)

  if (start < opens) {
    return `Antes da abertura (${schedule.opensAt}) de ${DAY_LABELS_LONG[day].toLowerCase()}.`
  }
  if (end > closes) {
    return `Após o fechamento (${schedule.closesAt}) de ${DAY_LABELS_LONG[day].toLowerCase()}.`
  }
  return null
}
