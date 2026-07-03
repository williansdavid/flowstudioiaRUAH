// src/features/clients/components/ClientsPageContent.tsx
'use client'

import { useState } from 'react'
import {
  Users,
  UserPlus,
  Gift,
  DollarSign,
  TrendingUp,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/features/utils/ui/Button'
import { useSession } from '@/features/auth'
import { useClientKpis } from '../hooks'
import { ClientDataTable } from './ClientDataTable'
import { ClientDrawer } from './ClientDrawer'
import { ClientFormModal } from './ClientFormModal'
import type { ClientProfile } from '../types'

/* ───────── Helpers ───────── */
function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/* ───────── KPI Card ───────── */
interface KpiProps {
  label: string
  value: string | number
  icon: React.ReactNode
  accent: 'violet' | 'emerald' | 'amber' | 'blue' | 'rose' | 'cyan'
}

const KPI_ACCENTS = {
  violet: 'from-violet-500/15 to-violet-500/5 border-violet-500/20',
  emerald: 'from-emerald-500/15 to-emerald-500/5 border-emerald-500/20',
  amber: 'from-amber-500/15 to-amber-500/5 border-amber-500/20',
  blue: 'from-blue-500/15 to-blue-500/5 border-blue-500/20',
  rose: 'from-rose-500/15 to-rose-500/5 border-rose-500/20',
  cyan: 'from-cyan-500/15 to-cyan-500/5 border-cyan-500/20',
}

const ICON_ACCENTS = {
  violet: 'bg-violet-500/15 text-violet-400',
  emerald: 'bg-emerald-500/15 text-emerald-400',
  amber: 'bg-amber-500/15 text-amber-400',
  blue: 'bg-blue-500/15 text-blue-400',
  rose: 'bg-rose-500/15 text-rose-400',
  cyan: 'bg-cyan-500/15 text-cyan-400',
}

function KpiCard({ label, value, icon, accent }: KpiProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded-2xl border bg-gradient-to-b p-4',
        KPI_ACCENTS[accent],
      )}
    >
      <span className="text-xs font-medium text-slate-400">{label}</span>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-slate-100">{value}</span>
        <div className={cn('rounded-lg p-2', ICON_ACCENTS[accent])}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function KpiSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-700/30 bg-slate-800/40 p-4">
      <div className="mb-2 h-3 w-20 rounded bg-slate-700" />
      <div className="h-6 w-16 rounded bg-slate-700" />
    </div>
  )
}

/* ════════════════════ PÁGINA ════════════════════ */
export function ClientsPageContent() {
  const session = useSession()
  const isAdmin = session.data?.profile?.role === 'admin'
  const { data: kpisData, isLoading: kpisLoading } = useClientKpis()

  /* ─── Modais ─── */
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<ClientProfile['client'] | null>(null)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')

  /* ─── Handlers ─── */
  function handleSelectClient(id: string) {
    setSelectedClientId(id)
    setDrawerOpen(true)
  }

  function handleEditClient(client: ClientProfile['client']) {
    setDrawerOpen(false)
    setFormMode('edit')
    setEditingClient(client)
    setFormOpen(true)
  }
  function handleCreate() {
    setEditingClient(null)
    setFormMode('create')
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-100">Clientes</h1>
          <p className="text-sm text-slate-400">
            Gerencie o cadastro e o relacionamento com seus clientes
          </p>
        </div>
        {isAdmin && (
          <Button variant="primary" size="sm" onClick={handleCreate}>
            <Plus className="mr-1.5 size-4" />
            Novo cliente
          </Button>
        )}
      </div>

      {/* ─── KPIs ─── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpisLoading
          ? Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
          : kpisData && (
              <>
                <KpiCard
                  label="ATIVOS"
                  value={kpisData.active_count ?? 0}
                  icon={<Users className="size-4" />}
                  accent="violet"
                />
                <KpiCard
                  label="NOVOS (MÊS)"
                  value={kpisData.new_this_month ?? 0}
                  icon={<UserPlus className="size-4" />}
                  accent="emerald"
                />
                <KpiCard
                  label="RETORNO MÉDIO"
                  value={kpisData.avg_return_days != null ? `${kpisData.avg_return_days}d` : '-'}
                  icon={<TrendingUp className="size-4" />}
                  accent="blue"
                />
                <KpiCard
                  label="TICKET MÉDIO"
                  value={kpisData.avg_ticket != null ? formatCurrency(kpisData.avg_ticket) : '-'}
                  icon={<DollarSign className="size-4" />}
                  accent="cyan"
                />
              </>
            )}
      </div>

      {/* ─── Lista ─── */}
      <ClientDataTable
        onSelectClient={handleSelectClient}
        onCreate={handleCreate}
      />

      {/* ─── Modais ─── */}
      <ClientDrawer
        clientId={selectedClientId}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedClientId(null) }}
        onEdit={handleEditClient}
      />

      {formOpen && (
        <ClientFormModal
          open={formOpen}
          onClose={() => { setFormOpen(false); setEditingClient(null) }}
          mode={formMode}
          client={editingClient}
        />
      )}
    </div>
  )
}