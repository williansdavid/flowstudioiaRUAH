// src/lib/errors/parseBusinessError.ts

const BUSINESS_ERROR_PREFIX = '[business] ';

/**
 * Extrai a mensagem de erro de negócio levantada pelos triggers do Postgres.
 *
 * Convenção do banco:
 *   raise exception '[business] <mensagem amigável>' using errcode = 'P0001';
 *
 * O parser remove o prefixo e devolve a mensagem pronta pro usuário.
 * Qualquer erro fora dessa convenção (rede, RLS, bug) cai no fallback genérico,
 * sem vazar detalhes técnicos pro front.
 *
 * @param error    Erro capturado (geralmente PostgrestError ou Error).
 * @param fallback Mensagem exibida quando não for um erro de negócio conhecido.
 * @returns Mensagem amigável pronta pra exibir (ex: via toast.error).
 */
export function parseBusinessError(
  error: unknown,
  fallback = 'Não foi possível concluir a operação. Tente novamente.',
): string {
  if (!error || typeof error !== 'object' || !('message' in error)) {
    return fallback;
  }

  const message = String((error as { message: unknown }).message);

  if (message.startsWith(BUSINESS_ERROR_PREFIX)) {
    return message.slice(BUSINESS_ERROR_PREFIX.length);
  }

  return fallback;
}
