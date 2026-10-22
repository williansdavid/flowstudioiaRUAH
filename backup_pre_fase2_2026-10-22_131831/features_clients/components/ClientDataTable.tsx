// src/features/clients/components/ClientDataTable.tsx
import { useState, useMemo } from 'react'
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CalendarCheck,
  Star,
  UserPlus,
  UserX,
  Phone,
  Sparkles,
  RotateCcw,
  Clock,
  List,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/features/utils/ui/Button'
import { useClientsList } from '../hooks'
import type { ClientListItem } from '../types'
import { BirthdaySection } from './sections/BirthdaySection'
import { NoReturnSection } from './sections/NoReturnSection'

/* ───────── Helpers ───────── */

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0]![0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1]![0] ?? '' : ''
  return (first + last).toUpperCase()
}

function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, '').replace(/^55/, '')
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return phone
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function daysAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'Hoje'
  if (diff === 1) return 'Ontem'
  return `há ${diff} dias`
}

function daysFromNow(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return 'Atrasado'
  if (diff === 0) return 'Hoje'
  if (diff === 1) return 'Amanhã'
  return `daqui ${diff} dias`
}

/* ───────── Filter config ───────── */

type FilterKey =
  | 'all'
  | 'vip'
  | 'new'
  | 'neverReturned'
  | 'birthday'
  | 'inactive'
  | 'hasAppointment'
  | 'noPhone'
  | 'lastCadastre'

interface FilterOption {
  key: FilterKey
  label: string
  icon: React.ReactNode
}

const FILTERS: FilterOption[] = [
  { key: 'all', label: 'Todos', icon: <List className="h-5 w-5" /> },
  { key: 'vip', label: 'VIP', icon: <Star className="h-5 w-5" /> },
  { key: 'new', label: 'Novos', icon: <UserPlus className="h-5 w-5" /> },
  { key: 'neverReturned', label: 'Não voltaram', icon: <RotateCcw className="h-5 w-5" /> },
  { key: 'birthday', label: 'Aniversariantes', icon: <Sparkles className="h-5 w-5" /> },
  { key: 'inactive', label: 'Inativos', icon: <UserX className="h-5 w-5" /> },
  { key: 'hasAppointment', label: 'Com agendamento', icon: <CalendarCheck className="h-5 w-5" /> },
  { key: 'noPhone', label: 'Sem telefone', icon: <Phone className="h-5 w-5" /> },
  { key: 'lastCadastre', label: 'Últimos cadastros', icon: <Clock className="h-5 w-5" /> },
]

/* ───────── Interfaces ───────── */

export interface ClientDataTableProps {
  onSelectClient?: (clientId: string) => void
  onCreate?: () => void
}

/* ───────── Skeleton ───────── */

function ClientCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-700/30 bg-slate-800/40 p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-slate-700/50" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded bg-slate-700/50" />
          <div className="h-3 w-1/2 rounded bg-slate-700/30" />
        </div>
      </div>
    </div>
  )
}

/* ───────── Card do cliente ───────── */

