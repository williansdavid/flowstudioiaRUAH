// src/features/clients/components/ClientDrawer.tsx
import { useMemo } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Star,
  Calendar,
  Clock,
  RotateCcw,
  TrendingUp,
  DollarSign,
  Award,
  Scissors,
  User,
  AlertTriangle,
  Sparkles,
  CalendarCheck,
  UserX,
  Ban,
  Phone,
  Mail,
  Gift,
  Hash,
  ShoppingBag,
  History,
  Ruler,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import { toWhatsAppHref } from '@/lib/utils/whatsapp'
import {
  useClientProfile,
  useClientHistory,
  useClientInsights,
  useClientTimeline,
} from '../hooks'
import type { ClientProfile, AbandonmentRisk } from '../types'

/* ───────── Helpers ───────── */

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0]![0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1]![0] ?? '' : ''
  return (first + last).toUpperCase()
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC',
  })
}

function daysAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'Hoje'
  if (diff === 1) return 'Ontem'
  return `há ${diff} dias`
}

function getAge(birthDate: string): number {
  const now = new Date()
  const b = new Date(birthDate)
  let age = now.getFullYear() - b.getFullYear()
  const m = now.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--
  return age
}


/* ───────── Formatar metadata da timeline ───────── */
function formatEventMetadata(event: { event_type: string; metadata: Record<string, unknown> | null }): string | null {
  if (!event.metadata || Object.keys(event.metadata).length === 0) return null

  const m = event.metadata as Record<string, unknown>
  const serviceName = typeof m.service_name === 'string' ? m.service_name : null
  const price = typeof m.price === 'number' ? m.price : null

  switch (event.event_type) {
    case 'visit': {
      const parts: string[] = []
      if (serviceName) parts.push(serviceName)
      if (price !== null) parts.push(formatCurrency(price))
      return parts.length > 0 ? parts.join(' · ') : null
    }
    case 'cadastro':
      return null
    case 'cancelled':
      return serviceName ? `${serviceName} (cancelado)` : 'Cancelado'
    case 'no_show':
      return serviceName ? `${serviceName} (não compareceu)` : 'Não compareceu'
    default:
      return serviceName ?? null
  }
}

/* ───────── Abandonment risk config ───────── */
const RISK_CONFIG: Record<AbandonmentRisk, { label: string; dot: string; bg: string }> = {
  low: { label: 'Baixa', dot: 'bg-emerald-400', bg: 'bg-emerald-500/10' },
  medium: { label: 'Média', dot: 'bg-amber-400', bg: 'bg-amber-500/10' },
  high: { label: 'Alta', dot: 'bg-red-400', bg: 'bg-red-500/10' },
}

/* ───────── Props ───────── */
export interface ClientDrawerProps {
  clientId: string | null
  open: boolean
  onClose: () => void
  onEdit?: (client: ClientProfile['client']) => void
}

/* ════════════════════ SECTIONS ════════════════════ */

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-700/20 pb-2">
      <span className="text-slate-400">{icon}</span>
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
    </div>
  )
}

function FinancialCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string
  value: string
  icon: React.ReactNode
  accent: 'emerald' | 'violet' | 'amber' | 'blue'
}) {
  const accentMap = {
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20',
    violet: 'from-violet-500/20 to-violet-500/5 border-violet-500/20',
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/20',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20',
  }
  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded-xl border bg-gradient-to-br p-3',
        accentMap[accent],
      )}
    >
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        {icon}
        <span>{label}</span>
      </div>
      <span className="text-sm font-bold text-slate-100">{value}</span>
    </div>
  )
}

function TagBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-600/30 bg-slate-700/30 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
      {label}
    </span>
  )
}

function IndicatorDot({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition',
        active
          ? 'bg-emerald-500/10 text-emerald-400'
          : 'bg-slate-700/20 text-slate-500',
      )}
    >
      <span
        className={cn(
          'size-1.5 rounded-full',
          active ? 'bg-emerald-400' : 'bg-slate-600',
        )}
      />
      {label}
    </span>
  )
}

