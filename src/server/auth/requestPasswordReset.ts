import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import { env } from '@/lib/env';

const requestResetSchema = z.object({
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
});

export type RequestPasswordResetInput = z.infer<typeof requestResetSchema>;

/**
 * Dispara o e-mail de redefinição de senha.
 *
 * Por segurança, NUNCA revela se o e-mail existe ou não:
 * retorna { ok: true } independentemente do resultado.
 * O redirectTo aponta para /reset-password (precisa estar nas
 * Redirect URLs do Supabase Dashboard).
 */
export const requestPasswordReset = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => requestResetSchema.parse(data))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const supabase = createSupabaseServer();

    await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${env.VITE_APP_URL}/reset-password`,
    });

    // Resposta uniforme — não vaza existência de conta.
    return { ok: true };
  });
