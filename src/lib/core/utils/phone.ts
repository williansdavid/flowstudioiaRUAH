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
