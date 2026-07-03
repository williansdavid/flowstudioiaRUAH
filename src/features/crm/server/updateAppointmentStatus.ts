// src/features/crm/server/updateAppointmentStatus.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';

const inputSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending', 'confirmed', 'completed', 'no_show', 'cancelled']),
});

export const updateAppointmentStatus = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const { id, status } = data;
    const supabase = createSupabaseServer();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);

    if (error) throw new Error(`Failed to update appointment: ${error.message}`);

    return { success: true };
  });