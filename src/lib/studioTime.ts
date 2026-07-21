// src/lib/studioTime.ts
import { parseISO } from 'date-fns'

const TZ = 'America/Sao_Paulo';
const TZ_OFFSET = '-03:00';

/** ISO → { date:'YYYY-MM-DD', time:'HH:mm' } no fuso do studio. */
export function splitISO(iso: string): { date: string; time: string } {
  try {
    const d = parseISO(iso)
    if (isNaN(d.getTime())) return { date: '', time: '' }
    const fmt = new Intl.DateTimeFormat('sv-SE', {
      timeZone: TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    const [date, time] = fmt.format(d).split(' ')
    return { date: date!, time: time! }
  } catch {
    return { date: '', time: '' }
  }
}

/** { date, time } no fuso do studio → ISO UTC (offset -03:00). */
export function joinISO(date: string, time: string): string {
  return new Date(`${date}T${time}:00${TZ_OFFSET}`).toISOString()
}

/** Próxima hora cheia (fuso studio). */
export function nextRoundHour(): { date: string; time: string } {
  const now = new Date()
  const { date } = splitISO(now.toISOString())
  const hh = Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: TZ,
      hour: '2-digit',
      hour12: false,
    }).format(now),
  )
  const next = Math.min(hh + 1, 23)
  return { date, time: `${String(next).padStart(2, '0')}:00` }
}

/** 'YYYY-MM-DD' + 'HH:mm' → label legível pt-BR. */
export function formatRange(startsAt: string, endsAt: string): string {
  const s = splitISO(startsAt)
  const e = splitISO(endsAt)
  if (!s.date || !e.date) return '—'
  const [y, m, d] = s.date.split('-')
  const dateLabel = `${d}/${m}/${y}`
  return s.date === e.date
    ? `${dateLabel} · ${s.time}–${e.time}`
    : `${dateLabel} ${s.time} → ${e.date.split('-').reverse().join('/')} ${e.time}`
}