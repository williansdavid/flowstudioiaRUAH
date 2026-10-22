// src/features/appointments/utils/todayLocalDate.ts

/** Data 'YYYY-MM-DD' de hoje no fuso do studio (America/Sao_Paulo, UTC-3 fixo). */
export function todayLocalDate(): string {
  const now = new Date();
  // Desloca pra UTC-3 e lê os componentes em UTC.
  const local = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const year = local.getUTCFullYear();
  const month = String(local.getUTCMonth() + 1).padStart(2, '0');
  const day = String(local.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
