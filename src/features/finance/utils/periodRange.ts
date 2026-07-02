import { todayLocalDate } from '@/features/appointments';
import type { FinancePeriod, PeriodRange } from '../types';

/**
 * NOTA: reaproveita `todayLocalDate` já exportado pela feature de appointments
 * para manter a mesma noção de "hoje" (fuso America/Sao_Paulo) usada no resto do app.
 * Se o export não existir nesse caminho no seu projeto, ajuste o import.
 */

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = domingo
  d.setDate(d.getDate() - day);
  return d;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getPeriodRange(period: FinancePeriod, customRange?: PeriodRange): PeriodRange {
  const todayStr = todayLocalDate();
  const today = new Date(`${todayStr}T00:00:00`);

  switch (period) {
    case 'today':
      return { start: todayStr, end: todayStr };
    case 'week':
      return { start: toISODate(startOfWeek(today)), end: todayStr };
    case 'month':
      return { start: toISODate(startOfMonth(today)), end: todayStr };
    case 'custom':
      if (!customRange) {
        throw new Error('customRange é obrigatório quando period === "custom"');
      }
      return customRange;
    default:
      return { start: todayStr, end: todayStr };
  }
}

/** Calcula o período imediatamente anterior, com a mesma duração, para cálculo de delta. */
export function getPreviousPeriodRange(range: PeriodRange): PeriodRange {
  const start = new Date(`${range.start}T00:00:00`);
  const end = new Date(`${range.end}T00:00:00`);
  const spanMs = end.getTime() - start.getTime();

  const prevEnd = new Date(start.getTime() - 24 * 60 * 60 * 1000);
  const prevStart = new Date(prevEnd.getTime() - spanMs);

  return {
    start: toISODate(prevStart),
    end: toISODate(prevEnd),
  };
}
