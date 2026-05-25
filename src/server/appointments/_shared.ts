/**
 * ============================================
 * Appointments — server shared
 * ============================================
 *
 * Helpers locais das server functions de "appointments".
 *
 * Para guards genericos (requireServerPermission), use:
 *   import { requireServerPermission } from "@/lib/auth/server-guards";
 *
 * Estrategia de leitura:
 *  - JOIN inline via PostgREST embedando clients_view, staff, services.
 *  - Sem view dedicada por enquanto (mantemos MVP simples).
 *  - RLS ja garante isolamento (admin ve tudo, staff ve proprios).
 *
 * Estrategia de escrita (create):
 *  - Input minimo do client: clientId, staffId, serviceId, startsAt, status?, price?, notes?
 *  - endsAt calculado no server a partir de services.duration_minutes
 *  - price default = services.price (override opcional via input)
 *  - status default = "confirmed" (admin cria ja confirmado)
 *  - Conflito de horario tratado via constraint EXCLUDE (isOverlapError)
 */

import { z } from "zod";
import type { Tables } from "@/lib/supabase/types";

// --------------------------------------------
// PG: codigo SQLSTATE da constraint EXCLUDE
// --------------------------------------------
/**
 * Codigo SQLSTATE do Postgres pra violacao de constraint EXCLUDE.
 * Disparado pela constraint `no_overlap_per_staff` quando ha sobreposicao
 * de horario pro mesmo profissional.
 *
 * Ref: https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
export const PG_EXCLUSION_VIOLATION = "23P01";

/**
 * Detecta se um erro do Supabase e violacao da constraint de sobreposicao.
 */
export function isOverlapError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; message?: string };
  if (err.code === PG_EXCLUSION_VIOLATION) return true;
  if (err.message?.includes("no_overlap_per_staff")) return true;
  if (err.message?.toLowerCase().includes("exclusion constraint")) return true;
  return false;
}

/**
 * Mensagem amigavel pra erro de conflito de horario.
 */
export const OVERLAP_ERROR_MESSAGE =
  "Ja existe um agendamento neste horario para este profissional. Escolha outro horario.";

// --------------------------------------------
// PG ERROR MAPPER
// --------------------------------------------
type PgLikeError = { code?: string; message?: string };

export function mapPgError(err: PgLikeError | null | undefined): string {
  if (!err) return "Erro desconhecido";
  if (isOverlapError(err)) return OVERLAP_ERROR_MESSAGE;
  switch (err.code) {
    case "23505":
      return "Registro duplicado";
    case "23514":
      return "Dados violam regra do banco";
    case "23503":
      return "Referencia invalida (cliente, staff ou servico inexistente)";
    case "42501":
      return "Sem permissao para esta operacao";
    case "PGRST116":
      return "Agendamento nao encontrado";
    default:
      return err.message ?? "Erro ao processar requisicao";
  }
}

// --------------------------------------------
// ROW shape — resultado bruto do join PostgREST
// --------------------------------------------
type AppointmentRow = Pick<
  Tables<"appointments">,
  | "id"
  | "client_id"
  | "staff_id"
  | "service_id"
  | "starts_at"
  | "ends_at"
  | "status"
  | "price"
  | "notes"
  | "cancelled_at"
  | "cancelled_reason"
  | "created_at"
  | "updated_at"
>;

type ClientEmbed = Pick<
  Tables<"clients_view">,
  "id" | "display_name" | "display_phone" | "origin"
>;

type StaffEmbed = {
  id: string;
  profiles: { id: string; full_name: string | null } | null;
};

type ServiceEmbed = Pick<
  Tables<"services">,
  "id" | "name" | "duration_minutes"
>;

/**
 * Linha como vem do Supabase apos o join.
 * Os nomes dos relacionamentos (client_ref, staff_ref, service_ref) vem do alias
 * que damos no select abaixo.
 */
export interface AppointmentJoinedRow extends AppointmentRow {
  client_ref: ClientEmbed | null;
  staff_ref: StaffEmbed | null;
  service_ref: ServiceEmbed | null;
}

// --------------------------------------------
// SELECT statement — usado em todas as queries de leitura
// --------------------------------------------
/**
 * Select statement para PostgREST com joins embedados.
 *
 * Aliases:
 *  - client_ref   -> clients_view (display_name consolidado)
 *  - staff_ref    -> staff + profiles (full_name)
 *  - service_ref  -> services (name, duration_minutes)
 *
 * As FKs sao resolvidas automaticamente pelo PostgREST via foreign keys reais.
 */
