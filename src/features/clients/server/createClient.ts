// src/features/clients/server/createClient.ts
'use server'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createSupabaseServer } from '@/lib/supabase/server'

const createClientSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().min(1),
  email: z.string().nullable().optional(),
  birth_date: z.string().nullable().optional(),
  cpf: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  avatar_url: z.string().nullable().optional(),
  status: z.enum(['active', 'vip', 'inactive', 'new']).optional().default('active'),
})

export type CreateClientInput = z.infer<typeof createClientSchema>

export const createClient = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => createClientSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = createSupabaseServer()

    const { data: newClient, error } = await supabase
      .from('clients')
      .insert({
        full_name: data.name,
        phone: data.phone,
        email: data.email ?? null,
        birth_date: data.birth_date ?? null,
        cpf: data.cpf ?? null,
        address: data.address ?? null,
        notes: data.notes ?? null,
        tags: data.tags ?? [],
        avatar_url: data.avatar_url ?? null,
        status: data.status ?? 'active',
      })
      .select()
      .single()

    if (error) throw error
    return newClient
  })