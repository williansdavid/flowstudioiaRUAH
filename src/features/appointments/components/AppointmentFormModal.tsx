// src/features/appointments/components/AppointmentFormModal.tsx
import { useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X, Loader2, UserPlus, AlertTriangle,
  Clock, Scissors, User, DollarSign,
  Check, CheckCheck,
} from 'lucide-react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { QuickClientModal } from './QuickClientModal';
import { ClientCombobox } from './ClientCombobox';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import type {
  AppointmentItem,
  BookableStaffItem,
  ClientOption,
  ServiceOption,
} from '../types';
import type { TimeOffBlockItem } from '../server/getDayTimeOff';
import { getDayTimeOff } from '../server/getDayTimeOff';
import {
  useCreateAppointment,
  useUpdateAppointment,
  useCancelAppointment,
  useUpdateAppointmentStatus,
} from '../hooks';
import type { BusinessHours } from '@/sites/ruah/types';
import { cn } from '@/lib/cn';
import { toWhatsAppHref } from '@/lib/utils/whatsapp';

// ── Status config ────────────────────────────────────────────────
type Status = AppointmentItem['status'];
const STATUS_CONFIG: Record<Status, { label: string; dot: string }> = {
  pending:    { label: 'Pendente',      dot: 'bg-amber-400' },
  confirmed:  { label: 'Confirmado',    dot: 'bg-emerald-400' },
  completed:  { label: 'Concluído',     dot: 'bg-blue-400' },
  cancelled:  { label: 'Cancelado',     dot: 'bg-red-400' },
  no_show:    { label: 'Não compareceu', dot: 'bg-red-400' },
};

type Mode =
  | { kind: 'create'; defaults?: { staffId?: string; startsAt?: string } }
  | { kind: 'edit'; appointment: AppointmentItem };

interface Props {
  open: boolean;
  mode: Mode;
  clients: ClientOption[];
  services: ServiceOption[];
  staff: BookableStaffItem[];
  timeOff: TimeOffBlockItem[];
  businessHours: BusinessHours;
  onClose: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────
function hasTimeOffConflict(t: TimeOffBlockItem[], sId: string, sA: string, eA: string) {
  if (!sId || !sA || !eA) return null;
  const s = new Date(sA).getTime(), e = new Date(eA).getTime();
  for (const b of t) {
    if (b.staffId !== sId) continue;
    const bS = new Date(b.startsAt).getTime(), bE = new Date(b.endsAt).getTime();
    if (s < bE && e > bS) return b;
  }
  return null;
}

function splitISO(iso: string) {
  const d = new Date(iso);
  const fmt = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
  const [date, time] = fmt.format(d).split(' ');
  return { date: date!, time: time! };
}

function joinISO(date: string, time: string) {
  return new Date(`${date}T${time}:00-03:00`).toISOString();
}

function nextRoundHour() {
  const now = new Date();
  const { date } = splitISO(now.toISOString());
  const hh = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Sao_Paulo', hour: '2-digit', hour12: false }).format(now));
  return { date, time: `${String(Math.min(hh + 1, 23)).padStart(2, '0')}:00` };
}

function addMinutes(time: string, min: number) {
  const [h, m] = time.split(':').map(Number);
  const total = Math.min(h! * 60 + m! + min, 23 * 60 + 59);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

const timeFmt = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });

interface FormState {
  clientId: string; serviceId: string; staffId: string;
  date: string; startTime: string; endTime: string; notes: string;
}

function buildInitialState(mode: Mode): FormState {
  if (mode.kind === 'edit') {
    const a = mode.appointment;
    const s = splitISO(a.startsAt), e = splitISO(a.endsAt);
    return { clientId: a.clientId, serviceId: a.serviceId, staffId: a.staffId, date: s.date, startTime: s.time, endTime: e.time, notes: a.notes ?? '' };
  }
  const base = mode.defaults?.startsAt ? splitISO(mode.defaults.startsAt) : nextRoundHour();
  return { clientId: '', serviceId: '', staffId: mode.defaults?.staffId ?? '', date: base.date, startTime: base.time, endTime: addMinutes(base.time, 30), notes: '' };
}

