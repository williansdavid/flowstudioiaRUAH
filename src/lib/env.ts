import { z } from 'zod';

/**
 * ============================================
 * Environment Variables — Type-safe & Validated
 * ============================================
 *
 * Fonte unica de verdade para variaveis de AMBIENTE/INFRA.
 * Falha rapida no startup se algo critico estiver faltando.
 *
 * IMPORTANTE:
 *   Identidade do studio (nome, slogan, cores, logo, endereco)
 *   NAO vive aqui. Vive em src/sites/<studio>/config/.
 *   Aqui ficam SO secrets e infra (Supabase, Evolution, OpenAI...).
 *
 * Convencoes:
 *   - VITE_*  -> exposto ao client (publico, seguro)
 *   - Demais  -> server-only (secreto, nunca vai pro bundle)
 */

// --------------------------------------------
// Helpers
// --------------------------------------------

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === '' ? undefined : v));

// --------------------------------------------
// Schema CLIENT (publico — import.meta.env)
// --------------------------------------------
const clientSchema = z.object({
  // ---- Supabase ----
  VITE_SUPABASE_URL: z
    .string()
    .url('VITE_SUPABASE_URL deve ser uma URL valida'),

  VITE_SUPABASE_ANON_KEY: z
    .string()
    .min(20, 'VITE_SUPABASE_ANON_KEY parece invalida'),

  // ---- App ----
  VITE_APP_URL: z
    .string()
    .url('VITE_APP_URL deve ser uma URL valida')
    .default('http://localhost:3000'),
});

// --------------------------------------------
// Schema SERVER (secreto — process.env)
// --------------------------------------------
const serverSchema = z.object({
  // ---- Supabase ----
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(20, 'SUPABASE_SERVICE_ROLE_KEY e obrigatoria no server'),

  // ---- Evolution API (WhatsApp) ----
  EVOLUTION_API_URL: z.string().url().optional().or(z.literal('')),
  EVOLUTION_API_KEY: optionalString,
  EVOLUTION_INSTANCE_NAME: optionalString,
  EVOLUTION_WEBHOOK_SECRET: optionalString,

  // ---- IA ----
  OPENAI_API_KEY: optionalString,
  AI_MODEL: z.string().default('gpt-4o-mini'),

  // ---- Seguranca ----
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
  VITE_APP_URL: import.meta.env.VITE_APP_URL,
};

const clientParsed = clientSchema.safeParse(rawClient);

if (!clientParsed.success) {
  console.error(
    '[env] Variaveis CLIENT invalidas:',
    clientParsed.error.flatten().fieldErrors,
  );
  throw new Error(
    'Falha na validacao das env vars do client. Verifique seu .env',
  );
}

// Log apenas em dev, no client, uma unica vez
if (import.meta.env.DEV && typeof window !== 'undefined') {
  console.log(
    '%c[env] FlowStudio env carregada',
    'color:#10b981;font-weight:bold',
    {
      supabase: clientParsed.data.VITE_SUPABASE_URL,
      app: clientParsed.data.VITE_APP_URL,
    },
  );
}

// --------------------------------------------
// Parse SERVER (lazy — so quando chamado)
// --------------------------------------------

let _serverCache: z.infer<typeof serverSchema> | null = null;

function parseServerEnv() {
  if (_serverCache) return _serverCache;

  if (typeof process === 'undefined' || !process.env) {
    throw new Error(
      '[env] serverEnv so pode ser acessado em contexto server-side.',
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
      '[env] Variaveis SERVER invalidas:',
      parsed.error.flatten().fieldErrors,
    );
    throw new Error('Falha na validacao das env vars do server.');
  }

  _serverCache = parsed.data;
  return _serverCache;
}

// --------------------------------------------
// Exports
// --------------------------------------------

/**
 * Env publica — disponivel em client e server.
 *
 * @example
 * import { env } from '@/lib/env';
 * const url = env.VITE_SUPABASE_URL;
 */
export const env = clientParsed.data;

/**
 * Env secreta — APENAS server-side.
 * Lazy-loaded para nao crashar no browser.
 *
 * @example
 * import { serverEnv } from '@/lib/env';
 * const key = serverEnv().SUPABASE_SERVICE_ROLE_KEY;
 */
export const serverEnv = parseServerEnv;

export type ClientEnv = z.infer<typeof clientSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;
