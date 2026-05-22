/**
 * Tipos públicos compartilhados entre client e server.
 * Arquivo puro — sem imports, sem side effects.
 */

export type AppRole = 'admin' | 'staff' | 'client';

export type SessionUser = {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: AppRole | null;
  isActive: boolean;
};
