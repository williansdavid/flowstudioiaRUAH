// src/features/staff/utils/defaultWorkingHours.ts
import type { WorkingHours } from '@/lib/scheduling/workingHours.schema';

/**
 * Grade default editável para staff sem working_hours válido.
 * Não grava no banco até o usuário salvar.
 * Seg–Sex 09–19 c/ almoço 12–13, Sáb 09–14, Dom folga.
 */
export function buildDefaultWorkingHours(): WorkingHours {
  const weekday = {
    start: '09:00',
    end: '19:00',
    breaks: [{ start: '12:00', end: '13:00' }],
  };
  return {
    '0': null,
    '1': { ...weekday, breaks: [...weekday.breaks] },
    '2': { ...weekday, breaks: [...weekday.breaks] },
    '3': { ...weekday, breaks: [...weekday.breaks] },
    '4': { ...weekday, breaks: [...weekday.breaks] },
    '5': { ...weekday, breaks: [...weekday.breaks] },
    '6': { start: '09:00', end: '14:00', breaks: [] },
  };
}
