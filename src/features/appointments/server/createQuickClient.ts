// src/features/appointments/server/createQuickClient.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { ClientOption } from '../types';

const inputSchema = z.object({
  fullName: z.string().trim().min(2, 'Nome muito curto.').max(120),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  email: z
    .string()
    .trim()
    .max(255)
    .email('E-mail inválido.')
    .optional()
    .or(z.literal(''))
    .transform((v) => (v && v.length > 0 ? v.toLowerCase() : null)),
});

export type CreateQuickClientInput = z.input<typeof inputSchema>;

export const createQuickClient = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<ClientOption> => {
    const supabase = createSupabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('[appointments] Sessão inválida.');
    }

    const { data: row, error } = await supabase
      .from('clients')
      .insert({
        full_name: data.fullName,
        phone: data.phone,
        email: data.email,
      })
      .select('id, full_name, phone')
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Já existe um cliente com este e-mail.');
      }
      throw error;
    }

    return {
      id: row.id,
      name: row.full_name ?? 'Cliente',
      phone: row.phone,
    };
  });