// ── Classes refinadas premium ─────────────────────────────────────
const fieldLabel = 'text-[11px] font-semibold uppercase tracking-widest text-slate-400';
const fieldInput =
  'w-full rounded-lg border border-slate-700/30 bg-slate-800/60 px-3 py-2.5 text-sm text-slate-300 outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 focus:bg-slate-800';
const infoCard = 'flex items-center gap-2.5 rounded-xl border border-slate-700/20 bg-slate-800/40 p-3';
const quickBtn = 'inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 active:scale-95';

export function AppointmentFormModal({ open, mode, clients, services, staff, timeOff = [], businessHours, onClose }: Props) {
  const isEdit = mode.kind === 'edit';
  const appointment = isEdit ? mode.appointment : null;
  const [form, setForm] = useState<FormState>(() => buildInitialState(mode));
  const [quickClientOpen, setQuickClientOpen] = useState(false);
  const [quickClientName, setQuickClientName] = useState('');
  const [cancelTarget, setCancelTarget] = useState(false);
  const queryClient = useQueryClient();
  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();
  const cancelMutation = useCancelAppointment();
  const statusMutation = useUpdateAppointmentStatus();

  const { data: modalTimeOff = [] } = useQuery({
    queryKey: ['dayTimeOff', form.date],
    queryFn: () => getDayTimeOff({ data: { date: form.date } }),
    enabled: !!form.date && open,
  });

  useEffect(() => { if (open) setForm(buildInitialState(mode)); }, [open, mode]);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) { setForm(p => ({ ...p, [k]: v })); }

  const selectedService = useMemo(() => services.find(s => s.id === form.serviceId) ?? null, [services, form.serviceId]);

  useEffect(() => {
    if (!selectedService) return;
    set('endTime', addMinutes(form.startTime, selectedService.durationMinutes));
  }, [form.serviceId, form.startTime]);

  // Validações
  const missingFields: string[] = [];
  let retroError = false;
  if (!form.clientId) missingFields.push('Cliente');
  if (!form.serviceId) missingFields.push('Serviço');
  if (!form.staffId) missingFields.push('Profissional');
  if (form.date && form.startTime) {
    const dt = new Date(joinISO(form.date, form.startTime));
    let r = dt < new Date();
    if (isEdit && r && appointment && dt.getTime() === new Date(appointment.startsAt).getTime()) r = false;
    if (r) retroError = true;
  }

  const conflict = useMemo(() => {
    if (!form.staffId || !form.date || !form.startTime || !form.endTime) return null;
    return hasTimeOffConflict(modalTimeOff, form.staffId, joinISO(form.date, form.startTime), joinISO(form.date, form.endTime));
  }, [modalTimeOff, form.staffId, form.date, form.startTime, form.endTime]);

  const canSubmit = missingFields.length === 0 && !retroError && !conflict && !!form.endTime;
  const isSaving = createMutation.isPending || updateMutation.isPending || cancelMutation.isPending || statusMutation.isPending;

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    queryClient.invalidateQueries({ queryKey: ['dayTimeOff'] });
    onClose();
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const sA = joinISO(form.date, form.startTime), eA = joinISO(form.date, form.endTime);
    if (isEdit && appointment) {
      updateMutation.mutate({ id: appointment.id, staffId: form.staffId, serviceId: form.serviceId, startsAt: sA, endsAt: eA, notes: form.notes || null }, { onSuccess: handleSuccess });
    } else {
      createMutation.mutate({ clientId: form.clientId, serviceId: form.serviceId, staffId: form.staffId, startsAt: sA, endsAt: eA, notes: form.notes || null }, { onSuccess: handleSuccess });
    }
  }

  function handleQuickStatus(status: 'confirmed' | 'completed' | 'cancelled') {
    if (!appointment) return;
    statusMutation.mutate({ id: appointment.id, status }, { onSuccess: handleSuccess });
  }

  const conflictLabel = conflict
    ? (() => {
        const r = conflict.reason ?? 'Folga';
        const s = new Date(conflict.startsAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
        const e = new Date(conflict.endsAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
        return `${r} (${s} — ${e})`;
      })()
    : null;

  const waHref = appointment?.clientPhone
    ? toWhatsAppHref(appointment.clientPhone, `Olá ${appointment.clientName}! Seu horário das ${timeFmt.format(new Date(appointment.startsAt))} para ${appointment.serviceName} está confirmado.`)
    : null;

  const errorsVisible = missingFields.length > 0 || retroError;

  return (
    <>
      <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
        <Dialog.Portal>
          {/* Overlay */}
          <Dialog.Overlay
            className={cn(
              'fixed inset-0 z-40 bg-black/30 backdrop-blur-sm',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
              'data-[state=open]:animate-in data-[state=open]:fade-in-0',
            )}
          />

          <Dialog.Content
            className={cn(
              'fixed z-50 flex flex-col',
              'inset-0 sm:inset-auto',
              'sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2',
              'sm:w-full sm:max-w-md',
              'max-h-[100dvh]',
              'bg-slate-900 border border-slate-700/30 ring-1 ring-slate-700/20 shadow-2xl',
              'sm:rounded-2xl focus:outline-none',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
              'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
              'pb-safe',
            )}
          >
            {/* Scroll container */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-700/20 px-5 py-4">
                <Dialog.Title className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  {isEdit ? 'Detalhes do agendamento' : 'Novo agendamento'}
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button type="button" className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-800/50 hover:text-slate-300">
                    <X className="h-4 w-4" />
                  </button>
                </Dialog.Close>
              </div>

              {/* Body */}
              <div className="flex flex-col gap-5 p-5">
                {isEdit && appointment && (
                  <>
                    {/* Nome + Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-bold text-slate-100">{appointment.clientName}</h3>
                        <p className="mt-0.5 truncate text-xs font-semibold uppercase tracking-wider text-cyan-400">{appointment.serviceName}</p>
                      </div>
                      <span className={cn('inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-700/30 bg-slate-800/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300')}>
                        <span className={cn('h-1.5 w-1.5 rounded-full', STATUS_CONFIG[appointment.status]?.dot)} />
                        {STATUS_CONFIG[appointment.status]?.label}
                      </span>
                    </div>

                    {/* Info cards */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className={infoCard}>
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400"><Clock className="h-3.5 w-3.5" /></div>
                        <div className="min-w-0"><p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">Horário</p><p className="text-xs font-bold text-slate-200 tabular-nums">{timeFmt.format(new Date(appointment.startsAt))}</p></div>
                      </div>
                      <div className={infoCard}>
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400"><DollarSign className="h-3.5 w-3.5" /></div>
                        <div className="min-w-0"><p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">Valor</p><p className="text-xs font-bold text-slate-200 tabular-nums">{appointment.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p></div>
                      </div>
                      <div className={infoCard}>
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400"><User className="h-3.5 w-3.5" /></div>
                        <div className="min-w-0"><p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">Profissional</p><p className="truncate text-xs font-bold text-slate-200">{appointment.staffName}</p></div>
                      </div>
                      <div className={infoCard}>
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400"><Scissors className="h-3.5 w-3.5" /></div>
                        <div className="min-w-0"><p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">Duração</p><p className="text-xs font-bold text-slate-200">{selectedService ? `${selectedService.durationMinutes}min` : '—'}</p></div>
                      </div>
                    </div>

                    {/* Quick actions */}
                    {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                      <div className="flex flex-wrap gap-1">
                        {appointment.status === 'pending' && (
                          <>
                            <button type="button" onClick={() => handleQuickStatus('confirmed')} disabled={isSaving}
                              className={cn(quickBtn, 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10')}><Check className="h-3 w-3" /> Confirmar</button>
                            <button type="button" onClick={() => setCancelTarget(true)} disabled={isSaving}
                              className={cn(quickBtn, 'border-red-500/20 text-red-400 hover:bg-red-500/10')}><X className="h-3 w-3" /> Cancelar</button>
                          </>
                        )}
                        {appointment.status === 'confirmed' && (
                          <>
                            <button type="button" onClick={() => handleQuickStatus('completed')} disabled={isSaving}
                              className={cn(quickBtn, 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10')}><CheckCheck className="h-3 w-3" /> Concluir</button>
                            <button type="button" onClick={() => setCancelTarget(true)} disabled={isSaving}
                              className={cn(quickBtn, 'border-red-500/20 text-red-400 hover:bg-red-500/10')}><X className="h-3 w-3" /> Cancelar</button>
                          </>
                        )}
                      </div>
                    )}

                    <div className="border-t border-slate-700/20" />
                  </>
                )}

                {/* Form */}
                <form id="appointment-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className={fieldLabel}>Cliente</label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <ClientCombobox value={form.clientId} disabled={isEdit}
                          onChange={id => set('clientId', id)}
                          onCreateNew={name => { setQuickClientName(name); setQuickClientOpen(true); }} />
                      </div>
                      {!isEdit && (
                        <button type="button" title="Cadastrar cliente rápido"
                          onClick={() => { setQuickClientName(''); setQuickClientOpen(true); }}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-400 transition-colors hover:bg-orange-500/20">
                          <UserPlus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className={fieldLabel}>Serviço</label>
                    <select className={fieldInput} value={form.serviceId} onChange={e => set('serviceId', e.target.value)}>
                      <option value="">Selecione…</option>
                      {services.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name}&nbsp;({s.durationMinutes}min)&nbsp;
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className={fieldLabel}>Profissional</label>
                    <select className={fieldInput} value={form.staffId} onChange={e => set('staffId', e.target.value)}>
                      <option value="">Selecione…</option>
                      {staff.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1.5">
                      <label className={fieldLabel}>Data</label>
                      <input type="date" className={fieldInput} value={form.date} onChange={e => set('date', e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={fieldLabel}>Início</label>
                      <input type="time" className={fieldInput} value={form.startTime} onChange={e => set('startTime', e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={fieldLabel}>Fim</label>
                      <input type="time" className={fieldInput} value={form.endTime} onChange={e => set('endTime', e.target.value)} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className={fieldLabel}>Observações (opcional)</label>
                    <textarea className={`${fieldInput} resize-none`} rows={1} value={form.notes} onChange={e => set('notes', e.target.value)} maxLength={1000} />
                  </div>

                  {conflict && (
                    <div className="rounded-lg border border-orange-500/25 bg-orange-500/8 px-3 py-2.5 text-xs text-orange-400">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>Horário conflita com <strong>{conflictLabel}</strong></span>
                      </div>
                    </div>
                  )}

                  <div className="h-16 sm:h-0" />
                </form>
              </div>
            </div>

            {/* Footer fixo */}
            <div className="shrink-0 border-t border-slate-700/20 bg-slate-900/80 backdrop-blur-xl px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {errorsVisible ? (
                    <div className="flex flex-col gap-0.5 text-right text-xs font-medium leading-tight text-orange-400">
                      {missingFields.length > 0 && <span>Falta: {missingFields.join(', ')}</span>}
                      {retroError && <span className="flex items-center justify-end gap-1"><AlertTriangle className="h-3 w-3" /> Data/hora no passado</span>}
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

            {/* ═══ ConfirmDialog DENTRO do portal — recebe cliques sem interferência ═══ */}
            <ConfirmDialog
              open={cancelTarget}
              onClose={() => setCancelTarget(false)}
              onConfirm={() => { handleQuickStatus('cancelled'); setCancelTarget(false); }}
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
        onCreated={c => set('clientId', c.id)}
      />
    </>
  );
}