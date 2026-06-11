// src/features/appointments/components/DayCalendar/geometry.ts

export const DAY_START_HOUR = 8;
export const DAY_END_HOUR = 20;
export const SLOT_MINUTES = 15;
export const SNAP_MINUTES = 15;
export const PX_PER_MINUTE = 1.4;

/** Offset fixo do studio (America/Sao_Paulo, UTC-3). */
const TZ_OFFSET = '-03:00';

export const DAY_TOTAL_MINUTES = (DAY_END_HOUR - DAY_START_HOUR) * 60;
export const GRID_HEIGHT_PX = DAY_TOTAL_MINUTES * PX_PER_MINUTE;
export const SLOT_HEIGHT_PX = SLOT_MINUTES * PX_PER_MINUTE;

/** Minutos desde meia-noite (UTC-3) de um instante ISO. */
export function minutesFromMidnight(iso: string): number {
  const d = new Date(iso);
  // Converte pro horário local UTC-3 sem depender do fuso da máquina.
  const local = new Date(d.getTime() - 3 * 60 * 60 * 1000);
  return local.getUTCHours() * 60 + local.getUTCMinutes();
}

/** Posição vertical (px) do topo de um bloco a partir do ISO de início. */
export function topPx(startIso: string): number {
  const min = minutesFromMidnight(startIso) - DAY_START_HOUR * 60;
  return min * PX_PER_MINUTE;
}

/** Altura (px) de um bloco a partir do range ISO. Mínimo de 1 slot pra clique. */
export function heightPx(startIso: string, endIso: string): number {
  const start = minutesFromMidnight(startIso);
  const end = minutesFromMidnight(endIso);
  const dur = Math.max(end - start, SLOT_MINUTES);
  return dur * PX_PER_MINUTE;
}

/** Snap de minutos ao grid (15min). */
export function snapMinutes(min: number): number {
  return Math.round(min / SNAP_MINUTES) * SNAP_MINUTES;
}

/** Constrói ISO (UTC-3) a partir de date 'YYYY-MM-DD' + minutos desde meia-noite. */
export function isoFromDateAndMinutes(date: string, minutes: number): string {
  const clamped = Math.max(0, Math.min(minutes, 24 * 60 - 1));
  const h = String(Math.floor(clamped / 60)).padStart(2, '0');
  const m = String(clamped % 60).padStart(2, '0');
  return new Date(`${date}T${h}:${m}:00${TZ_OFFSET}`).toISOString();
}

/** Labels de hora cheia do eixo (08:00 … 20:00). */
export function hourLabels(): { hour: number; label: string }[] {
  const out: { hour: number; label: string }[] = [];
  for (let h = DAY_START_HOUR; h <= DAY_END_HOUR; h++) {
    out.push({ hour: h, label: `${String(h).padStart(2, '0')}:00` });
  }
  return out;
}
