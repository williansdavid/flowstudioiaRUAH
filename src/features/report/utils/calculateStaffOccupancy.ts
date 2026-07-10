// src/features/report/utils/calculateStaffOccupancy.ts

export interface WorkingHoursDay {
  start: string | null;
  end: string | null;
  breaks?: { start: string; end: string }[];
}

export interface WorkingHours {
  [day: string]: WorkingHoursDay | null;
}

/**
 * Calcula a taxa de ocupação de um staff no período.
 * Retorna null quando não há working_hours definido.
 *
 * working_hours formato real (já confirmado no banco):
 * {
 *   "0": null,                          // domingo
 *   "1": { "start": "09:00", "end": "18:00", "breaks": [{ "start": "12:00", "end": "13:00" }] },
 *   "2": { "start": "09:00", "end": "19:00", "breaks": [{ "start": "12:00", "end": "13:00" }] },
 *   ...
 *   "6": { "start": "09:00", "end": "14:00", "breaks": [] }
 * }
 */
export function calculateStaffOccupancy(params: {
  totalBookedMinutes: number;
  workingHours: Record<string, unknown> | null;
  startDate: string;
  endDate: string;
}): number | null {
  const { totalBookedMinutes, workingHours, startDate, endDate } = params;

  if (!workingHours || typeof workingHours !== 'object') return null;

  const wh = workingHours as unknown as WorkingHours;
  let totalAvailableMinutes = 0;

  const start = new Date(startDate + 'T12:00:00');
  const end = new Date(endDate + 'T12:00:00');

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayKey = String(d.getDay()); // '0'..'6'
    const dayHours = wh[dayKey];
    if (!dayHours) continue;

    const opensAt = dayHours.start;
    const closesAt = dayHours.end;
    if (!opensAt || !closesAt) continue;

    const [openH, openM] = opensAt.split(':');
    const [closeH, closeM] = closesAt.split(':');
    if (!openH || !openM || !closeH || !closeM) continue;

    let dayMinutes =
      Number(closeH) * 60 + Number(closeM) -
      (Number(openH) * 60 + Number(openM));

    // Subtrai os breaks
    if (dayHours.breaks && Array.isArray(dayHours.breaks)) {
      for (const bp of dayHours.breaks) {
        const [bH, bM] = (bp.start ?? '').split(':');
        const [eH, eM] = (bp.end ?? '').split(':');
        if (bH && bM && eH && eM) {
          dayMinutes -=
            Number(eH) * 60 + Number(eM) -
            (Number(bH) * 60 + Number(bM));
        }
      }
    }

    totalAvailableMinutes += Math.max(dayMinutes, 0);
  }

  if (totalAvailableMinutes <= 0) return 0;

  return Math.round((totalBookedMinutes / totalAvailableMinutes) * 100);
}