/**
 * Types compartilhados da feature "clients".
 *
 * Re-exportamos tipos e schemas das server functions para que componentes
 * client-side validem inline com a mesma fonte de verdade do server.
 *
 * IMPORTANTE: _shared.ts contém apenas Zod + tipos puros (bundle-safe).
 */

export type {
  AdminClientItem,
  ClientOrigin,
  CreateClientInput,
  UpdateClientInput,
} from '@/server/clients/_shared';

export {
  createClientInputSchema,
  updateClientInputSchema,
} from '@/server/clients/_shared';

/**
 * Filtro de origem pra UI (lista de clientes).
 */
export type ClientOriginFilter = 'all' | 'account' | 'walkin';

/**
 * Estado consolidado dos filtros da página de clientes.
 */
export type ClientFilters = {
  search: string;
  origin: ClientOriginFilter;
};

export const DEFAULT_CLIENT_FILTERS: ClientFilters = {
  search: '',
  origin: 'all',
};
