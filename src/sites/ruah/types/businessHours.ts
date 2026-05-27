/**
 * Business Hours Types
 * ----------------------------------------------------------------
 * Horário de funcionamento do studio. Usado em:
 *   - Footer
 *   - Seção de contato
 *   - Schema.org (LocalBusiness)
 *   - Indicador "Aberto agora"
 * ----------------------------------------------------------------
 */

export type WeekDay =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'

export interface DayHours {
  /** Studio aberto neste dia? */
  open: boolean
  /** Horário de abertura — formato HH:mm (24h) — ex: "09:00" */
  opensAt?: string
  /** Horário de fechamento — formato HH:mm (24h) — ex: "19:00" */
  closesAt?: string
}

export type BusinessHours = Record<WeekDay, DayHours>
