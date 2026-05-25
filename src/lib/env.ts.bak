import { z } from 'zod';

/**
 * ============================================
 * Environment Variables — Type-safe & Validated
 * ============================================
 *
 * Fonte única de verdade para variáveis de ambiente.
 * Falha rápido no startup se algo crítico estiver faltando.
 *
 * Convenções:
 * - VITE_*  → exposto ao client (público, seguro)
 * - Demais  → server-only (secreto, nunca vai pro bundle)
 */

// --------------------------------------------
// Helpers
// --------------------------------------------

const optionalString = z.string().trim().min(1).optional();
const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Cor deve ser hex #RRGGBB');

// --------------------------------------------
// Schema CLIENT (público — import.meta.env)
// --------------------------------------------
const clientSchema = z.object({
  // ---- Supabase ----
  VITE_SUPABASE_URL: z
    .string()
    .url('VITE_SUPABASE_URL deve ser uma URL válida'),

  VITE_SUPABASE_ANON_KEY: z
    .string()
    .min(20, 'VITE_SUPABASE_ANON_KEY parece inválida'),

  // ---- Studio identity ----
  VITE_STUDIO_SLUG: z
    .string()
    .min(1, 'VITE_STUDIO_SLUG é obrigatório')
    .regex(/^[a-z0-9-]+$/, 'VITE_STUDIO_SLUG deve ser slug (a-z, 0-9, -)'),

  VITE_STUDIO_NAME: z.string().min(1, 'VITE_STUDIO_NAME é obrigatório'),

  VITE_STUDIO_SLOGAN: optionalString,
  VITE_STUDIO_DESCRIPTION: optionalString,

  // ---- Contatos ----
  VITE_STUDIO_PHONE: optionalString,
  VITE_STUDIO_WHATSAPP: optionalString,
  VITE_STUDIO_INSTAGRAM: optionalString,
  VITE_STUDIO_EMAIL: z.string().email().optional().or(z.literal('')),

  // ---- Endereço ----
  VITE_STUDIO_ADDRESS: optionalString,
  VITE_STUDIO_CITY: optionalString,
  VITE_STUDIO_STATE: optionalString,
  VITE_STUDIO_ZIP: optionalString,

  // ---- Identidade visual ----
  VITE_STUDIO_PRIMARY_COLOR: hexColor.optional(),
  VITE_STUDIO_LOGO_URL: optionalString,
  VITE_STUDIO_OG_IMAGE: optionalString,
  VITE_STUDIO_HERO_IMAGE: optionalString,

  // ---- App ----
  VITE_APP_URL: z
    .string()
    .url('VITE_APP_URL deve ser uma URL válida')
    .default('http://localhost:3000'),
});

