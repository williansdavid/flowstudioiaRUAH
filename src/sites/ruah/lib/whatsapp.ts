/**
 * WhatsApp URL Builder — Ruah
 * ----------------------------------------------------------------
 * Centraliza a construção de links wa.me usando o número oficial
 * do studio (identity.contact.whatsapp).
 *
 * Uso:
 *   import { buildWhatsAppUrl } from '@/sites/ruah/lib'
 *
 *   buildWhatsAppUrl()                      // sem mensagem
 *   buildWhatsAppUrl('Olá, quero agendar')  // com mensagem
 * ----------------------------------------------------------------
 */

import { identity } from '../config/identity'

/**
 * Gera URL wa.me com mensagem opcional pré-preenchida.
 * Sanitiza o número (remove tudo que não for dígito) por segurança.
 */
export function buildWhatsAppUrl(message?: string): string {
  const phone = identity.contact.whatsapp.replace(/\D/g, '')
  const base = `https://wa.me/${phone}`

  if (!message) return base

  return `${base}?text=${encodeURIComponent(message)}`
}
