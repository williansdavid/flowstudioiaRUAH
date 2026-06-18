// src/features/appointments/utils/calendarUtils.ts

export const CALENDAR_CONFIG = {
  START_HOUR: 6, // 06:00
  END_HOUR: 22,  // 22:00
  PIXELS_PER_MINUTE: 1.5, // 1 hora = 90px
};

export function getMinutesFromMidnight(dateString: string): number {
  const date = new Date(dateString);
  return date.getHours() * 60 + date.getMinutes();
}

export function calculateTop(dateString: string): number {
  const minutes = getMinutesFromMidnight(dateString);
  const offsetMinutes = minutes - (CALENDAR_CONFIG.START_HOUR * 60);
  return Math.max(0, offsetMinutes * CALENDAR_CONFIG.PIXELS_PER_MINUTE);
}

export function calculateHeight(startsAt: string, endsAt: string): number {
  const start = getMinutesFromMidnight(startsAt);
  const end = getMinutesFromMidnight(endsAt);
  const duration = end - start;
  return Math.max(duration * CALENDAR_CONFIG.PIXELS_PER_MINUTE, 24); // Altura mínima de 24px
}