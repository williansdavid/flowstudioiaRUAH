import { useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2, UserPlus, AlertTriangle, Clock, Scissors, User, DollarSign, Check, CheckCheck } from 'lucide-react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { parseISO } from 'date-fns';
import { QuickClientModal } from './QuickClientModal';
import { ClientCombobox } from './ClientCombobox';
import { Button } from '@/features/utils/ui/Button';
import { ConfirmDialog } from '@/features/utils/ui/ConfirmDialog';
import { WhatsAppButton } from '@/features/utils/whats/WhatsAppButton';
import type { AppointmentItem, BookableStaffItem, ClientOption, ServiceOption } from '../types';
import type { TimeOffBlockItem } from '../server/getDayTimeOff';
import { getDayTimeOff } from '../server/getDayTimeOff';
import { useCreateAppointment, useUpdateAppointment, useCancelAppointment, useUpdateAppointmentStatus } from '../hooks';
import type { BusinessHours } from '@/sites/ruah/types';
import { cn } from '@/lib/cn';
import { toWhatsAppHref } from '@/features/utils/whats/whatsapp';
import { useNavigate } from '@tanstack/react-router';
import { WHATS_MSG } from '@/features/utils/whats/whatsmsg';
import { identity } from '@/config/active-studio'

// ═══ Safe date parsers — NUNCA lançam RangeError ═══
function safeParseISO(iso: string | null | undefined): Date {
  if (!iso) return new Date(NaN)
  try {
    const d = parseISO(iso)
    return isNaN(d.getTime()) ? new Date(NaN) : d
  } catch {
    return new Date(NaN)
  }
}

function safeFormatTime(iso: string | null | undefined): string {
  if (!iso) return '--:--'
  const d = safeParseISO(iso)
  if (isNaN(d.getTime())) return '--:--'
  return timeFmt.format(d)
}

const timeFmt = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
})
// ═══ Fim safe parsers ═══

// ── Status config ────────────────────────────────────────────────
type Status = AppointmentItem['status']

const STATUS_CONFIG: Record<Status, { label: string; dot: string }> = {
  pending:    { label: 'Pendente',       dot: 'bg-amber-400'  },
  confirmed:  { label: 'Confirmado',     dot: 'bg-emerald-400' },
  completed:  { label: 'Concluído',      dot: 'bg-blue-400'   },
  cancelled:  { label: 'Cancelado',      dot: 'bg-red-400'    },
  no_show:    { label: 'Não compareceu', dot: 'bg-red-400'    },
}

type Mode =
  | { kind: 'create'; defaults?: { staffId?: string; startsAt?: string } }
  | { kind: 'edit'; appointment: AppointmentItem }

interface Props {
  open: boolean
  mode: Mode
  clients: ClientOption[]
  services: ServiceOption[]
  staff: BookableStaffItem[]
  timeOff: TimeOffBlockItem[]
  businessHours: BusinessHours
  onClose: () => void
}

// ── Helpers ──────────────────────────────────────────────────────
function normalizeDate(dateStr: string): string {
  const d = safeParseISO(dateStr)
  if (!isNaN(d.getTime())) return d.toLocaleDateString('pt-BR')
  return dateStr
}

function hasTimeOffConflict(t: TimeOffBlockItem[], sId: string, sA: string, eA: string) {
  if (!sId || !sA || !eA) return null
  const s = safeParseISO(sA).getTime()
  const e = safeParseISO(eA).getTime()
  if (isNaN(s) || isNaN(e)) return null
  for (const b of t) {
    if (b.staffId !== sId) continue
    const bS = safeParseISO(b.startsAt).getTime()
    const bE = safeParseISO(b.endsAt).getTime()
    if (isNaN(bS) || isNaN(bE)) continue
    if (s < bE && e > bS) return b
  }
  return null
}

function splitISO(iso: string) {
  const d = safeParseISO(iso)
  const fmt = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const [date, time] = fmt.format(d).split(' ')
  return { date: date!, time: time! }
}

function joinISO(date: string, time: string) {
  return new Date(`${date}T${time}:00-03:00`).toISOString()
}

function nextRoundHour() {
  const now = new Date()
  const { date } = splitISO(now.toISOString())
  const hh = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Sao_Paulo', hour: '2-digit', hour12: false }).format(now))
  return { date, time: `${String(Math.min(hh + 1, 23)).padStart(2, '0')}:00` }
}

