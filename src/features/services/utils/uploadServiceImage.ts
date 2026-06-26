// src/features/services/utils/uploadServiceImage.ts
import { getSupabaseBrowser } from '@/lib/supabase/client';

const BUCKET = 'services';
const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp'] as const;
const EXT_BY_TYPE: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

export type UploadServiceImageResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

export function validateServiceImage(file: File): string | null {
  if (!ALLOWED.includes(file.type as (typeof ALLOWED)[number])) {
    return 'Formato inválido. Use PNG, JPG ou WEBP.';
  }
  if (file.size > MAX_BYTES) {
    return 'Imagem muito grande. Máximo 2 MB.';
  }
  return null;
}

export async function uploadServiceImage(
  file: File,
  serviceId: string,
): Promise<UploadServiceImageResult> {
  const validationError = validateServiceImage(file);
  if (validationError) {
    return { ok: false, message: validationError };
  }

  const ext = EXT_BY_TYPE[file.type] ?? 'jpg';
  const path = `${serviceId}-${Date.now()}.${ext}`;

  const supabase = getSupabaseBrowser();

  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (uploadErr) {
    return { ok: false, message: uploadErr.message };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) {
    return { ok: false, message: 'Falha ao obter URL pública.' };
  }

  return { ok: true, url: data.publicUrl };
}