// --------------------------------------------
// Schema SERVER (secreto — process.env)
// --------------------------------------------
const serverSchema = z.object({
  // ---- Supabase ----
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(20, 'SUPABASE_SERVICE_ROLE_KEY é obrigatória no server'),

  // ---- Evolution API (WhatsApp) ----
  EVOLUTION_API_URL: z.string().url().optional().or(z.literal('')),
  EVOLUTION_API_KEY: optionalString,
  EVOLUTION_INSTANCE_NAME: optionalString,
  EVOLUTION_WEBHOOK_SECRET: optionalString,

  // ---- IA ----
  OPENAI_API_KEY: optionalString,
  AI_MODEL: z.string().default('gpt-4o-mini'),

  // ---- Segurança ----
  RATE_LIMIT_PUBLIC_PER_MINUTE: z.coerce.number().int().positive().default(10),

  // ---- Runtime ----
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

// --------------------------------------------
// Parse CLIENT (executa imediatamente)
// --------------------------------------------

const rawClient = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  VITE_STUDIO_SLUG: import.meta.env.VITE_STUDIO_SLUG,
  VITE_STUDIO_NAME: import.meta.env.VITE_STUDIO_NAME,
  VITE_STUDIO_SLOGAN: import.meta.env.VITE_STUDIO_SLOGAN,
  VITE_STUDIO_DESCRIPTION: import.meta.env.VITE_STUDIO_DESCRIPTION,
  VITE_STUDIO_PHONE: import.meta.env.VITE_STUDIO_PHONE,
  VITE_STUDIO_WHATSAPP: import.meta.env.VITE_STUDIO_WHATSAPP,
  VITE_STUDIO_INSTAGRAM: import.meta.env.VITE_STUDIO_INSTAGRAM,
  VITE_STUDIO_EMAIL: import.meta.env.VITE_STUDIO_EMAIL,
  VITE_STUDIO_ADDRESS: import.meta.env.VITE_STUDIO_ADDRESS,
  VITE_STUDIO_CITY: import.meta.env.VITE_STUDIO_CITY,
  VITE_STUDIO_STATE: import.meta.env.VITE_STUDIO_STATE,
  VITE_STUDIO_ZIP: import.meta.env.VITE_STUDIO_ZIP,
  VITE_STUDIO_PRIMARY_COLOR: import.meta.env.VITE_STUDIO_PRIMARY_COLOR,
  VITE_STUDIO_LOGO_URL: import.meta.env.VITE_STUDIO_LOGO_URL,
  VITE_STUDIO_OG_IMAGE: import.meta.env.VITE_STUDIO_OG_IMAGE,
  VITE_STUDIO_HERO_IMAGE: import.meta.env.VITE_STUDIO_HERO_IMAGE,
  VITE_APP_URL: import.meta.env.VITE_APP_URL,
};

const clientParsed = clientSchema.safeParse(rawClient);

if (!clientParsed.success) {
  console.error(
    '❌ [env] Variáveis CLIENT inválidas:',
    clientParsed.error.flatten().fieldErrors,
  );
  throw new Error(
    'Falha na validação das env vars do client. Verifique seu .env',
  );
}

// Log apenas em dev, no client, uma única vez
if (import.meta.env.DEV && typeof window !== 'undefined') {
  console.log(
    '%c✅ FlowStudio env carregada',
    'color:#10b981;font-weight:bold',
    {
      studio: clientParsed.data.VITE_STUDIO_NAME,
      slug: clientParsed.data.VITE_STUDIO_SLUG,
      supabase: clientParsed.data.VITE_SUPABASE_URL,
    },
  );
}

// --------------------------------------------
// Parse SERVER (lazy — só quando chamado)
// --------------------------------------------

let _serverCache: z.infer<typeof serverSchema> | null = null;

function parseServerEnv() {
  if (_serverCache) return _serverCache;

  if (typeof process === 'undefined' || !process.env) {
    throw new Error(
      '[env] serverEnv só pode ser acessado em contexto server-side.',
    );
  }

  const parsed = serverSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    EVOLUTION_API_URL: process.env.EVOLUTION_API_URL,
    EVOLUTION_API_KEY: process.env.EVOLUTION_API_KEY,
    EVOLUTION_INSTANCE_NAME: process.env.EVOLUTION_INSTANCE_NAME,
    EVOLUTION_WEBHOOK_SECRET: process.env.EVOLUTION_WEBHOOK_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    AI_MODEL: process.env.AI_MODEL,
    RATE_LIMIT_PUBLIC_PER_MINUTE: process.env.RATE_LIMIT_PUBLIC_PER_MINUTE,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!parsed.success) {
    console.error(
      '❌ [env] Variáveis SERVER inválidas:',
      parsed.error.flatten().fieldErrors,
    );
    throw new Error('Falha na validação das env vars do server.');
  }

  _serverCache = parsed.data;
  return _serverCache;
}

// --------------------------------------------
// Exports
// --------------------------------------------

/**
 * Env pública — disponível em client e server.
 *
 * @example
 * import { env } from '@/lib/env';
 * const studioName = env.VITE_STUDIO_NAME;
 */
export const env = clientParsed.data;

/**
 * Env secreta — APENAS server-side.
 * Lazy-loaded para não crashar no browser.
 *
 * @example
 * import { serverEnv } from '@/lib/env';
 * const key = serverEnv().SUPABASE_SERVICE_ROLE_KEY;
 */
export const serverEnv = parseServerEnv;

export type ClientEnv = z.infer<typeof clientSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;
