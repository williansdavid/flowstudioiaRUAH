/**
 * formatPrice — Ruah Barber Lounge
 * ----------------------------------------------------------------
 * Formata número em moeda brasileira (pt-BR / BRL).
 *
 * Entrada: number já em reais (ex.: 65 → "R$ 65,00").
 * NÃO em centavos — o shape PublicServiceItem.price já vem em reais
 * do Supabase via fetchPublicServices.
 *
 * SSR-safe: Intl.NumberFormat existe no Node desde anos.
 * ----------------------------------------------------------------
 */
const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatPrice(value: number): string {
  if (!Number.isFinite(value)) return 'R$ 0,00'
  return BRL.format(value)
}
