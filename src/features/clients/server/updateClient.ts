// src/features/clients/server/updateClient.ts
'use server'

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createSupabaseServer } from '@/lib/supabase/server'
import { parseBusinessError } from '@/lib/errors/parseBusinessError'

const updateClientSchema = z.object({
  clientId: z.string().uuid(),
  data: z.object({
    name: z.string().max(100).optional(),
    phone: z.string().optional(),
    email: z.string().nullable().optional(),
    birth_date: z.string().nullable().optional(),
    cpf: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    tags: z.array(z.string()).optional(),
    avatar_url: z.string().nullable().optional(),
    status: z.enum(['active', 'vip', 'inactive', 'new']).optional(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'Pelo menos um campo deve ser fornecido para atualização.' }
  ),
})

export type UpdateClientInput = z.infer<typeof updateClientSchema>

export const updateClient = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => updateClientSchema.parse(input))
  .handler(async ({ data }) => {
    const { clientId, data: updateData } = data
    const supabase = createSupabaseServer()

    // 1. Build updatePayload only with fields !== undefined
    const updatePayload: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        // Mapeia 'name' do form para 'full_name' no banco
        const dbKey = key === 'name' ? 'full_name' : key
        updatePayload[dbKey] = value
      }
    }

    // 2. Fetch current client to detect changes
    const { data: currentClient, error: fetchError } = await supabase
      .from('clients')
      .select('profile_id, full_name, phone, tags, notes')
      .eq('id', clientId)
      .single()

    if (fetchError || !currentClient) {
      throw new Error('Cliente não encontrado')
    }

    // 3. Update clients table
    const { data: updatedClient, error: updateError } = await supabase
      .from('clients')
      .update(updatePayload)
      .eq('id', clientId)
      .select()
      .single()

    if (updateError || !updatedClient) {
      throw updateError
    }

    // 4. If name or phone changed and client has profile_id, update profiles
    const nameChanged = 'full_name' in updatePayload && updatePayload.name !== currentClient.full_name
    const phoneChanged = 'phone' in updatePayload && updatePayload.phone !== currentClient.phone
    if ((nameChanged || phoneChanged) && currentClient.profile_id) {
      const profileUpdate: Record<string, unknown> = {}
      if (nameChanged) profileUpdate.full_name = updatePayload.full_name
      if (phoneChanged) profileUpdate.phone = updatePayload.phone

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', currentClient.profile_id)

      if (profileError) {
        console.error('Erro ao atualizar profile do cliente:', profileError)
      }
    }

    // 5. If tags changed, insert client_events with event_type 'tag_added'
    const tagsChanged = 'tags' in updatePayload &&
      JSON.stringify(updatePayload.tags) !== JSON.stringify(currentClient.tags)
    if (tagsChanged) {
      const newTags = (updatePayload.tags as string[]) || []
      const oldTags = (currentClient.tags as string[]) || []
      const addedTags = newTags.filter(tag => !oldTags.includes(tag))

      if (addedTags.length > 0) {
        const { error: tagsEventError } = await supabase
          .from('client_events')
          .insert({
            client_id: clientId,
            event_type: 'tag_added',
            metadata: { tags: addedTags },
          })

        if (tagsEventError) {
          console.error('Erro ao registrar evento de tags:', tagsEventError)
        }
      }
    }

    // 6. If notes changed, insert client_events with event_type 'note_added'
    const notesChanged = 'notes' in updatePayload &&
      updatePayload.notes !== currentClient.notes
    if (notesChanged) {
      const { error: notesEventError } = await supabase
        .from('client_events')
        .insert({
          client_id: clientId,
          event_type: 'note_added',
          metadata: { note: updatePayload.notes },
        })

      if (notesEventError) {
        console.error('Erro ao registrar evento de nota:', notesEventError)
      }
    }

    // 7. Return updated client
    return updatedClient
  })