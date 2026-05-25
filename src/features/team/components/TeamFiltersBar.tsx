import { Search } from 'lucide-react';
import { Input } from '@/components/ui';
import type {
  TeamFilters,
  TeamMemberRoleFilter,
  TeamMemberStatusFilter,
} from '../types';

interface TeamFiltersBarProps {
  filters: TeamFilters;
  onChange: (filters: TeamFilters) => void;
}

export function TeamFiltersBar({ filters, onChange }: TeamFiltersBarProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      {/* Busca */}
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Buscar por nome ou email..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="pl-9"
          aria-label="Buscar membros"
        />
      </div>

      {/* Status */}
      <select
        value={filters.status}
        onChange={(e) =>
          onChange({
            ...filters,
            status: e.target.value as TeamMemberStatusFilter,
          })
        }
        className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
        aria-label="Filtrar por status"
      >
        <option value="all">Todos os status</option>
        <option value="active">Ativos</option>
        <option value="inactive">Inativos</option>
      </select>

      {/* Role */}
      <select
        value={filters.role}
        onChange={(e) =>
          onChange({
            ...filters,
            role: e.target.value as TeamMemberRoleFilter,
          })
        }
        className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
        aria-label="Filtrar por função"
      >
        <option value="all">Todas as funções</option>
        <option value="admin">Administradores</option>
        <option value="staff">Profissionais</option>
      </select>
    </div>
  );
}
