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
    .min(8, 'Telefone é obrigatório e deve ter no mínimo 8 caracteres.')
    .max(30),
  email: z
    .string()
    .trim()
    .max(255)
    .email('E-mail inválido.')
    .optional()
    .or(z.literal(''))
    .transform((v) => (v && v.length > 0 ? v.toLowerCase() : null)),
  birthDay: z.number().min(1).max(31).optional(),
  birthMonth: z.number().min(1).max(12).optional(),
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

    // Monta a data de aniversário se o usuário preencheu dia e mês.
    // Usamos o ano 2000 como base padrão, já que queremos apenas celebrar o aniversário.
    let birthDate: string | null = null;
    if (data.birthDay && data.birthMonth) {
      const m = String(data.birthMonth).padStart(2, '0');
      const d = String(data.birthDay).padStart(2, '0');
      birthDate = `2000-${m}-${d}`;
    }

    const { data: row, error } = await supabase
      .from('clients')
      .insert({
        full_name: data.fullName,
        phone: data.phone,
        email: data.email,
        birth_date: birthDate,
      })
      .select('id, full_name, phone')
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Já existe um cliente com este e-mail ou telefone.');
      }
      throw error;
    }

    return {
      id: row.id,
      name: row.full_name ?? 'Cliente',
      phone: row.phone,
    };
  });