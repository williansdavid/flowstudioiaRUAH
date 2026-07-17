// src/server/clients/importVcfBatch.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseAdmin } from '@/lib/supabase/admin';

const contactSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  phone: z.string().nullable(),
  email: z.string().nullable(),
});

const importVcfBatchSchema = z.object({
  contacts: z.array(contactSchema).min(1).max(50),
  batchIndex: z.number().int().min(0),
  totalBatches: z.number().int().min(1),
});

export type ImportVcfBatchInput = z.infer<typeof importVcfBatchSchema>;

export type ImportVcfBatchResult = {
  imported: number;
  duplicates: number;
  skippedPhone: number;
  errors: string[];
  batchIndex: number;
  totalBatches: number;
};

/**
 * Normaliza telefone BR para +55XXXXXXXXX.
 * Remove carrier codes (015, 014), código do país duplicado, etc.
 * Retorna null se o número não tiver DDD válido ou formato incorreto.
 */
function normalizePhone(raw: string | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 0) return null;

  const candidates = new Set<string>();
  candidates.add(digits);

  // Remove código do país 55
  if (digits.startsWith('55') && digits.length >= 12) {
    candidates.add(digits.slice(2));
  }

  // Remove 0 seguido de carrier code (ex: 015, 014)
  if (digits.startsWith('0')) {
    candidates.add(digits.slice(1));
    if (digits.length >= 4) {
      candidates.add(digits.replace(/^0\d{2}/, ''));
    }
  }

  // Combinação: 55 + 0 + carrier
  if (digits.startsWith('55') && digits.length >= 4 && digits[2] === '0') {
    if (digits.length >= 6) {
      candidates.add(digits.replace(/^550\d{2}/, ''));
    }
  }

  for (const candidate of candidates) {
    if (candidate.length !== 10 && candidate.length !== 11) continue;
    const ddd = parseInt(candidate.slice(0, 2), 10);
    if (ddd < 11 || ddd > 99) continue;
    if (candidate.length === 11 && candidate[2] !== '9') continue;
    return `+55${candidate}`;
  }

  return null;
}

export const importVcfBatch = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => importVcfBatchSchema.parse(data))
  .handler(async ({ data }): Promise<ImportVcfBatchResult> => {
    const admin = createSupabaseAdmin();
    const { contacts, batchIndex, totalBatches } = data;

    const result: ImportVcfBatchResult = {
      imported: 0,
      duplicates: 0,
      skippedPhone: 0,
      errors: [],
      batchIndex,
      totalBatches,
    };

    // Coletar emails e telefones do lote para verificar duplicatas em massa
    const batchEmails = contacts
      .map((c) => c.email?.toLowerCase().trim())
      .filter((e): e is string => !!e);

    const batchPhones = contacts
      .map((c) => normalizePhone(c.phone))
      .filter((p): p is string => !!p);

    // Buscar contatos existentes no banco com esses emails ou telefones
    const existingEmails = new Set<string>();
    const existingPhones = new Set<string>();

    if (batchEmails.length > 0) {
      const { data: existing } = await admin
        .from('clients')
        .select('email')
        .in('email', batchEmails);

      if (existing) {
        for (const row of existing) {
          if (row.email) existingEmails.add(row.email.toLowerCase());
        }
      }
    }

    if (batchPhones.length > 0) {
      const { data: existing } = await admin
        .from('clients')
        .select('phone')
        .in('phone', batchPhones);

      if (existing) {
        for (const row of existing) {
          if (row.phone) existingPhones.add(row.phone);
        }
      }
    }

    // Rastrear inserções deste lote para evitar duplicatas intra-lote
    const batchInsertedEmails = new Set<string>();
    const batchInsertedPhones = new Set<string>();

    for (const contact of contacts) {
      if (!contact.name) {
        result.duplicates++;
        continue;
      }

      const normalizedPhone = normalizePhone(contact.phone);
      const lowerEmail = contact.email?.toLowerCase().trim() ?? null;

      // Verificar duplicata (banco + intra-lote)
      const isDupEmail =
        lowerEmail &&
        (existingEmails.has(lowerEmail) || batchInsertedEmails.has(lowerEmail));
      const isDupPhone =
        normalizedPhone &&
        (existingPhones.has(normalizedPhone) || batchInsertedPhones.has(normalizedPhone));

      if (isDupEmail || isDupPhone) {
        result.duplicates++;
        continue;
      }

      const { error } = await admin.from('clients').insert({
        full_name: contact.name,
        email: lowerEmail,
        phone: normalizedPhone,
        status: 'active',
      });

      if (error) {
        if (error.code === '23505') {
          result.duplicates++;
        } else {
          result.errors.push(`${contact.name}: ${error.message}`);
        }
      } else {
        result.imported++;
        if (lowerEmail) batchInsertedEmails.add(lowerEmail);
        if (normalizedPhone) batchInsertedPhones.add(normalizedPhone);
        if (!normalizedPhone && contact.phone) result.skippedPhone++;
      }
    }

    return result;
  });