/**
 * Phone Utils (BR)
 * ----------------------------------------------------------------
 * Normalizacao e validacao de telefone brasileiro.
 * Forma canonica (banco): +55DDDNUMERO (sem mascara).
 * Escopo: somente Brasil. DDI internacional fora de escopo.
 * Sempre importar via: `@/lib/core/utils`
 * ----------------------------------------------------------------
 */

import { z } from 'zod'

/** Erro de normalizacao com motivo legivel. */
export class PhoneNormalizeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PhoneNormalizeError'
  }
}

/**
 * Normaliza um telefone BR para a forma canonica +55DDDNUMERO.
 *
 * Aceita entradas mascaradas/sujas, ex:
 *   "(14) 99999-9999" | "14 99999-9999" | "5514999999999" | "+5514999999999"
 *
 * Regras:
 *  - Remove tudo que nao for digito.
 *  - Remove prefixo "55" apenas se o restante tiver tamanho valido (10 ou 11).
 *  - Celular: 11 digitos (DDD + 9 + 8), 3o digito apos DDD = "9".
 *  - Fixo:    10 digitos (DDD + 8).
 *  - DDD valido: 2 digitos, faixa 11-99.
 *
 * @throws {PhoneNormalizeError} quando o numero nao e valido.
 */
export function normalizePhoneBR(input: string): string {
  const digits = (input ?? '').replace(/\D/g, '')

  if (digits.length === 0) {
    throw new PhoneNormalizeError('Telefone vazio.')
  }

  // Remove "55" so se o que sobra for tamanho de numero nacional valido.
  let national = digits
  if (national.startsWith('55') && (national.length === 12 || national.length === 13)) {
    national = national.slice(2)
  }

  if (national.length !== 10 && national.length !== 11) {
    throw new PhoneNormalizeError(
      'Telefone deve ter 10 (fixo) ou 11 (celular) digitos, com DDD.',
    )
  }

  const ddd = national.slice(0, 2)
  const dddNum = Number(ddd)
  if (dddNum < 11 || dddNum > 99) {
    throw new PhoneNormalizeError('DDD invalido (esperado 11 a 99).')
  }

  // Celular: 11 digitos => 3o digito (apos DDD) deve ser 9.
  if (national.length === 11 && national[2] !== '9') {
    throw new PhoneNormalizeError('Celular deve ter "9" apos o DDD.')
  }

  return `+55${national}`
}

/**
 * Schema Zod que valida E normaliza em um passo.
 * Saida: string canonica +55DDDNUMERO.
 * Uso: forms (portal/admin) e validacao server-side.
 */
export const phoneBRSchema = z
  .string({ required_error: 'Telefone obrigatorio.' })
  .trim()
  .transform((value, ctx) => {
    try {
      return normalizePhoneBR(value)
    } catch (err) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          err instanceof PhoneNormalizeError ? err.message : 'Telefone invalido.',
      })
      return z.NEVER
    }
  })

/** Schema opcional: aceita "" / undefined => undefined; senao normaliza. */
export const phoneBROptionalSchema = z
  .string()
  .trim()
  .optional()
  .transform((value, ctx) => {
    if (!value) return undefined
    try {
      return normalizePhoneBR(value)
    } catch (err) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          err instanceof PhoneNormalizeError ? err.message : 'Telefone invalido.',
      })
      return z.NEVER
    }
  })

// ================================================================
// EXIBICAO / MASCARA (UI) — adicionado para o PhoneInput
// ================================================================

/**
 * Extrai ate 11 digitos nacionais de qualquer entrada (mascarada,
 * com +55, com 55 colado). Nao valida — so limpa pra mascarar.
 * Usado pelo input controlado enquanto o usuario digita.
 */
function toNationalDigits(input: string): string {
  let digits = (input ?? '').replace(/\D/g, '')
  // Descola um 55 inicial so quando sobra tamanho de numero nacional.
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    digits = digits.slice(2)
  }
  return digits.slice(0, 11)
}

/**
 * Mascara progressiva para input enquanto digita.
 *   ""            -> ""
 *   "14"          -> "(14"
 *   "1499"        -> "(14) 99"
 *   "14999998888" -> "(14) 99999-8888"   (celular, 11 dig)
 *   "1433334444"  -> "(14) 3333-4444"     (fixo, 10 dig)
 *
 * Nao lanca erro: serve so pra UX. A validacao real e o phoneBRSchema.
 */
export function maskPhoneBRInput(input: string): string {
  const d = toNationalDigits(input)
  if (d.length === 0) return ''

  const ddd = d.slice(0, 2)
  if (d.length <= 2) return `(${ddd}`

  const rest = d.slice(2)
  // Celular (>= 11 dig totais): split 5-4. Fixo: split 4-4.
  const isMobile = d.length > 10
  const splitAt = isMobile ? 5 : 4

  if (rest.length <= splitAt) return `(${ddd}) ${rest}`
  return `(${ddd}) ${rest.slice(0, splitAt)}-${rest.slice(splitAt)}`
}

/**
 * Formata para EXIBICAO um telefone ja canonico (+55DDDNUMERO) ou
 * uma entrada qualquer. Retorna mascarado, ou a entrada crua se nao
 * der pra mascarar (ex: numero incompleto vindo de dado legado).
 *   "+5514999998888" -> "(14) 99999-8888"
 *   "+551433334444"  -> "(14) 3333-4444"
 */
export function formatPhoneBR(input: string | null | undefined): string {
  if (!input) return ''
  return maskPhoneBRInput(input) || input
}
