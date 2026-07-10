// src/features/report/utils/calculateOccupancyRate.ts
import { businessHours } from '@/config/active-studio';
import type { OccupancyRateRow } from '../types';

const SLOT_DURATION_MINUTES = 30;
const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

function getSlotsPerDay(dateStr: string): number {
  const date = new Date(dateStr + 'T12:00:00');
  const dayName = DAY_NAMES[date.getDay()];
  if (!dayName) return 0;

  const dayHours = businessHours[dayName];
  if (!dayHours?.open) return 0;

  const opensAt = dayHours.opensAt;
  const closesAt = dayHours.closesAt;
  if (!opensAt || !closesAt) return 0;

  const [openH, openM] = opensAt.split(':');
  const [closeH, closeM] = closesAt.split(':');
  if (!openH || !openM || !closeH || !closeM) return 0;

  const openMinutes = Number(openH) * 60 + Number(openM);
  const closeMinutes = Number(closeH) * 60 + Number(closeM);

  return Math.floor((closeMinutes - openMinutes) / SLOT_DURATION_MINUTES);
}

interface RawOccupancyInput {
  date: string;
  filledSlots: number;
  cancellations: number;
  noShows: number;
  staffWorking: number;
}

export function calculateOccupancyRate(rows: RawOccupancyInput[]): OccupancyRateRow[] {
  return rows.map((row) => {
    const slotsPerStaff = getSlotsPerDay(row.date);
    const totalSlots = slotsPerStaff * row.staffWorking;
    const occupancyRate = totalSlots > 0
      ? Math.round((row.filledSlots / totalSlots) * 100)
      : 0;

    return {
      date: row.date,
      totalSlots,
      filledSlots: row.filledSlots,
      occupancyRate,
      cancellations: row.cancellations,
      noShows: row.noShows,
    };
  });
}