import { z } from 'zod';
import type { Tables } from '@/lib/supabase/types';

/**
 * ============================================
 * Clients — shared types & schemas
 * ============================================
 *
 * Helpers locais ao módulo de clientes.
 *
 * IMPORTANTE: cliente tem DUAS origens:
 *  - "account": cliente vinculado a um profile (criou conta no studio)
 *  - "walkin":  cliente cadastrado direto pelo admin/staff (sem conta)
 *
 * A leitura usa a VIEW `clients_view` que consolida display_name/phone/email
 * via COALESCE(profiles.*, clients.*). A escrita vai sempre na tabela `clients`.
 *
 * Schemas Zod validam input da UI; constraints reais ficam no banco (RLS, CHECK).
 */

// --------------------------------------------
// SHAPE ADMIN (camelCase, consolidado da view)
// --------------------------------------------
export type ClientOrigin = 'account' | 'walkin';

export interface AdminClientItem {
  id: string;
  profileId: string | null;
  origin: ClientOrigin;
  displayName: string;
  displayPhone: string | null;
  displayEmail: string | null;
  notes: string | null;
  birthDate: string | null;        // ISO date (YYYY-MM-DD)
  lastVisitAt: string | null;      // timestamptz
  totalAppointments: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

// --------------------------------------------
// ROW selector — colunas que sempre buscamos da VIEW
// --------------------------------------------
export const CLIENT_VIEW_COLUMNS =
  'id, profile_id, origin, display_name, display_phone, display_email, notes, birth_date, last_visit_at, total_appointments, total_spent, created_at, updated_at' as const;

export type ClientViewRow = Pick<
  Tables<'clients_view'>,
  | 'id'
  | 'profile_id'
  | 'origin'
  | 'display_name'
  | 'display_phone'
  | 'display_email'
  | 'notes'
  | 'birth_date'
  | 'last_visit_at'
  | 'total_appointments'
  | 'total_spent'
  | 'created_at'
  | 'updated_at'
>;

export function mapClientViewRow(row: ClientViewRow): AdminClientItem {
  return {
    id: row.id ?? '',
    profileId: row.profile_id,
    origin: (row.origin ?? 'walkin') as ClientOrigin,
    displayName: row.display_name ?? 'Cliente sem nome',
    displayPhone: row.display_phone,
    displayEmail: row.display_email,
    notes: row.notes,
    birthDate: row.birth_date,
    lastVisitAt: row.last_visit_at,
    totalAppointments: row.total_appointments ?? 0,
    totalSpent: Number(row.total_spent ?? 0),
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  };
}

// --------------------------------------------
// SCHEMAS — validação de input
// --------------------------------------------
const nameSchema = z
  .string()
  .trim()
  .min(2, 'Nome deve ter ao menos 2 caracteres')
  .max(120, 'Nome muito longo');

const phoneSchema = z
  .string()
  .trim()
  .nullable()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : null))
  .refine(
    (v) => {
      if (v === null) return true;
      // Conta apenas dígitos (ignora máscara: parênteses, traços, espaços, +)
      const digits = v.replace(/\D/g, '');
      return digits.length >= 10 && digits.length <= 13;
    },
    { message: 'Telefone inválido. Use DDD + número (ex: (14) 99999-9999)' },
  );

const emailSchema = z
  .string()
  .trim()
  .nullable()
  .optional()
  .transform((v) => (v && v.length > 0 ? v.toLowerCase() : null))
  .refine(
    (v) => {
      if (v === null) return true;
      // Regex pragmática: algo@algo.tld (mínimo 2 chars no TLD)
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length <= 255;
    },
    { message: 'E-mail inválido' },
  );

const notesSchema = z
  .string()
  .trim()
  .max(2000, 'Anotações muito longas')
  .nullable()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : null));

const MIN_BIRTH_YEAR = 1900;

const birthDateSchema = z
  .string()
  .trim()
  .nullable()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : null))
  .refine(
    (v) => {
      if (v === null) return true;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) return false;
      const year = d.getFullYear();
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return year >= MIN_BIRTH_YEAR && d <= today;
    },
    { message: 'Data de nascimento inválida' },
  );

// --------------------------------------------
// CREATE INPUT — cliente walk-in (sem profile)
// --------------------------------------------
export const createClientInputSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
  notes: notesSchema,
  birthDate: birthDateSchema,
});

export type CreateClientInput = z.infer<typeof createClientInputSchema>;

// --------------------------------------------
// UPDATE INPUT — patch parcial
// --------------------------------------------
export const updateClientInputSchema = z.object({
  id: z.string().uuid('ID inválido'),
  patch: z
    .object({
      name: nameSchema.optional(),
      phone: phoneSchema,
      email: emailSchema,
      notes: notesSchema,
      birthDate: birthDateSchema,
    })
    .refine((p) => Object.keys(p).length > 0, {
      message: 'Nenhum campo para atualizar',
    }),
});

export type UpdateClientInput = z.infer<typeof updateClientInputSchema>;

// --------------------------------------------
// PG ERROR MAPPER
// --------------------------------------------
type PgLikeError = { code?: string; message?: string };

export function mapPgError(err: PgLikeError | null | undefined): string {
  if (!err) return 'Erro desconhecido';
  switch (err.code) {
    case '23505':
      return 'Já existe um cliente com esses dados (e-mail ou telefone duplicado)';
    case '23514':
      return 'Dados violam regra do banco';
    case '23503':
      return 'Referência inválida (profile não encontrado)';
    case '42501':
      return 'Sem permissão para esta operação';
    case 'PGRST116':
      return 'Cliente não encontrado';
    default:
      return err.message ?? 'Erro ao processar requisição';
  }
}

// --------------------------------------------
// ZOD ERROR FORMATTER
// --------------------------------------------
/**
 * Converte ZodError em mensagem legível p/ UI.
 * Pega a PRIMEIRA mensagem de erro (mais relevante pro usuário).
 */
export function formatZodError(err: z.ZodError): string {
  const first = err.issues[0];
  if (!first) return 'Dados inválidos';

  // Se tem path, mostra o campo
  const field = first.path.length > 0 ? `${first.path.join('.')}: ` : '';
  return `${field}${first.message}`;
}

/**
 * Wrapper para usar dentro de inputValidator.
 * Converte ZodError em Error simples (que atravessa a fronteira server/client).
 */
export function parseInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(formatZodError(result.error));
  }
  return result.data;
}
