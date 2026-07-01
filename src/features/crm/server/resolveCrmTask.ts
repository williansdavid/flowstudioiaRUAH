import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';

const resolveCrmTaskSchema = z.object({
  clientId: z.string().uuid(),
  taskType: z.enum(['birthday', 'remarketing']),
  referenceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type ResolveCrmTaskInput = z.infer<typeof resolveCrmTaskSchema>;

export const resolveCrmTask = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => resolveCrmTaskSchema.parse(input))
  .handler(async ({ data }) => {
    const { clientId, taskType, referenceDate } = data;

    const supabase = createSupabaseServer();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('[crm] Sessão inválida.');

    // Buscar studio_id do profile do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('studio_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('[crm] Perfil não encontrado.');
    }

    const studioId = profile.studio_id;

    // Inserir registro em crm_logs
    const { error: insertError } = await supabase
      .from('crm_logs')
      .insert({
        client_id: clientId,
        task_type: taskType,
        reference_date: referenceDate,
        studio_id: studioId,
        created_by: user.id,
      });

    if (insertError) {
      throw new Error(`[crm] Erro ao inserir log: ${insertError.message}`);
    }

    return { success: true };
  });