/* ════════════════════ SKELETON ════════════════════ */

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-5 animate-pulse">
      {/* Avatar + name */}
      <div className="flex items-center gap-4">
        <div className="size-14 rounded-full bg-slate-700" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-40 rounded bg-slate-700" />
          <div className="h-3 w-28 rounded bg-slate-700/60" />
        </div>
      </div>
      {/* Tags */}
      <div className="flex gap-2">
        <div className="h-6 w-16 rounded-full bg-slate-700/60" />
        <div className="h-6 w-20 rounded-full bg-slate-700/60" />
        <div className="h-6 w-14 rounded-full bg-slate-700/60" />
      </div>
      {/* Financial cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="h-16 rounded-xl bg-slate-700/40" />
        <div className="h-16 rounded-xl bg-slate-700/40" />
        <div className="h-16 rounded-xl bg-slate-700/40" />
        <div className="h-16 rounded-xl bg-slate-700/40" />
      </div>
      {/* Lines */}
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-slate-700/40" />
        <div className="h-3 w-3/4 rounded bg-slate-700/40" />
        <div className="h-3 w-1/2 rounded bg-slate-700/40" />
      </div>
    </div>
  )
}

/* ════════════════════ MAIN COMPONENT ════════════════════ */

export function ClientDrawer({ clientId, open, onClose, onEdit }: ClientDrawerProps) {
  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile,
  } = useClientProfile(clientId)

  const { data: historyData } = useClientHistory(clientId, 1, 5)
  const { data: insights } = useClientInsights(clientId)
  const { data: timeline } = useClientTimeline(clientId)

  const client = profile?.client
  const financial = profile?.financial
  const fin = profile?.frequency_insights
  const ranking = profile?.ranking
  const indicators = profile?.indicators

  const phone = client?.phone ?? null
  const waHref = phone ? toWhatsAppHref(phone) : null
  const riskCfg = fin?.abandonment_risk ? RISK_CONFIG[fin.abandonment_risk] : null

  const recentEvents = useMemo(() => {
    if (!timeline?.events) return []
    return timeline.events.slice(0, 6)
  }, [timeline])

  const birthdayLabel = useMemo(() => {
    if (!client?.birth_date) return null
    return `${formatDateFull(client.birth_date)} (${getAge(client.birth_date)} anos)`
  }, [client?.birth_date])

  return (
    <Dialog.Root open={open} onOpenChange={(open) => { if (!open) onClose() }}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            {/* Overlay */}
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>

            {/* Drawer panel */}
            <Dialog.Content asChild>
              <motion.div
                className={cn(
                  'fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col',
                  'border-l border-slate-700/30 bg-surface shadow-2xl',
                  'sm:max-w-[420px]',
                )}
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              >
                {/* ─── Header fixo ─── */}
                <div className="flex shrink-0 items-center justify-between border-b border-slate-700/20 px-5 py-4">
                  <h2 className="text-sm font-bold text-slate-100">Perfil do cliente</h2>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-700/30 hover:text-slate-200"
                    >
                      <X className="size-4" />
                    </button>
                  </Dialog.Close>
                </div>

                {/* ─── Conteúdo scrollável ─── */}
                <div className="flex-1 overflow-y-auto">
                  {profileLoading && <DrawerSkeleton />}

                  {profileError && !profileLoading && (
                    <div className="flex flex-col items-center gap-4 py-16 px-5 text-center">
                      <AlertTriangle className="size-8 text-red-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-300">Erro ao carregar perfil</p>
                        <p className="mt-1 text-xs text-slate-500">Tente novamente.</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => refetchProfile()}>
                        Tentar novamente
                      </Button>
                    </div>
                  )}

                  {!profileLoading && !profileError && !client && (
                    <div className="flex flex-col items-center gap-4 py-16 px-5 text-center">
                      <User className="size-8 text-slate-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-300">Cliente não encontrado</p>
                        <p className="mt-1 text-xs text-slate-500">Pode ter sido removido.</p>
                      </div>
                    </div>
                  )}

                  {!profileLoading && !profileError && client && (
                    <div className="flex flex-col gap-6 p-5">
                      {/* ═══ HEADER: Avatar + Info ═══ */}
                      <div className="flex items-start gap-4">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xl font-bold text-white shadow-lg">
                          {initials(client.name ?? '?')}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-bold text-slate-100">
                            {client.name ?? 'Sem nome'}
                          </h3>
                          {client.phone && (
                            <div className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-400">
                              <Phone className="size-3.5 shrink-0" />
                              <span>{client.phone}</span>
                            </div>
                          )}
                          {client.email && (
                            <div className="flex items-center gap-1.5 text-sm text-slate-400">
                              <Mail className="size-3.5 shrink-0" />
                              <span className="truncate">{client.email}</span>
                            </div>
                          )}
                          {birthdayLabel && (
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                              <Gift className="size-3 shrink-0" />
                              <span>{birthdayLabel}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ═══ TAGS ═══ */}
                      {client.tags && client.tags.length > 0 && (
                        <div>
                          <SectionHeader icon={<Hash className="size-3.5" />} title="Tags" />
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {client.tags.map((tag, i) => (
                              <TagBadge key={i} label={tag} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ═══ INDICADORES ═══ */}
                      {indicators && (
                        <div className="flex flex-wrap gap-1.5">
                          <IndicatorDot active={indicators.has_future_appointment} label="Agendamento" />
                          <IndicatorDot active={indicators.is_vip} label="VIP" />
                          <IndicatorDot active={indicators.is_birthday_today} label="Aniversário" />
                          <IndicatorDot active={indicators.never_returned} label="Nunca voltou" />
                          <IndicatorDot active={indicators.cancelled_many} label="Cancelou muito" />
                        </div>
                      )}

                      {/* ═══ CARDS FINANCEIROS ═══ */}
                      {financial && (
                        <div>
                          <SectionHeader icon={<DollarSign className="size-3.5" />} title="Financeiro" />
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <FinancialCard
                              label="Total gasto"
                              value={formatCurrency(financial.total_spent)}
                              icon={<DollarSign className="size-3" />}
                              accent="emerald"
                            />
                            <FinancialCard
                              label="Ticket médio"
                              value={formatCurrency(financial.ticket_medio)}
                              icon={<TrendingUp className="size-3" />}
                              accent="violet"
                            />
                            <FinancialCard
                              label="Maior compra"
                              value={
                                financial.biggest_purchase != null
                                  ? formatCurrency(financial.biggest_purchase)
                                  : '—'
                              }
                              icon={<Award className="size-3" />}
                              accent="amber"
                            />
                            <FinancialCard
                              label="Visitas"
                              value={`${financial.total_visits}x`}
                              icon={<RotateCcw className="size-3" />}
                              accent="blue"
                            />
                          </div>
                        </div>
                      )}

                      {/* ═══ FREQUÊNCIA E RISCO ═══ */}
                      {fin && (
                        <div>
                          <SectionHeader icon={<Clock className="size-3.5" />} title="Frequência" />
                          <div className="mt-2 flex flex-col gap-2 rounded-xl border border-slate-700/20 bg-slate-800/30 p-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-400">Volta a cada</span>
                              <span className="font-semibold text-slate-200">
                                {fin.frequency_days != null ? `${fin.frequency_days} dias` : '—'}
                              </span>
                            </div>
                            {fin.next_visit_expected && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Próximo retorno</span>
                                <span
                                  className={cn(
                                    'font-semibold',
                                    fin.is_overdue ? 'text-red-400' : 'text-emerald-400',
                                  )}
                                >
                                  {formatDate(fin.next_visit_expected)}
                                  {fin.is_overdue && (
                                    <span className="ml-1 inline-flex items-center gap-1 text-xs text-red-400">
                                      <AlertTriangle className="size-3" /> Atrasado
                                    </span>
                                  )}
                                </span>
                              </div>
                            )}
                            {fin.days_since_last_visit != null && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Última visita</span>
                                <span className="text-slate-300">{daysAgo(client.last_visit!)}</span>
                              </div>
                            )}
                            {riskCfg && (
                              <div className="mt-1 flex items-center justify-between rounded-lg border border-slate-700/20 px-3 py-2">
                                <span className="text-sm text-slate-400">Risco de abandono</span>
                                <span
                                  className={cn(
                                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                                    riskCfg.bg,
                                  )}
                                >
                                  <span className={cn('size-1.5 rounded-full', riskCfg.dot)} />
                                  {riskCfg.label}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* ═══ RANKING ═══ */}
                      {ranking && (
                        <div>
                          <SectionHeader icon={<Award className="size-3.5" />} title="Ranking" />
                          <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-700/20 bg-gradient-to-r from-violet-500/10 to-indigo-500/5 px-4 py-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-violet-500/20 text-sm font-bold text-violet-300">
                              #{ranking.position}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-200">
                                Cliente nº {ranking.position}
                              </p>
                              <p className="text-xs text-slate-500">
                                de {ranking.total_clients} clientes · {ranking.percentile}% top
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ═══ DADOS DE CADASTRO ═══ */}
                      <div>
                        <SectionHeader icon={<User className="size-3.5" />} title="Dados cadastrais" />
                        <div className="mt-2 space-y-1.5 text-sm">
                          {client.cpf && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">CPF</span>
                              <span className="text-slate-300">{client.cpf}</span>
                            </div>
                          )}
                          {client.address && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Endereço</span>
                              <span className="text-right text-slate-300">{client.address}</span>
                            </div>
                          )}
                          {client.notes && (
                            <div className="flex flex-col gap-1">
                              <span className="text-slate-400">Observações</span>
                              <p className="rounded-lg bg-slate-800/40 px-3 py-2 text-sm leading-relaxed text-slate-300">
                                {client.notes}
                              </p>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Cliente desde</span>
                            <span className="text-slate-300">
                              {client.created_at ? formatDateFull(client.created_at) : '—'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ═══ SERVIÇOS FAVORITOS ═══ */}
                      {profile?.favorite_services && profile.favorite_services.length > 0 && (
                        <div>
                          <SectionHeader icon={<Scissors className="size-3.5" />} title="Serviços favoritos" />
                          <div className="mt-2 flex flex-col gap-1.5">
                            {profile.favorite_services.map((s) => (
                              <div
                                key={s.service_id}
                                className="flex items-center justify-between rounded-lg bg-slate-800/30 px-3 py-2"
                              >
                                <span className="text-sm text-slate-300">{s.service_name}</span>
                                <span className="text-xs font-medium text-slate-400">{s.count}x</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ═══ PROFISSIONAIS PREFERIDOS ═══ */}
                      {profile?.favorite_staff && profile.favorite_staff.length > 0 && (
                        <div>
                          <SectionHeader icon={<User className="size-3.5" />} title="Profissionais preferidos" />
                          <div className="mt-2 flex flex-col gap-1.5">
                            {profile.favorite_staff.map((s) => (
                              <div
                                key={s.staff_id}
                                className="flex items-center gap-3 rounded-lg bg-slate-800/30 px-3 py-2"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-300">{s.staff_name}</span>
                                    <span className="text-xs font-medium text-slate-400">{s.percentage}%</span>
                                  </div>
                                  <div className="mt-1 h-1.5 w-full rounded-full bg-slate-700/40">
                                    <div
                                      className="h-1.5 rounded-full bg-violet-500/60"
                                      style={{ width: `${s.percentage}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ═══ HISTÓRICO (últimos 5) ═══ */}
                      {historyData?.items && historyData.items.length > 0 && (
                        <div>
                          <SectionHeader icon={<History className="size-3.5" />} title="Últimos atendimentos" />
                          <div className="mt-2 flex flex-col gap-1">
                            {historyData.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between rounded-lg bg-slate-800/30 px-3 py-2"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-xs text-slate-500 shrink-0">
                                    {formatDate(item.starts_at)}
                                  </span>
                                  <span className="truncate text-sm text-slate-300">
                                    {item.service_name ?? '—'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {item.price != null && (
                                    <span className="text-sm font-medium text-emerald-400">
                                      {formatCurrency(item.price)}
                                    </span>
                                  )}
                                  <ChevronRight className="size-3.5 text-slate-600" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ═══ TIMELINE ═══ */}
                      {recentEvents.length > 0 && (
                        <div>
                          <SectionHeader icon={<Ruler className="size-3.5" />} title="Linha do tempo" />
                          <div className="relative mt-2 pl-4">
                            {/* Linha vertical */}
                            <div className="absolute left-[5px] top-1 bottom-0 w-0.5 bg-gradient-to-b from-violet-500/40 to-transparent" />
                            <div className="flex flex-col gap-3">
                              {recentEvents.map((event) => (
                                <div key={event.id} className="relative pl-5">
                                  <div className="absolute left-[-11px] top-1.5 size-2.5 rounded-full border-2 border-violet-500/60 bg-slate-800" />
                                  <p className="text-xs text-slate-400">
                                    {formatDateFull(event.occurred_at)}
                                  </p>
                                  <p className="text-sm text-slate-300 capitalize">
                                    {event.event_type.replace(/_/g, ' ')}
                                  </p>
                                    {(() => {
                                      const label = formatEventMetadata(event)
                                      return label ? (
                                        <p className="text-xs text-slate-500">{label}</p>
                                      ) : null
                                    })()}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ═══ PRODUTOS COMPRADOS (placeholder — dados virão de server function futura) ═══ */}
                      <div className="pb-4" />
                    </div>
                  )}
                </div>

                {/* ─── Footer fixo ─── */}
                {!profileLoading && !profileError && client && (
                  <div className="flex shrink-0 items-center gap-2 border-t border-slate-700/20 bg-slate-900/80 px-5 py-4 backdrop-blur-xl">
                    {waHref && <WhatsAppButton href={waHref} />}
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { onEdit(client); onClose() }}
                        className="flex-1"
                      >
                        Editar cadastro
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}