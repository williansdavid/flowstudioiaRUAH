// src/features/clients/components/ClientsPageContent.tsx
'use client'

import { useState, useRef } from 'react'
import {
  Users,
  UserPlus,
  DollarSign,
  TrendingUp,
  Plus,
  Upload,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/features/utils/ui/Button'
import { useSession } from '@/features/auth'
import { useClientKpis } from '../hooks'
import { ClientDataTable } from './ClientDataTable'
import { ClientDrawer } from './ClientDrawer'
import { ClientFormModal } from './ClientFormModal'
import { importVcfBatch } from '@/server/clients/importVcfBatch'
import { parseVcfContacts } from '@/lib/vcf-parser'
import { useQueryClient } from '@tanstack/react-query'
import type { ClientProfile } from '../types'

const BATCH_SIZE = 25

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
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* ─── Modais ─── */
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<ClientProfile['client'] | null>(null)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')

  /* ─── Importação ─── */
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [importPhase, setImportPhase] = useState<'reading' | 'importing' | 'done'>('reading')
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 })
  const [importSummary, setImportSummary] = useState<{
    totalInFile: number
    imported: number
    duplicates: number
    incomplete: number
    skippedPhone: number
    errors: string[]
  } | null>(null)

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Abre modal
    setImportPhase('reading')
    setImportSummary(null)
    setImportProgress({ current: 0, total: 0 })
    setImportModalOpen(true)

    try {
      // Fase 1: leitura e parse
      const text = await file.text()
      const contacts = parseVcfContacts(text)

      if (contacts.length === 0) {
        setImportSummary({
          totalInFile: 0,
          imported: 0,
          duplicates: 0,
          incomplete: 0,
          skippedPhone: 0,
          errors: ['Nenhum contato encontrado no arquivo. Verifique se o arquivo .vcf é válido.'],
        })
        setImportPhase('done')
        return
      }

      // Separa contatos válidos (com nome)
      const validContacts = contacts.filter(
         (c): c is { name: string; phone: string | null; email: string | null } => c.name !== null
      )
      const incompleteCount = contacts.length - validContacts.length

      // Divide em lotes
      const batches: Array<{ name: string; phone: string | null; email: string | null }>[] = []
      for (let i = 0; i < validContacts.length; i += BATCH_SIZE) {
        batches.push(validContacts.slice(i, i + BATCH_SIZE) as { name: string; phone: string | null; email: string | null }[])
      }

      // Fase 2: importação com progresso
      setImportPhase('importing')
      setImportProgress({ current: 0, total: batches.length })

      let imported = 0
      let duplicates = 0
      let skippedPhone = 0
      const errors: string[] = []

      for (let i = 0; i < batches.length; i++) {
        setImportProgress({ current: i + 1, total: batches.length })

        try {
          const result = await importVcfBatch({
            data: {
              contacts: batches[i]!,
              batchIndex: i,
              totalBatches: batches.length,
            },
          })

          imported += result.imported
          duplicates += result.duplicates
          skippedPhone += result.skippedPhone

          if (result.errors.length > 0) {
            errors.push(...result.errors)
          }
        } catch (batchErr) {
          const msg = batchErr instanceof Error ? batchErr.message : 'Erro inesperado'
          errors.push(`Lote ${i + 1}: ${msg}`)
        }
      }

      // Fase 3: concluído
      setImportSummary({
        totalInFile: contacts.length,
        imported,
        duplicates,
        incomplete: incompleteCount,
        skippedPhone,
        errors,
      })
      setImportPhase('done')

      // Atualiza dados da tela
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['client-kpis'] })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro inesperado'
      setImportSummary({
        totalInFile: 0,
        imported: 0,
        duplicates: 0,
        incomplete: 0,
        skippedPhone: 0,
        errors: [msg],
      })
      setImportPhase('done')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function closeImportModal() {
    setImportModalOpen(false)
    setImportSummary(null)
  }

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
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".vcf"
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-xl border border-slate-600/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:bg-slate-700/50 hover:text-slate-100"
            >
              <Upload className="size-4" />
              Importar contatos
            </button>
            <Button variant="primary" size="sm" onClick={handleCreate}>
              <Plus className="mr-1.5 size-4" />
              Novo cliente
            </Button>
          </div>
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

      {/* ─── Modal de importação ─── */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900 p-6 shadow-xl">
            {/* ─── Fase: Lendo arquivo ─── */}
            {importPhase === 'reading' && (
              <div className="flex flex-col items-center py-6">
                <Loader2 className="mb-4 h-10 w-10 animate-spin text-[var(--color-accent)]" />
                <p className="text-sm font-medium text-slate-200">
                  Lendo arquivo...
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Analisando contatos do arquivo .vcf
                </p>
              </div>
            )}

            {/* ─── Fase: Importando com barra de progresso ─── */}
            {importPhase === 'importing' && (
              <div className="flex flex-col items-center py-4">
                <p className="mb-4 text-sm font-medium text-slate-200">
                  Importando contatos...
                </p>

                {/* Barra de progresso + percentual */}
                <div className="mb-2 w-full">
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                    <span>
                      Lote {importProgress.current} de {importProgress.total}
                    </span>
                    <span>
                      {importProgress.total > 0
                        ? Math.round((importProgress.current / importProgress.total) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all duration-500 ease-out"
                      style={{
                        width: `${
                          importProgress.total > 0
                            ? (importProgress.current / importProgress.total) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Verificando duplicatas e cadastrando clientes
                </p>
              </div>
            )}

            {/* ─── Fase: Concluído ─── */}
            {importPhase === 'done' && importSummary && (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-100">
                    Importação concluída
                  </h2>
                  <button
                    onClick={closeImportModal}
                    className="text-slate-400 transition-colors hover:text-slate-200"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                    <CheckCircle2 className="size-5 text-emerald-400" />
                    <span className="text-sm text-slate-200">
                      <strong>{importSummary.imported}</strong> contatos importados
                    </span>
                  </div>

                  {importSummary.skippedPhone > 0 && (
                    <div className="flex items-center gap-3 rounded-xl border border-sky-500/20 bg-sky-500/10 p-3">
                      <AlertTriangle className="size-5 text-sky-400" />
                      <span className="text-sm text-slate-200">
                        <strong>{importSummary.skippedPhone}</strong> sem telefone válido — salvos sem telefone
                      </span>
                    </div>
                  )}

                  {importSummary.duplicates > 0 && (
                    <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                      <AlertTriangle className="size-5 text-amber-400" />
                      <span className="text-sm text-slate-200">
                        <strong>{importSummary.duplicates}</strong> já existentes (ignorados)
                      </span>
                    </div>
                  )}

                  {importSummary.incomplete > 0 && (
                    <div className="flex items-center gap-3 rounded-xl border border-slate-500/20 bg-slate-500/10 p-3">
                      <AlertTriangle className="size-5 text-slate-400" />
                      <span className="text-sm text-slate-200">
                        <strong>{importSummary.incomplete}</strong> sem nome (ignorados)
                      </span>
                    </div>
                  )}

                  {importSummary.errors.length > 0 && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                      <p className="mb-1 text-sm font-medium text-red-400">Erros:</p>
                      {importSummary.errors.map((err, i) => (
                        <p key={i} className="text-xs text-red-300">{err}</p>
                      ))}
                    </div>
                  )}

                  <p className="pt-2 text-center text-xs text-slate-500">
                    {importSummary.totalInFile} contatos processados no total
                  </p>
                </div>

                <button
                  onClick={closeImportModal}
                  className="mt-4 w-full rounded-lg bg-slate-700 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-600"
                >
                  Fechar
                </button>
              </>
            )}
          </div>
        </div>
      )}

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