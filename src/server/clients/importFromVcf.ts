// src/server/clients/importFromVcf.ts
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createSupabaseAdmin } from '@/lib/supabase/admin';

const importVcfSchema = z.object({
  content: z.string().min(1, 'Conteúdo do arquivo é obrigatório'),
});

export type ImportVcfInput = z.infer<typeof importVcfSchema>;

export type ImportVcfResult = {
  imported: number;
  duplicates: number;
  incomplete: number;
  skippedPhone: number;
  total: number;
  errors: string[];
};

interface ParsedContact {
  name: string | null;
  phone: string | null;
  email: string | null;
}

/* ───────── Quoted-printable decoder ───────── */

function decodeQuotedPrintable(input: string): string {
  console.log('debug:qp-in:', input);
  // Remove soft line breaks (=\r\n ou =\n)
  const unwrapped = input.replace(/=\r?\n/g, '');

  // Converte =XX em bytes, depois decodifica como UTF-8
  const decoded = unwrapped.replace(/=([\da-fA-F]{2})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex as string, 16)),
  );

  console.log('debug:qp-out:', decoded);

  // Tenta interpretar como Latin1 e converter pra UTF-8
  try {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(decoded);
    const textDecoder = new TextDecoder('utf-8', { fatal: false });
    const result = textDecoder.decode(bytes);
    return result;
  } catch {
    return decoded;
  }
}

/* ───────── Pré-processamento ───────── */

function preprocessVcf(content: string): string {
  // 1. Remove QP soft breaks (=\n)
  content = content.replace(/=\r?\n/g, '');
  // 2. Unfold vCard (linha continuada com espaço/tab)
  content = content.replace(/\r?\n[ \t]/g, '');
  return content;
}

/* ───────── Parser vCard ───────── */

function parseVcf(raw: string): ParsedContact[] {
  const content = preprocessVcf(raw);
  const blocks = content.match(/BEGIN:VCARD[\s\S]*?END:VCARD/g);
  if (!blocks) return [];

  return blocks.map((block) => {
    /* ─── FN (nome completo) ─── */
    const fnLine = block.match(/^FN(?:[^:]*):(.+)/im);
    let name: string | null = null;

    if (fnLine) {
      const rawValue = fnLine[1]!.trim();
      const isQuotedPrintable =
        /ENCODING=QUOTED-PRINTABLE/i.test(block.substring(0, block.indexOf(':')));
      name = isQuotedPrintable ? decodeQuotedPrintable(rawValue).trim() : rawValue;
    }

    /* ─── TEL (telefone) - prefere CELL ─── */
    const telRegex = /^(?:item\d+\.)?TEL([^:]*):(.+)$/gim;
    let phone: string | null = null;
    let match: RegExpExecArray | null;

    while ((match = telRegex.exec(block)) !== null) {
      const params = match[1]!;
      const value = match[2]!.trim();
      const isCellular =
        /(?:^|;)CELL(?:$|;)/i.test(params) ||
        /X-Celular/i.test(params);

      if (isCellular && !phone) {
        phone = value; // primeiro CELL encontrado
      }
      if (!phone) {
        phone = value; // fallback: qualquer TEL
      }
    }

    /* ─── EMAIL ─── */
    const emailMatch = block.match(/^(?:item\d+\.)?EMAIL(?:[^:]*):(.+)/im);
    const email = emailMatch?.[1]?.trim()?.toLowerCase() ?? null;

    return { name, phone, email };
  });
}

/* ───────── Normalizador de telefone BR ───────── */

function normalizePhone(raw: string | null): string | null {
  if (!raw) return null;

  const digits = raw.replace(/\D/g, '');
  if (digits.length === 0) return null;

  // Gera candidatos testando remoção de prefixos
  const candidates = new Set<string>();
  candidates.add(digits);

  // Remove 55 (código do país)
  if (digits.startsWith('55') && digits.length >= 12) {
    candidates.add(digits.slice(2));
  }

  // Remove 0 (prefixo de tronco)
  if (digits.startsWith('0')) {
    candidates.add(digits.slice(1));
    // Remove 0 + 2 dígitos (carrier code, ex: 015, 014)
    if (digits.length >= 4) {
      candidates.add(digits.replace(/^0\d{2}/, ''));
    }
  }

  // Combinação: 55 + 0 + carrier
  if (digits.startsWith('55') && digits.length >= 4 && digits[2] === '0') {
    candidates.add(digits.slice(3));
    if (digits.length >= 6) {
      candidates.add(digits.replace(/^550\d{2}/, ''));
      candidates.add(digits.replace(/^55\d{2}/, ''));
    }
  }

  for (const candidate of candidates) {
    if (candidate.length !== 10 && candidate.length !== 11) continue;

    const ddd = parseInt(candidate.slice(0, 2), 10);
    if (ddd < 11 || ddd > 99) continue;

    // Se tem 9 dígitos (celular), o 3º dígito DEVE ser 9
    if (candidate.length === 11 && candidate[2] !== '9') continue;

    return `+55${candidate}`;
  }

  return null;
}

/* ───────── Server function ───────── */

export const importFromVcf = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => importVcfSchema.parse(data))
  .handler(async ({ data }): Promise<ImportVcfResult> => {
    const admin = createSupabaseAdmin();
    const contacts = parseVcf(data.content);

    const result: ImportVcfResult = {
      imported: 0,
      duplicates: 0,
      incomplete: 0,
      skippedPhone: 0,
      total: contacts.length,
      errors: [],
    };

    for (const contact of contacts) {
      if (!contact.name) {
        result.incomplete++;
        continue;
      }

      const phone = normalizePhone(contact.phone);
      if (!contact.email && !phone) {
        result.incomplete++;
        continue;
      }

      // Duplicata por email
      if (contact.email) {
        const { data: existing } = await admin
          .from('clients')
          .select('id')
          .eq('email', contact.email)
          .maybeSingle();

        if (existing) {
          result.duplicates++;
          continue;
        }
      }

      const { error } = await admin.from('clients').insert({
        full_name: contact.name,
        email: contact.email,
        phone,
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
        if (!phone && contact.phone) result.skippedPhone++;
      }
    }

    return result;
  });