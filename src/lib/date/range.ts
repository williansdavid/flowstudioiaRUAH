/**
 * ============================================
 * Date Range Helpers
 * ============================================
 *
 * Helpers puros para calcular ranges de data (dia/semana/mes).
 * Sem dependencias externas — usa apenas Date nativo.
 *
 * Convencao:
 *  - "from" inclusivo (00:00:00.000 local)
 *  - "to" exclusivo (00:00:00.000 do dia seguinte ao ultimo dia desejado)
 *  - Retornos em ISO 8601 (toISOString) — compativel com Postgres timestamptz
 *
 * Semana = segunda a domingo (padrao BR).
 */

export interface DateRange {
  from: string; // ISO 8601 UTC
  to: string;   // ISO 8601 UTC (exclusivo)
}

/**
 * Retorna range que cobre todo o dia da data fornecida (timezone local).
 */
export function getDayRange(date: Date): DateRange {
  const from = new Date(date);
  from.setHours(0, 0, 0, 0);

  const to = new Date(from);
  to.setDate(to.getDate() + 1);

  return { from: from.toISOString(), to: to.toISOString() };
}

/**
 * Retorna range da semana (segunda 00:00 -> proxima segunda 00:00).
 */
export function getWeekRange(date: Date): DateRange {
  const from = new Date(date);
  from.setHours(0, 0, 0, 0);
  // getDay(): 0 = domingo, 1 = segunda, ..., 6 = sabado
  const day = from.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  from.setDate(from.getDate() + diffToMonday);

  const to = new Date(from);
  to.setDate(to.getDate() + 7);

  return { from: from.toISOString(), to: to.toISOString() };
}

/**
 * Retorna range do mes (dia 1 00:00 -> dia 1 do mes seguinte 00:00).
 */
export function getMonthRange(date: Date): DateRange {
  const from = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  const to = new Date(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0, 0);
  return { from: from.toISOString(), to: to.toISOString() };
}

/**
 * Range default usado quando ninguem especifica:
 *  - de hoje 00:00
 *  - ate hoje + 30 dias 00:00
 *
 * Evita carregar historico inteiro acidentalmente.
 */
export function getDefaultListRange(now: Date = new Date()): DateRange {
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);

  const to = new Date(from);
  to.setDate(to.getDate() + 30);

  return { from: from.toISOString(), to: to.toISOString() };
}

/**
 * Soma dias a uma data (nao mutavel).
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
/**
 * Converte string ISO "YYYY-MM-DD" em Date no fuso LOCAL (00:00).
 *
 * Importante: usa parsing manual para evitar o bug do `new Date("2026-05-26")`
 * que interpreta como UTC (e pode "voltar 1 dia" em fusos negativos como BRT).
 *
 * Se receber string invalida, retorna a data de hoje (00:00 local) como fallback seguro.
 */
export function parseISODate(iso: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) {
    const fallback = new Date();
    fallback.setHours(0, 0, 0, 0);
    return fallback;
  }
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d), 0, 0, 0, 0);
}

/**
 * Converte Date em string ISO "YYYY-MM-DD" no fuso LOCAL.
 *
 * NAO usa `date.toISOString().slice(0,10)` porque toISOString converte pra UTC
 * (pode mudar o dia em fusos negativos).
 */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