export const APPOINTMENT_SELECT = `
  id,
  client_id,
  staff_id,
  service_id,
  starts_at,
  ends_at,
  status,
  price,
  notes,
  cancelled_at,
  cancelled_reason,
  created_at,
  updated_at,
  client_ref:clients_view!appointments_client_id_fkey(id, display_name, display_phone, origin),
  staff_ref:staff!appointments_staff_id_fkey(id, profiles(id, full_name)),
  service_ref:services!appointments_service_id_fkey(id, name, duration_minutes)
` as const;

// --------------------------------------------
// MAPPER — Row -> AdminAppointmentItem
// --------------------------------------------
import type { AdminAppointmentItem } from "@/features/appointments/types";

export function mapAppointmentRow(row: AppointmentJoinedRow): AdminAppointmentItem {
  const client = row.client_ref;
  const staff = row.staff_ref;
  const service = row.service_ref;

  return {
    id: row.id,
    clientId: row.client_id,
    staffId: row.staff_id,
    serviceId: row.service_id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    price: Number(row.price ?? 0),
    notes: row.notes,
    cancelledAt: row.cancelled_at,
    cancelledReason: row.cancelled_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,

    clientName: client?.display_name ?? "Cliente removido",
    clientPhone: client?.display_phone ?? null,
    clientOrigin: (client?.origin ?? "walkin") as "account" | "walkin",

    staffName: staff?.profiles?.full_name ?? "Profissional removido",

    serviceName: service?.name ?? "Servico removido",
    serviceDurationMinutes: service?.duration_minutes ?? 0,
  };
}

// ============================================================
// ZOD HELPERS — padrao do projeto (igual clients/_shared.ts)
// ============================================================

/**
 * Converte ZodError em mensagem legivel p/ UI.
 * Pega a PRIMEIRA mensagem de erro (mais relevante pro usuario).
 */
export function formatZodError(err: z.ZodError): string {
  const first = err.issues[0];
  if (!first) return "Dados invalidos";
  const field = first.path.length > 0 ? `${first.path.join(".")}: ` : "";
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

// ============================================================
// SCHEMAS — create input
// ============================================================

const uuidSchema = z.string().uuid("ID invalido");

/**
 * ISO 8601 com timezone (ex: "2026-05-25T14:30:00-03:00" ou "...Z").
 * Aceita tanto o formato do <input type="datetime-local"> apos conversao
 * quanto o formato gerado por new Date().toISOString().
 */
const startsAtSchema = z
  .string()
  .trim()
  .min(1, "Data e hora sao obrigatorias")
  .refine(
    (v) => {
      const d = new Date(v);
      return !Number.isNaN(d.getTime());
    },
    { message: "Data/hora invalida" },
  )
  .refine(
    (v) => {
      // Nao permite agendamento no passado (com tolerancia de 5 min)
      const d = new Date(v).getTime();
      const now = Date.now() - 5 * 60 * 1000;
      return d >= now;
    },
    { message: "Nao e possivel agendar no passado" },
  );

const statusCreateSchema = z
  .enum(["pending", "confirmed"], {
    errorMap: () => ({ message: "Status invalido (use pending ou confirmed)" }),
  })
  .optional()
  .default("confirmed");

const priceOverrideSchema = z
  .number()
  .nonnegative("Preco nao pode ser negativo")
  .max(99999999.99, "Preco acima do limite")
  .refine(
    (v) => Number.isFinite(v) && Math.round(v * 100) === v * 100,
    "Preco deve ter no maximo 2 casas decimais",
  )
  .nullable()
  .optional();

const notesSchema = z
  .string()
  .trim()
  .max(2000, "Anotacoes muito longas")
  .nullable()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : null));

/**
 * CREATE INPUT — agendamento criado pelo admin.
 *
 * Campos derivados no server (NAO vem do client):
 *  - endsAt   -> calculado de services.duration_minutes
 *  - price    -> default de services.price (se priceOverride nao vier)
 *
 * Default:
 *  - status = "confirmed" (admin cria ja confirmado)
 */
export const createAppointmentInputSchema = z.object({
  clientId: uuidSchema,
  staffId: uuidSchema,
  serviceId: uuidSchema,
  startsAt: startsAtSchema,
  status: statusCreateSchema,
  priceOverride: priceOverrideSchema,
  notes: notesSchema,
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentInputSchema>;
