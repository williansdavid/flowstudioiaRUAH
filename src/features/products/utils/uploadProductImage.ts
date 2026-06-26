// src/features/products/utils/uploadProductImage.ts
import { getSupabaseBrowser } from '@/lib/supabase/client';

const BUCKET = 'products';
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp'] as const;
const EXT_BY_TYPE: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

export type UploadProductImageResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

/** Valida o arquivo no client antes de subir. */
export function validateProductImage(file: File): string | null {
  if (!ALLOWED.includes(file.type as (typeof ALLOWED)[number])) {
    return 'Formato inválido. Use PNG, JPG ou WEBP.';
  }
  if (file.size > MAX_BYTES) {
    return 'Imagem muito grande. Máximo 2 MB.';
  }
  return null;
}

/**
 * Sobe a imagem para o Storage e retorna a URL pública.
 * Nome: {productId}-{timestamp}.{ext} — cache-bust natural, sem colisão.
 */
export async function uploadProductImage(
  file: File,
  productId: string,
): Promise<UploadProductImageResult> {
  const validationError = validateProductImage(file);
  if (validationError) {
    return { ok: false, message: validationError };
  }

  const ext = EXT_BY_TYPE[file.type] ?? 'jpg';
  const path = `${productId}-${Date.now()}.${ext}`;

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