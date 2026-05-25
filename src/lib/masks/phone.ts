/**
 * Máscara de telefone brasileiro.
 *
 * Aplica formato em tempo real conforme o usuário digita:
 *  - 10 dígitos: (14) 9999-9999  (fixo)
 *  - 11 dígitos: (14) 99999-9999 (celular)
 *
 * Aceita entrada com qualquer caractere (filtra não-dígitos).
 * Truncamento em 11 dígitos.
 */
export function maskPhoneBR(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/**
 * Remove máscara — retorna só dígitos.
 * Útil pra salvar no banco em formato normalizado.
 */
export function unmaskPhone(value: string): string {
  return value.replace(/\D/g, '');
}
