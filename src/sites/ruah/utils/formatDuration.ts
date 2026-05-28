/**
 * formatDuration — Ruah Barber Lounge
 * ----------------------------------------------------------------
 * Converte duração em minutos em string humana curta.
 *
 *   30  → "30min"
 *   45  → "45min"
 *   60  → "1h"
 *   75  → "1h15"
 *   90  → "1h30"
 *   120 → "2h"
 *
 * Decisão UX: nada de "1 hora e 15 minutos" — cards precisam ser concisos.
 * ----------------------------------------------------------------
 */
export function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return '—'

  if (minutes < 60) return `${minutes}min`

  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60

  if (rest === 0) return `${hours}h`
  return `${hours}h${String(rest).padStart(2, '0')}`
}
