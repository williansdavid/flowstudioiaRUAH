// src/features/staff/server/updateStaff.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseServer } from '@/lib/supabase/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { phoneBRSchema } from '@/lib/core/utils';

const BUCKET = 'avatars';

// ----------------------------------------------------------------
// Input schema (sem email — read-only na edição)
// ----------------------------------------------------------------
const updateStaffSchema = z.object({
  id: z.string().uuid('ID inválido'),
  full_name: z.string().trim().min(2, 'Nome muito curto'),
  // obrigatório; chega mascarado/sujo e sai canônico +55DDDNUMERO
  phone: phoneBRSchema,
  specialty: z.string().trim().optional().or(z.literal('')),
  is_bookable: z.boolean().default(true),
  // null = remover avatar; undefined = não mexe; string = nova URL
  avatar_url: z.string().url('URL inválida').nullable().optional(),
});

export type UpdateStaffInput = z.input<typeof updateStaffSchema>;

export type UpdateStaffResult =
  | { ok: true }
  | { ok: false; reason: 'FORBIDDEN' }
  | { ok: false; reason: 'NOT_FOUND' }
  | { ok: false; reason: 'UNKNOWN'; message: string };

/**
 * Extrai o path (filename) de uma public URL do bucket de avatares.
 * Só aceita URLs que apontem para o BUCKET correto — qualquer coisa
 * fora do padrão retorna null e o delete é pulado (zero risco de
 * apagar arquivo errado).
 *
 * Padrão esperado:
 *   https://<proj>.supabase.co/storage/v1/object/public/avatars/<file>
 */
function extractAvatarPath(url: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;

  const raw = url.slice(idx + marker.length).split('?')[0];
  if (!raw) return null;

  const path = decodeURIComponent(raw);
  // Garante que é só um filename simples no root do bucket.
  if (path.includes('/') || path.trim() === '') return null;

  return path;
}

export const updateStaff = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) => updateStaffSchema.parse(raw))
  .handler(async ({ data }): Promise<UpdateStaffResult> => {
    const supabase = createSupabaseServer();

    // PASSO 1 — Sessão
    const {
      data: { user },
      error: sessionErr,
    } = await supabase.auth.getUser();
    if (sessionErr || !user) {
      throw new Error('Sessão inválida.');
    }

    // PASSO 2 — Role
    const { data: role, error: roleErr } =
      await supabase.rpc('current_user_role');
    if (roleErr) {
      throw new Error('Falha ao verificar permissão.');
    }
    if (role === 'client') {
      return { ok: false, reason: 'FORBIDDEN' };
    }

    // PASSO 3 — Buscar alvo (existência + ownership)
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

    // staff só edita o próprio registro; admin edita qualquer um.
    if (role === 'staff' && target.profile_id !== user.id) {
      return { ok: false, reason: 'FORBIDDEN' };
    }

    // PASSO 4 — Update staff
    // phone já chega canônico (+55DDDNUMERO) via phoneBRSchema
    const phone = data.phone;
    const specialty = data.specialty?.trim() ? data.specialty.trim() : null;

    const { error: updErr } = await supabase
      .from('staff')
      .update({
        full_name: data.full_name,
        phone,
        specialty,
        is_bookable: data.is_bookable,
      })
      .eq('id', data.id);

    if (updErr) {
      return { ok: false, reason: 'UNKNOWN', message: updErr.message };
    }

    // PASSO 5 — Avatar (só se veio no input e o staff tem profile vinculado)
    // avatar_url === undefined => não mexe. null => limpa. string => grava.
    if (data.avatar_url !== undefined) {
      if (!target.profile_id) {
        return {
          ok: false,
          reason: 'UNKNOWN',
          message:
            'Profissional sem perfil vinculado — não é possível salvar avatar.',
        };
      }

      // profiles.avatar_url de OUTRO usuário => admin client (bypassa RLS).
      // Autorização já validada nos PASSOS 2-3.
      const admin = createSupabaseAdmin();

      // 5a — Lê o avatar_url ATUAL (pra saber qual arquivo virou lixo).
      //      Só roda aqui dentro: custo zero quando avatar não muda.
      const { data: prevProfile, error: prevErr } = await admin
        .from('profiles')
        .select('avatar_url')
        .eq('id', target.profile_id)
        .maybeSingle();

      if (prevErr) {
        return { ok: false, reason: 'UNKNOWN', message: prevErr.message };
      }

      const oldUrl = prevProfile?.avatar_url ?? null;

      // 5b — Grava o novo valor (string ou null).
      const { error: avatarErr } = await admin
        .from('profiles')
        .update({ avatar_url: data.avatar_url })
        .eq('id', target.profile_id);

      if (avatarErr) {
        return { ok: false, reason: 'UNKNOWN', message: avatarErr.message };
      }

      // 5c — Cleanup do arquivo antigo (best-effort).
      //      Só deleta se: havia URL antiga, mudou, e o path é válido.
      //      Falha aqui NÃO derruba a operação — a coluna é a verdade.
      if (oldUrl && oldUrl !== data.avatar_url) {
        const oldPath = extractAvatarPath(oldUrl);
        if (oldPath) {
          const { error: removeErr } = await admin.storage
            .from(BUCKET)
            .remove([oldPath]);

          if (removeErr) {
            console.warn(
              `[updateStaff] Falha ao remover avatar órfão "${oldPath}": ${removeErr.message}`,
            );
          }
        }
      }
    }

    return { ok: true };
  });
