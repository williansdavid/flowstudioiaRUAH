// src/features/staff/server/updateStaff.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { phoneBRSchema } from '@/lib/core/utils';

const BUCKET = 'avatars';

const updateStaffSchema = z.object({
  id: z.string().uuid('ID inválido'),
  full_name: z.string().trim().min(2, 'Nome muito curto'),
  phone: phoneBRSchema,
  specialty: z.string().trim().optional().or(z.literal('')),
  is_bookable: z.boolean().default(true),
  avatar_url: z.string().url('URL inválida').nullable().optional(),
  color: z.string().nullable().optional(), // <--- NOVO CAMPO
});

export type UpdateStaffInput = z.input<typeof updateStaffSchema>;

export type UpdateStaffResult =
  | { ok: true }
  | { ok: false; reason: 'FORBIDDEN' }
  | { ok: false; reason: 'NOT_FOUND' }
  | { ok: false; reason: 'UNKNOWN'; message: string };

function extractAvatarPath(url: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const raw = url.slice(idx + marker.length).split('?')[0];
  if (!raw) return null;
  const path = decodeURIComponent(raw);
  if (path.includes('/') || path.trim() === '') return null;
  return path;
}

export const updateStaff = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) => updateStaffSchema.parse(raw))
  .handler(async ({ data }): Promise<UpdateStaffResult> => {
    const supabase = createSupabaseServer();

    const {
      data: { user },
      error: sessionErr,
    } = await supabase.auth.getUser();

    if (sessionErr || !user) {
      throw new Error('Sessão inválida.');
    }

    const { data: role, error: roleErr } = await supabase.rpc('current_user_role');
    if (roleErr) {
      throw new Error('Falha ao verificar permissão.');
    }
    if (role === 'client') {
      return { ok: false, reason: 'FORBIDDEN' };
    }

    const { data: target, error: findErr } = await supabase
      .from('staff')
      .select('id, profile_id')
      .eq('id', data.id)
      .maybeSingle();

    if (findErr) {
      return { ok: false, reason: 'UNKNOWN', message: findErr.message };
    }
    if (!target) {
      return { ok: false, reason: 'NOT_FOUND' };
    }

    if (role === 'staff' && target.profile_id !== user.id) {
      return { ok: false, reason: 'FORBIDDEN' };
    }

    const phone = data.phone;
    const specialty = data.specialty?.trim() ? data.specialty.trim() : null;

    const { error: updErr } = await supabase
      .from('staff')
      .update({
        full_name: data.full_name,
        phone,
        specialty,
        is_bookable: data.is_bookable,
        color: data.color || null, // <--- SALVANDO A COR
      })
      .eq('id', data.id);

    if (updErr) {
      return { ok: false, reason: 'UNKNOWN', message: updErr.message };
    }

    if (data.avatar_url !== undefined) {
      if (!target.profile_id) {
        return {
          ok: false,
          reason: 'UNKNOWN',
          message: 'Profissional sem perfil vinculado — não é possível salvar avatar.',
        };
      }

      const admin = createSupabaseAdmin();

      const { data: prevProfile, error: prevErr } = await admin
        .from('profiles')
        .select('avatar_url')
        .eq('id', target.profile_id)
        .maybeSingle();

      if (prevErr) {
        return { ok: false, reason: 'UNKNOWN', message: prevErr.message };
      }

      const oldUrl = prevProfile?.avatar_url ?? null;

      const { error: avatarErr } = await admin
        .from('profiles')
        .update({ avatar_url: data.avatar_url })
        .eq('id', target.profile_id);

      if (avatarErr) {
        return { ok: false, reason: 'UNKNOWN', message: avatarErr.message };
      }

      if (oldUrl && oldUrl !== data.avatar_url) {
        const oldPath = extractAvatarPath(oldUrl);
        if (oldPath) {
          const { error: removeErr } = await admin.storage.from(BUCKET).remove([oldPath]);
          if (removeErr) {
            console.warn(`[updateStaff] Falha ao remover avatar órfão "${oldPath}": ${removeErr.message}`);
          }
        }
      }
    }

    return { ok: true };
  });