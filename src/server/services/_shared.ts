import { z } from 'zod';
import type { Tables } from '@/lib/supabase/types';

/**
 * ============================================
 * Services — shared types & schemas
 * ============================================
 *
 * Helpers locais ao módulo de serviços.
 * - Schemas Zod espelham os CHECK constraints do banco
 *   (duration_minutes > 0, price >= 0).
 * - mapRow normaliza snake_case do banco para camelCase da UI.
 * - mapPgError traduz códigos do Postgres para mensagens amigáveis.
 */

// --------------------------------------------
// SHAPE ADMIN (campos completos, camelCase)
// --------------------------------------------
export interface AdminServiceItem {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  durationMinutes: number;
  imageUrl: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// --------------------------------------------
// ROW selector — colunas que sempre buscamos
// --------------------------------------------
export const SERVICE_COLUMNS =
  'id, name, description, category, price, duration_minutes, image_url, is_active, display_order, created_at, updated_at' as const;

export type ServiceRow = Pick<
  Tables<'services'>,
  | 'id'
  | 'name'
  | 'description'
  | 'category'
  | 'price'
  | 'duration_minutes'
  | 'image_url'
  | 'is_active'
  | 'display_order'
  | 'created_at'
  | 'updated_at'
>;

export function mapServiceRow(row: ServiceRow): AdminServiceItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    price: Number(row.price),
    durationMinutes: row.duration_minutes,
    imageUrl: row.image_url,
    isActive: row.is_active,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// --------------------------------------------
// SCHEMAS — espelham constraints do banco
// --------------------------------------------
const nameSchema = z
  .string()
  .trim()
  .min(2, 'Nome deve ter ao menos 2 caracteres')
  .max(120, 'Nome muito longo');

const descriptionSchema = z
  .string()
  .trim()
  .max(2000, 'Descrição muito longa')
  .nullable()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : null));

const categorySchema = z
  .string()
  .trim()
  .max(80, 'Categoria muito longa')
  .nullable()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : null));

const imageUrlSchema = z
  .string()
  .trim()
  .url('URL de imagem inválida')
  .max(500, 'URL muito longa')
  .nullable()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : null));

// duration_minutes > 0 (CHECK constraint)
const durationSchema = z
  .number()
  .int('Duração deve ser inteiro')
  .positive('Duração deve ser maior que zero')
  .max(1440, 'Duração máxima é 1440 minutos (24h)');

// price >= 0 (CHECK constraint) — numeric(10,2)
const priceSchema = z
  .number()
  .nonnegative('Preço não pode ser negativo')
  .max(99999999.99, 'Preço acima do limite')
  .refine(
    (v) => Number.isFinite(v) && Math.round(v * 100) === v * 100,
    'Preço deve ter no máximo 2 casas decimais',
  );

const displayOrderSchema = z
  .number()
  .int('Ordem deve ser inteiro')
  .min(0, 'Ordem não pode ser negativa')
  .max(99999, 'Ordem acima do limite')
  .optional();

// --------------------------------------------
// CREATE INPUT
// --------------------------------------------
export const createServiceInputSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  category: categorySchema,
  price: priceSchema,
  durationMinutes: durationSchema,
  imageUrl: imageUrlSchema,
  isActive: z.boolean().optional().default(true),
  displayOrder: displayOrderSchema,
});

export type CreateServiceInput = z.infer<typeof createServiceInputSchema>;

// --------------------------------------------
// UPDATE INPUT (id obrigatório + patch parcial)
// --------------------------------------------
export const updateServiceInputSchema = z.object({
  id: z.string().uuid('ID inválido'),
  patch: z
    .object({
      name: nameSchema.optional(),
      description: descriptionSchema,
      category: categorySchema,
      price: priceSchema.optional(),
      durationMinutes: durationSchema.optional(),
      imageUrl: imageUrlSchema,
      isActive: z.boolean().optional(),
      displayOrder: displayOrderSchema,
    })
    .refine((p) => Object.keys(p).length > 0, {
      message: 'Nenhum campo para atualizar',
    }),
});

export type UpdateServiceInput = z.infer<typeof updateServiceInputSchema>;

// --------------------------------------------
// TOGGLE INPUT
// --------------------------------------------
export const toggleServiceActiveInputSchema = z.object({
  id: z.string().uuid('ID inválido'),
  isActive: z.boolean(),
});

export type ToggleServiceActiveInput = z.infer<
  typeof toggleServiceActiveInputSchema
>;

// --------------------------------------------
// PG ERROR MAPPER
// --------------------------------------------
type PgLikeError = { code?: string; message?: string };

export function mapPgError(err: PgLikeError | null | undefined): string {
  if (!err) return 'Erro desconhecido';
  switch (err.code) {
    case '23505':
      return 'Já existe um serviço com esses dados';
    case '23514':
      return 'Dados violam regra do banco (preço ou duração inválidos)';
    case '42501':
      return 'Sem permissão para esta operação';
    case 'PGRST116':
      return 'Serviço não encontrado';
    default:
      return err.message ?? 'Erro ao processar requisição';
  }
}
