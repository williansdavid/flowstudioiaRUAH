/**
 * Converte erros PostgreSQL em mensagens amigáveis para o operador.
 * Suporta erro direto, aninhado (React Query → Supabase) e texto puro.
 */
export function parsePostgresError(error: unknown): string {
  let message: string | undefined;
  let code: string | undefined;

  // Extrai de qualquer profundidade
  if (error && typeof error === 'object') {
    const obj = error as Record<string, unknown>;

    if (typeof obj.message === 'string') {
      message = obj.message;
    } else if (obj.error && typeof obj.error === 'object') {
      const e1 = obj.error as Record<string, unknown>;
      if (typeof e1.message === 'string') message = e1.message;
    }

    if (typeof obj.code === 'string') {
      code = obj.code;
    } else if (obj.error && typeof obj.error === 'object') {
      const e1 = obj.error as Record<string, unknown>;
      if (typeof e1.code === 'string') {
        code = e1.code;
      } else if (e1.error && typeof e1.error === 'object') {
        const e2 = e1.error as Record<string, unknown>;
        if (typeof e2.code === 'string') code = e2.code;
      }
    }
  }

  // É violação de unique?
  const isDuplicate =
    code === '23505' ||
    (typeof message === 'string' &&
      message.includes('duplicate key value violates unique constraint'));

  if (isDuplicate && typeof message === 'string') {
    // Tenta identificar por nome da constraint
    const constraintMatch = message.match(/constraint "([^"]+)"/);
    if (constraintMatch?.[1]) {
      const constraint = constraintMatch[1].toLowerCase();
      if (constraint.includes('email')) return 'Já existe um cliente com este e-mail.';
      if (constraint.includes('phone')) return 'Já existe um cliente com este telefone.';
    }
    // Tenta identificar por Key (campo)
    if (/Key\s*\(email\)/i.test(message)) return 'Já existe um cliente com este e-mail.';
    if (/Key\s*\(phone\)/i.test(message)) return 'Já existe um cliente com este telefone.';
    return 'Já existe um cliente com esses dados.';
  }

  // Se for outro erro do PostgreSQL, mostra a mensagem original
  if (typeof message === 'string' && message.includes('violates')) {
    return message;
  }

  return typeof message === 'string' ? message : 'Erro inesperado. Tente novamente.';
}