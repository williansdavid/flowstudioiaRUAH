/**
 * Helpers de formatação para pt-BR.
 * Centralizados aqui para garantir consistência em toda a aplicação.
 */

/**
 * Formata número como moeda brasileira (R$).
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata duração em minutos para texto legível.
 * 30 -> "30 min" | 60 -> "1h" | 90 -> "1h 30min"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

/**
 * Formata data ISO em formato pt-BR curto (dd/mm/aaaa).
 */
export function formatDate(iso: string | Date): string {
  const date = typeof iso === 'string' ? new Date(iso) : iso;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Formata data + hora ISO em formato pt-BR.
 */
export function formatDateTime(iso: string | Date): string {
  const date = typeof iso === 'string' ? new Date(iso) : iso;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Converte string monetária pt-BR em número.
 * "R$ 1.500,50" -> 1500.5
 */
export function parseCurrency(input: string): number {
  const cleaned = input
    .replace(/[^\d,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Trunca texto adicionando reticências.
 */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + '…';
}
