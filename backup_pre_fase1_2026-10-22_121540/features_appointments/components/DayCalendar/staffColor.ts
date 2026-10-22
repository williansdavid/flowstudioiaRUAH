// src/features/appointments/components/DayCalendar/staffColor.ts

/**
 * Paleta fixa de cores distintas para diferenciar profissionais.
 * Mesma paleta usada em AppointmentsList — fonte única.
 */
export const STAFF_PALETTE = [
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#ef4444', // red
  '#84cc16', // lime
  '#ec4899', // pink
] as const;

/** Hash estável (djb2) do staffId → índice na paleta. Mesmo staff = mesma cor sempre. */
export function staffColor(staffId: string): string {
  let hash = 5381;
  for (let i = 0; i < staffId.length; i++) {
    hash = (hash * 33) ^ staffId.charCodeAt(i);
  }
  const index = Math.abs(hash) % STAFF_PALETTE.length;
  return STAFF_PALETTE[index]!;
}