function ClientCard({
  client,
  onSelect,
}: {
  client: ClientListItem
  onSelect?: (id: string) => void
}) {
  const isVip = (client.total_spent ?? 0) > 1000 || (client.total_visits ?? 0) >= 20
  const isInactive = client.status === 'inactive'
  const isNew = client.status === 'new'

  function getStatusBadge(): { label: string; className: string } | null {
    if (isVip)
      return {
        label: 'VIP',
        className: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
      }
    if (isInactive)
      return {
        label: 'Inativo',
        className: 'bg-red-500/10 text-red-400 border-red-500/20',
      }
    if (isNew)
      return {
        label: 'Novo',
        className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      }
    if (client.status === 'active')
      return {
        label: 'Ativo',
        className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      }
    return null
  }

  const badge = getStatusBadge()

  return (
    <button
      type="button"
      onClick={() => onSelect?.(client.id)}
      className="group w-full rounded-2xl border border-slate-700/30 bg-slate-800/40 p-4 text-left transition hover:border-slate-600/40 hover:bg-slate-800/60 active:scale-[0.99]"
    >
      {/* Linha superior: avatar + nome + badge */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-700/40 text-xs font-bold text-slate-400">
          {initials(client.name ?? '?')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-slate-200">
              {client.name ?? 'Sem nome'}
            </span>
            {client.has_appointment && (
              <CalendarCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
            )}
            {client.rank > 0 && (
              <span className="shrink-0 text-[10px] font-medium text-slate-500">
                #{client.rank}
              </span>
            )}
          </div>
          {client.phone && (
            <span className="text-xs text-slate-400">{formatPhone(client.phone)}</span>
          )}
        </div>
        {/* Badge */}
        {badge && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase',
              badge.className,
            )}
          >
            {isVip && <Star className="h-3 w-3" />}
            {badge.label}
          </span>
        )}
      </div>

      {/* Grid de métricas */}
      <div className="mt-3 grid grid-cols-4 gap-2 border-t border-slate-700/20 pt-3">
        <div className="text-center">
          <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Última visita
          </div>
          <div className="mt-0.5 text-xs text-slate-300">
            {client.last_visit ? daysAgo(client.last_visit) : 'Nunca'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Próxima
          </div>
          <div className="mt-0.5 text-xs text-slate-300">
            {client.next_visit_estimated
              ? daysFromNow(client.next_visit_estimated)
              : '—'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Total gasto
          </div>
          <div className="mt-0.5 text-xs text-slate-300">
            {client.total_spent != null ? formatCurrency(client.total_spent) : '—'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Frequência
          </div>
          <div className="mt-0.5 text-xs text-slate-300">
            {client.frequency_days != null ? `${client.frequency_days} dias` : '—'}
          </div>
        </div>
      </div>
    </button>
  )
}

/* ───────── Empty state ───────── */

function EmptyState({ search, onCreate }: { search: string; onCreate?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-800/60">
        <Search className="h-6 w-6 text-slate-500" />
      </div>
      <h3 className="text-sm font-semibold text-slate-300">
        {search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
      </h3>
      <p className="mt-1 text-xs text-slate-500">
        {search ? 'Tente ajustar a busca ou os filtros.' : 'Cadastre seu primeiro cliente para começar.'}
      </p>
      {!search && onCreate && (
        <Button variant="primary" size="sm" className="mt-4" onClick={onCreate}>
          Novo cliente
        </Button>
      )}
    </div>
  )
}

/* ───────── Error state ───────── */

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
        <AlertTriangle className="h-6 w-6 text-red-400" />
      </div>
      <h3 className="text-sm font-semibold text-slate-300">Erro ao carregar clientes</h3>
      <p className="mt-1 text-xs text-slate-500">
        Não foi possível buscar os dados. Tente novamente.
      </p>
      <Button variant="primary" size="sm" className="mt-4" onClick={onRetry}>
        Tentar novamente
      </Button>
    </div>
  )
}

/* ════════════════════════ COMPONENTE PRINCIPAL ════════════════════════ */

export function ClientDataTable({
  onSelectClient,
  onCreate,
}: ClientDataTableProps) {
  /* ─── Estados locais ─── */
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [sortBy, setSortBy] = useState<
    'name' | 'last_visit' | 'total_spent' | 'frequency_days'
  >('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const pageSize = 20

  /* ─── Construir params da query ─── */
  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page,
      pageSize,
      sortBy,
      sortOrder,
    }
    if (search.trim()) params.search = search.trim()

    switch (activeFilter) {
      case 'vip':
        params.status = 'vip'
        break
      case 'new':
        params.status = 'new'
        break
      case 'neverReturned':
        params.neverReturned = true
        break
      case 'inactive':
        params.status = 'inactive'
        break
      case 'hasAppointment':
        params.hasAppointment = true
        break
      case 'noPhone':
        params.noPhone = true
        break
      case 'lastCadastre':
        params.lastCadastre = true
        break
      case 'birthday':
        params.birthdayMonth = new Date().getMonth() + 1
        break
    }

    return params as Record<string, string | number | boolean>
  }, [search, activeFilter, sortBy, sortOrder, page])

  const { data, isLoading, isError, refetch } = useClientsList(queryParams as any)

  /* ─── Sort toggle ─── */
  function toggleSort(
    field: 'name' | 'last_visit' | 'total_spent' | 'frequency_days',
  ) {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  /* ─── Troca de filtro reseta página e busca ─── */
  function handleFilterChange(key: FilterKey) {
    setSearch('')
    setActiveFilter(key)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ─── Campo de busca ─── */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="Buscar por nome, telefone, CPF ou email..."
          className="w-full rounded-xl border border-slate-700/30 bg-slate-800/60 py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition focus:border-violet-500/50 focus:bg-slate-800/80"
        />
      </div>

      {/* ─── Filtros rápidos (mini-cards) ─── */}
      <div className="grid grid-cols-5 gap-2">
        {FILTERS.map((filter) => {
          const active = activeFilter === filter.key
          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => handleFilterChange(filter.key)}
              className={cn(
                 'flex h-14 flex-col items-center justify-center gap-0.5 rounded-xl border text-center transition',
                'text-[10px] font-medium leading-tight',
                active
                  ? 'border-violet-500/25 bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/20'
                  : 'border-slate-700/30 bg-slate-800/30 text-slate-400 hover:border-slate-600/40 hover:text-slate-300',
              )}
            >
              <span className="[&>svg]:h-4 [&>svg]:w-4">{filter.icon}</span>
              <span>{filter.label}</span>
            </button>
          )
        })}
      </div>

      {/* ─── Ordenação ─── */}
      <div className="rounded-xl border border-slate-700/30 bg-slate-800/30 px-1 py-2.5">
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Ordenar por:
          </span>   
        </div>       
        {(
          [
            { key: 'name' as const, label: 'Nome' },
            { key: 'last_visit' as const, label: 'Última visita' },
            { key: 'total_spent' as const, label: 'Total gasto' },
            { key: 'frequency_days' as const, label: 'Frequência' },
          ] as const
        ).map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => toggleSort(opt.key)}
            className={cn(
              'inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition',
              sortBy === opt.key
                ? 'bg-violet-500/15 text-violet-300'
                : 'text-slate-500 hover:text-slate-300',
            )}
          >
            {opt.label}
            {sortBy === opt.key && (
              <ChevronDown
                className={cn(
                  'h-3 w-3 transition-transform',
                  sortOrder === 'desc' && 'rotate-180',
                )}
              />
            )}
          </button>
        ))}
      </div>

      {/* ─── Conteúdo ─── */}
      {activeFilter === 'birthday' ? (
        <BirthdaySection />
      ) : activeFilter === 'neverReturned' ? (
        <NoReturnSection />
      ) : isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ClientCardSkeleton key={i} />
          ))}
        </div>
      ) : isError && !isLoading ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !isLoading && !isError && (data?.clients?.length ?? 0) === 0 ? (
        <EmptyState search={search} onCreate={onCreate} />
      ) : !isLoading && !isError && (data?.clients?.length ?? 0) > 0 ? (
        <>
          <div className="flex flex-col gap-3">
            {data!.clients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onSelect={onSelectClient}
              />
            ))}
          </div>

          {/* Paginação */}
          {(data?.totalPages ?? 1) > 1 && (
            <div className="flex items-center justify-center gap-4 py-3 text-xs text-slate-400">
              <span>
                Página {data!.page} de {data!.totalPages} {' · '} {data!.total}{' '}
                clientes
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-700/40 hover:text-slate-200 disabled:pointer-events-none disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={page >= (data?.totalPages ?? 1)}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-700/40 hover:text-slate-200 disabled:pointer-events-none disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}