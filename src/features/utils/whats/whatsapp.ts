// src/lib/utils/whatsapp.ts
/**
 * Helper genérico de WhatsApp (Módulo Sistema).
 * Recebe o telefone de um CLIENTE/LEAD e gera um link wa.me.
 *
 * Difere de src/sites/<studio>/lib/whatsapp.ts, que monta o link
 * para o número do STUDIO (identity) — uso na landing.
 *
 * Regras de normalização (Brasil):
 *   - Remove tudo que não for dígito.
 *   - Se vier sem DDI (10 ou 11 dígitos), prefixa 55.
 *   - Valida tamanho final (12 ou 13 dígitos com DDI 55).
 *   - Retorna null se inválido → caller esconde o botão.
 */
export function toWhatsAppHref(
  phone: string | null | undefined,
  message?: string,
): string | null {
  if (!phone) return null;

  let digits = phone.replace(/\D/g, '');
  if (digits.length === 0) return null;

  // Sem DDI: número nacional (10 fixo / 11 celular) → prefixa 55.
  if (digits.length === 10 || digits.length === 11) {
    digits = `55${digits}`;
  }

  // Esperado com DDI 55: 12 (fixo) ou 13 (celular) dígitos.
  if (digits.length < 12 || digits.length > 13) return null;
  if (!digits.startsWith('55')) return null;

  const base = `https://api.whatsapp.com/send?phone=${digits}`;
  return message ? `${base}&text=${encodeURIComponent(message)}` : base;
}
