/**
 * ============================================
 * Date Formatters (pt-BR)
 * ============================================
 *
 * Formatters consistentes pra UI em portugues do Brasil.
 * Usa Intl.DateTimeFormat — sem dependencias externas.
 */

const TIME_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const WEEKDAY_SHORT_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
});

const DAY_MONTH_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
});

/** "14:30" */
export function formatTime(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return TIME_FORMATTER.format(d);
}

/** "25/05/2026" */
export function formatDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return DATE_FORMATTER.format(d);
}

/** "25/05/2026 14:30" */
export function formatDateTime(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return DATE_TIME_FORMATTER.format(d);
}

/** "seg.", "ter.", ... */
export function formatWeekdayShort(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return WEEKDAY_SHORT_FORMATTER.format(d);
}

/** "25 mai." */
export function formatDayMonth(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return DAY_MONTH_FORMATTER.format(d);
}
