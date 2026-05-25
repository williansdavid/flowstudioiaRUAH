/**
 * Types compartilhados da feature "services".
 *
 * Re-exportamos tipos das server functions para que componentes
 * não precisem importar de @/server/* (server-only).
 */

export type { AdminServiceItem } from '@/server/services/_shared';
export type {
  CreateServiceInput,
  UpdateServiceInput,
  ToggleServiceActiveInput,
} from '@/server/services/_shared';

/**
 * Filtro de status pra UI.
 */
export type ServiceStatusFilter = 'all' | 'active' | 'inactive';

/**
 * Estado consolidado dos filtros da página de serviços.
 *
 * `category` é dinâmico (vem dos dados) — string vazia = "todas".
 */
export type ServiceFilters = {
  search: string;
  status: ServiceStatusFilter;
  category: string;
};

export const DEFAULT_SERVICE_FILTERS: ServiceFilters = {
  search: '',
  status: 'all',
  category: '',
};