function addMinutes(time: string, min: number) {
  const [h, m] = time.split(':').map(Number)
  const total = Math.min(h! * 60 + m! + min, 23 * 60 + 59)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

interface FormState {
  clientId: string
  serviceId: string
  staffId: string
  date: string
  startTime: string
  endTime: string
  notes: string
}

function buildInitialState(mode: Mode): FormState {
  if (mode.kind === 'edit') {
    const a = mode.appointment
    const s = splitISO(a.startsAt)
    const e = splitISO(a.endsAt)
    return {
      clientId: a.clientId,
      serviceId: a.serviceId,
      staffId: a.staffId,
      date: s.date,
      startTime: s.time,
      endTime: e.time,
      notes: a.notes ?? '',
    }
  }
  const base = mode.defaults?.startsAt ? splitISO(mode.defaults.startsAt) : nextRoundHour()
  return {
    clientId: '',
    serviceId: '',
    staffId: mode.defaults?.staffId ?? '',
    date: base.date,
    startTime: base.time,
    endTime: addMinutes(base.time, 30),
    notes: '',
  }
}

// ── Classes refinadas premium ─────────────────────────────────────
const fieldLabel = 'text-[11px] font-semibold uppercase tracking-widest text-slate-400'
const fieldInput = 'w-full rounded-lg border border-slate-700/30 bg-slate-800/60 px-3 py-2.5 text-sm text-slate-300 outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 focus:bg-slate-800'
const infoCard = 'flex items-center gap-2.5 rounded-xl border border-slate-700/20 bg-slate-800/40 p-3'
const quickBtn = 'inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 active:scale-95'

export function AppointmentFormModal({
  open, mode, clients, services, staff, timeOff = [], businessHours, onClose,
}: Props) {
  const isEdit = mode.kind === 'edit'
  const appointment = isEdit ? mode.appointment : null
  const [form, setForm] = useState(() => buildInitialState(mode))
  const [quickClientOpen, setQuickClientOpen] = useState(false)
  const [quickClientName, setQuickClientName] = useState('')
  const [cancelTarget, setCancelTarget] = useState(false)

  const queryClient = useQueryClient()
  const createMutation = useCreateAppointment()
  const updateMutation = useUpdateAppointment()
  const cancelMutation = useCancelAppointment()
  const statusMutation = useUpdateAppointmentStatus()

  const { data: modalTimeOff = [] } = useQuery({
    queryKey: ['dayTimeOff', form.date],
    queryFn: () => getDayTimeOff({ data: { date: form.date } }),
    enabled: !!form.date && open,
  })

  useEffect(() => {
    if (open) setForm(buildInitialState(mode))
  }, [open, mode])

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm(p => ({ ...p, [k]: v }))
  }

  const selectedService = useMemo(
    () => services.find(s => s.id === form.serviceId) ?? null,
    [services, form.serviceId],
  )

  useEffect(() => {
    if (!selectedService) return
    set('endTime', addMinutes(form.startTime, selectedService.durationMinutes))
  }, [form.serviceId, form.startTime])

  // Validações
  const missingFields: string[] = []
  let retroError = false
  if (!form.clientId) missingFields.push('Cliente')
  if (!form.serviceId) missingFields.push('Serviço')
  if (!form.staffId) missingFields.push('Profissional')
  if (form.date && form.startTime) {
    const dt = safeParseISO(joinISO(form.date, form.startTime))
    let r = dt < new Date()
    if (isEdit && r && appointment) {
      const aptTime = safeParseISO(appointment.startsAt).getTime()
      if (dt.getTime() === aptTime) r = false
    }
    if (r) retroError = true
  }

  const conflict = useMemo(() => {
    if (!form.staffId || !form.date || !form.startTime || !form.endTime) return null
    return hasTimeOffConflict(
      modalTimeOff,
      form.staffId,
      joinISO(form.date, form.startTime),
      joinISO(form.date, form.endTime),
    )
  }, [modalTimeOff, form.staffId, form.date, form.startTime, form.endTime])

  const canSubmit = missingFields.length === 0 && !retroError && !conflict && !!form.endTime
  const isSaving =
    createMutation.isPending || updateMutation.isPending || cancelMutation.isPending || statusMutation.isPending

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['appointments'] })
    queryClient.invalidateQueries({ queryKey: ['dayTimeOff'] })
    onClose()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    const sA = joinISO(form.date, form.startTime)
    const eA = joinISO(form.date, form.endTime)
    if (isEdit && appointment) {
      updateMutation.mutate(
        { id: appointment.id, staffId: form.staffId, serviceId: form.serviceId, startsAt: sA, endsAt: eA, notes: form.notes || null },
        { onSuccess: handleSuccess },
      )
    } else {
      createMutation.mutate(
        { clientId: form.clientId, serviceId: form.serviceId, staffId: form.staffId, startsAt: sA, endsAt: eA, notes: form.notes || null },
        { onSuccess: handleSuccess },
      )
    }
  }

  function handleQuickStatus(status: 'confirmed' | 'completed' | 'cancelled') {
    if (!appointment) return
    statusMutation.mutate({ id: appointment.id, status }, { onSuccess: handleSuccess })
  }

  const conflictLabel = conflict
    ? (() => {
        const r = conflict.reason ?? 'Folga'
        const s = safeParseISO(conflict.startsAt)
        const e = safeParseISO(conflict.endsAt)
        const sStr = isNaN(s.getTime()) ? '--:--' : s.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
        const eStr = isNaN(e.getTime()) ? '--:--' : e.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
        return `${r} (${sStr} — ${eStr})`
      })()
    : null

  const waHref = appointment?.clientPhone
    ? toWhatsAppHref(
        appointment.clientPhone,
        WHATS_MSG.confirmAppointment({
          clientName: appointment.clientName,
          date: normalizeDate(appointment.startsAt ?? ''),
          time: safeFormatTime(appointment.startsAt),
          serviceName: appointment.serviceName ?? 'o serviço',
          staffName: appointment.staffName ?? 'nosso profissional',
          studioName: identity.name || 'FlowStudio',
        }),
      )
    : null

  const errorsVisible = missingFields.length > 0 || retroError
  const navigate = useNavigate()

  return (
    <>
      <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[90vh] w-full max-w-md flex-col rounded-t-2xl border border-slate-700/30 bg-slate-900 shadow-2xl outline-none sm:inset-y-auto sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-700/20 px-5 py-4">
              <Dialog.Title className="text-base font-bold text-slate-100">
                {isEdit ? 'Detalhes do agendamento' : 'Novo agendamento'}
              </Dialog.Title>
              <Dialog.Close className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200">
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {/* Card de informações (só no modo edição) */}
              {isEdit && appointment && (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-slate-100">{appointment.clientName}</p>
                      <p className="text-sm text-slate-400">{appointment.serviceName}</p>
                    </div>
                    <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${STATUS_CONFIG[appointment.status]?.dot} bg-opacity-10`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_CONFIG[appointment.status]?.dot}`} />
                      {STATUS_CONFIG[appointment.status]?.label}
                    </div>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-2">
                    <div className={infoCard}>
                      <Clock className="h-4 w-4 text-cyan-400" />
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Horário</p>
                        <p className="text-sm font-bold text-slate-200">{safeFormatTime(appointment.startsAt)}</p>
                      </div>
                    </div>
                    <div className={infoCard}>
                      <DollarSign className="h-4 w-4 text-emerald-400" />
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Valor</p>
                        <p className="text-sm font-bold text-slate-200">
                          {appointment.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                    </div>
                    <div className={infoCard}>
                      <User className="h-4 w-4 text-blue-400" />
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Profissional</p>
                        <p className="text-sm font-bold text-slate-200">{appointment.staffName}</p>
                      </div>
                    </div>
                    <div className={infoCard}>
                      <Scissors className="h-4 w-4 text-purple-400" />
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Duração</p>
                        <p className="text-sm font-bold text-slate-200">
                          {selectedService ? `${selectedService.durationMinutes}min` : '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick actions */}
                  {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                    <div className="mb-4 flex gap-2">
                      {appointment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleQuickStatus('confirmed')}
                            disabled={isSaving}
                            className={cn(quickBtn, 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10')}
                          >
                            <Check className="h-3.5 w-3.5" />
                            Confirmar
                          </button>
                          <button
                            onClick={() => setCancelTarget(true)}
                            disabled={isSaving}
                            className={cn(quickBtn, 'border-red-500/20 text-red-400 hover:bg-red-500/10')}
                          >
                            <X className="h-3.5 w-3.5" />
                            Cancelar
                          </button>
                        </>
                      )}
                      {appointment.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => {
                              navigate({ to: '/admin/pdv', search: { appointmentId: appointment.id } })
                            }}
                            disabled={isSaving}
                            className={cn(quickBtn, 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10')}
                          >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Concluir
                          </button>
                          <button
                            onClick={() => setCancelTarget(true)}
                            disabled={isSaving}
                            className={cn(quickBtn, 'border-red-500/20 text-red-400 hover:bg-red-500/10')}
                          >
                            <X className="h-3.5 w-3.5" />
                            Cancelar
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Form */}
              <form id="appointment-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Cliente */}
                <div>
                  <label className={fieldLabel}>Cliente</label>
                  <div className="mt-1.5 flex gap-2">
                    <div className="flex-1">
                      <ClientCombobox
                        value={form.clientId}
                        onChange={(id) => set('clientId', id)}
                        onCreateNew={(name) => { setQuickClientName(name); setQuickClientOpen(true); }}
                      />
                    </div>
                    {!isEdit && (
                      <button
                        type="button"
                        onClick={() => {
                          setQuickClientName('')
                          setQuickClientOpen(true)
                        }}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-400 transition-colors hover:bg-orange-500/20"
                      >
                        <UserPlus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Serviço */}
                <div>
                  <label className={fieldLabel}>Serviço</label>
                  <select
                    value={form.serviceId}
                    onChange={(e) => set('serviceId', e.target.value)}
                    className={`${fieldInput} mt-1.5`}
                  >
                    <option value="">Selecione…</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.durationMinutes}min)
                        {s.price ? ` — ${s.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Profissional */}
                <div>
                  <label className={fieldLabel}>Profissional</label>
                  <select
                    value={form.staffId}
                    onChange={(e) => set('staffId', e.target.value)}
                    className={`${fieldInput} mt-1.5`}
                  >
                    <option value="">Selecione…</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Data */}
                <div>
                  <label className={fieldLabel}>Data</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => set('date', e.target.value)}
                    className={`${fieldInput} mt-1.5`}
                  />
                </div>

                {/* Horários */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={fieldLabel}>Início</label>
                    <input
                      type="time"
                      value={form.startTime}
                      onChange={(e) => set('startTime', e.target.value)}
                      className={`${fieldInput} mt-1.5`}
                    />
                  </div>
                  <div>
                    <label className={fieldLabel}>Fim</label>
                    <input
                      type="time"
                      value={form.endTime}
                      onChange={(e) => set('endTime', e.target.value)}
                      className={`${fieldInput} mt-1.5`}
                    />
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <label className={fieldLabel}>Observações (opcional)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => set('notes', e.target.value)}
                    maxLength={1000}
                    className={`${fieldInput} mt-1.5 min-h-[80px] resize-none`}
                  />
                </div>

                {conflict && (
                  <div className="rounded-lg border border-orange-500/25 bg-orange-500/8 px-3 py-2.5 text-xs text-orange-400">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>Horário conflita com <strong>{conflictLabel}</strong></span>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Footer fixo */}
            <div className="shrink-0 border-t border-slate-700/20 bg-slate-900/80 backdrop-blur-xl px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {errorsVisible ? (
                    <div className="flex flex-col gap-0.5 text-right text-xs font-medium leading-tight text-orange-400">
                      {missingFields.length > 0 && <span>Falta: {missingFields.join(', ')}</span>}
                      {retroError && (
                        <span className="flex items-center justify-end gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Data/hora no passado
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">Pronto para salvar</span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isEdit && waHref && <WhatsAppButton href={waHref} />}
                  <Button type="submit" form="appointment-form" variant="primary" size="sm" disabled={!canSubmit} isLoading={isSaving}>
                    {isEdit ? 'Salvar' : 'Criar'}
                  </Button>
                </div>
              </div>
            </div>

            <ConfirmDialog
              open={cancelTarget}
              onClose={() => setCancelTarget(false)}
              onConfirm={() => {
                handleQuickStatus('cancelled')
                setCancelTarget(false)
              }}
              title="Cancelar agendamento?"
              description={appointment ? `Tem certeza que deseja cancelar o agendamento de ${appointment.clientName}?` : ''}
              confirmLabel="Sim, cancelar"
              cancelLabel="Voltar"
              variant="danger"
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <QuickClientModal
        open={quickClientOpen}
        initialName={quickClientName}
        onClose={() => setQuickClientOpen(false)}
        onCreated={(c) => set('clientId', c.id)}
      />
    </>
  )
}