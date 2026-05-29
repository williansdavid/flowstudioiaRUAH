/**
 * Lib Barrel — Ruah
 * ----------------------------------------------------------------
 * Ponto único de exportação de utilitários do studio Ruah.
 * Sempre importar via: `@/sites/ruah/lib`
 * ----------------------------------------------------------------
 */

export { buildWhatsAppUrl } from './whatsapp'

export {
  getCurrentStatus,
  getWeekDay,
  formatDayHours,
  DAY_LABELS_LONG,
  DAY_LABELS_SHORT,
  WEEK_ORDER_PTBR,
} from './hours'

export type { HoursStatus } from './hours'
