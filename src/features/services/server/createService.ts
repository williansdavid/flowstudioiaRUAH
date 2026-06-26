// src/features/services/server/createService.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { ServiceItem } from '../types';

const createServiceSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do serviço.'),
  description: z.string().trim().nullable(),
  category: z.string().trim().nullable(),
  durationMinutes: z.number().int().positive('Duração inválida.'),
  price: z.number().nonnegative('Preço inválido.'),
  isActive: z.boolean(),
  imageUrl: z.string().nullable().optional(),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;

export const createService = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => createServiceSchema.parse(data))
  .handler(async ({ data }): Promise<ServiceItem> => {
    const supabase = createSupabaseServer();

    const insertData: Record<string, unknown> = {
      name: data.name,
      description: data.description,
      category: data.category,
      duration_minutes: data.durationMinutes,
      price: data.price,
      is_active: data.isActive,
    };

    if (data.imageUrl !== undefined) {
      insertData.image_url = data.imageUrl;
    }

    const { data: row, error } = await supabase
      .from('services')
      .insert(insertData)
      .select(
        'id, name, description, category, duration_minutes, price, image_url, display_order, is_active',
      )
      .single();

    if (error || !row) {
      throw new Error('Não foi possível criar o serviço.');
    }

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      durationMinutes: row.duration_minutes,
      price: Number(row.price),
      imageUrl: row.image_url,
      displayOrder: row.display_order,
      isActive: row.is_active,
    };
  });