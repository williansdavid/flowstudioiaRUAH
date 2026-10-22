// src/features/clients/components/sections/NoReturnSection.tsx
'use client'

import { AlertTriangle, RotateCcw } from 'lucide-react'
import { useNoReturnClients } from '../../hooks'
import { buildWaLink } from '../../config/whatsappTemplates'
import type { NoReturnClient } from '../../server/getNoReturnClients'

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

function daysAgo(dateStr: string | null): string {
  if (!dateStr) return '—'
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'Hoje'
  if (diff === 1) return 'Ontem'
  return `há ${diff} dias`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

/* ───────── Card ───────── */
interface NoReturnCardProps {
  client: NoReturnClient
  onSelect?: (id: string) => void
}

function NoReturnCard({ client, onSelect }: NoReturnCardProps) {
  const waLink = client.phone
    ? buildWaLink(client.phone, 'noReturn', { name: client.name ?? 'tudo bem' })
    : null

  return (
    <div
      onClick={() => onSelect?.(client.id)}
      className="group flex flex-col gap-3 rounded-2xl border border-slate-700/30 bg-gradient-to-b from-slate-800/50 to-slate-800/30 p-4 transition hover:border-rose-500/30 hover:bg-slate-800/60 active:scale-[0.99]"
    >
      {/* Avatar + Nome + Telefone */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500/30 to-rose-600/20 text-sm font-bold text-rose-300 ring-1 ring-rose-500/20">
          {initials(client.name ?? '?')}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-100">
            {client.name ?? 'Sem nome'}
          </p>
          {client.phone && (
            <p className="text-xs text-slate-400">{formatPhone(client.phone)}</p>
          )}
        </div>
        <div className="shrink-0 rounded-full bg-rose-500/10 px-2 py-1 text-[10px] font-medium text-rose-400">
          1 visita
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-slate-800/60 px-3 py-2">
          <span className="text-slate-500">💇 Serviço</span>
          <p className="font-medium text-slate-100">{client.service_name ?? '—'}</p>
        </div>
        <div className="rounded-lg bg-slate-800/60 px-3 py-2">
          <span className="text-slate-500">👤 Profissional</span>
          <p className="font-medium text-slate-100">{client.staff_name ?? '—'}</p>
        </div>
        <div className="rounded-lg bg-slate-800/60 px-3 py-2">
          <span className="text-slate-500">📅 Data da visita</span>
          <p className="font-medium text-slate-100">{formatDate(client.appointment_date)}</p>
        </div>
        <div className="rounded-lg bg-slate-800/60 px-3 py-2">
          <span className="text-slate-500">💰 Valor</span>
          <p className="font-medium text-slate-100">
            {client.appointment_price != null ? formatCurrency(client.appointment_price) : '—'}
          </p>
        </div>
      </div>

      {/* Info de última visita */}
      <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs">
        <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
        <span className="text-amber-300">
          Última visita: {daysAgo(client.last_visit)}
        </span>
      </div>

      {/* WhatsApp */}
      {waLink && (
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/15 px-4 py-2.5 text-sm font-medium text-emerald-400 transition hover:bg-emerald-500/25"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Mandar WhatsApp — Reativação
        </a>
      )}
    </div>
  )
}

/* ───────── Skeleton ───────── */
function NoReturnSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-700/30 bg-slate-800/40 p-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-slate-700" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded bg-slate-700" />
          <div className="h-3 w-24 rounded bg-slate-700" />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="h-14 rounded-lg bg-slate-700/50" />
        <div className="h-14 rounded-lg bg-slate-700/50" />
        <div className="h-14 rounded-lg bg-slate-700/50" />
        <div className="h-14 rounded-lg bg-slate-700/50" />
      </div>
      <div className="mt-3 h-8 rounded-lg bg-amber-500/10" />
      <div className="mt-3 h-10 rounded-xl bg-slate-700/50" />
    </div>
  )
}

/* ════════════════════════ COMPONENTE PRINCIPAL ════════════════════════ */
export interface NoReturnSectionProps {
  search?: string
  onSelectClient?: (id: string) => void
}

export function NoReturnSection({ search, onSelectClient }: NoReturnSectionProps) {
  const { data, isLoading, isError, refetch } = useNoReturnClients()

  /* ─── Filtro local por nome ─── */
  const filtered = (data?.clients ?? []).filter((c) => {
    if (!search?.trim()) return true
    const term = search.toLowerCase()
    return (
      c.name?.toLowerCase().includes(term) ||
      c.phone?.includes(term) ||
      c.service_name?.toLowerCase().includes(term) ||
      c.staff_name?.toLowerCase().includes(term)
    )
  })

  /* ─── Estados ─── */
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <NoReturnSkeleton key={i} />)}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-12 text-center">
        <div className="rounded-full bg-red-500/10 p-3">
          <AlertTriangle className="h-6 w-6 text-red-400" />
        </div>
        <p className="text-sm font-medium text-slate-300">Erro ao carregar clientes que não voltaram</p>
        <p className="text-xs text-slate-500">Não foi possível buscar os dados. Tente novamente.</p>
        <button
          onClick={() => refetch()}
          className="rounded-lg bg-slate-700/50 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-700/80"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-700/20 px-6 py-12 text-center">
        <div className="rounded-full bg-slate-700/20 p-3">
          <RotateCcw className="h-5 w-5 text-slate-500" />
        </div>
        <p className="text-sm font-medium text-slate-400">
          {search ? 'Nenhum cliente encontrado' : 'Nenhum cliente deixou de voltar'}
        </p>
        <p className="text-xs text-slate-500">
          {search ? 'Tente ajustar a busca.' : 'Todos os clientes que vieram retornaram! 🎉'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {filtered.map((client) => (
        <NoReturnCard
          key={client.id}
          client={client}
          onSelect={onSelectClient}
        />
      ))}
    </div>
  )
}