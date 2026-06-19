// src/features/appointments/components/AppointmentFormModal.tsx
//
// CORREÇÃO BUG DIA -1:
// A função joinISO anterior somava manualmente +3h (UTC-3 → UTC), mas as strings
// geradas pelo browser com new Date(`${date}T${time}:00`) já são interpretadas
// no horário LOCAL da máquina. Se o servidor (Vercel/Node) também está em UTC,
// a soma de +3h causava dupla conversão: horário ficava 3h adiantado / data virava
// dia seguinte (ou anterior dependendo do horário), produzindo o bug do "dia -1".
//
// SOLUÇÃO: usar o construtor com offset explícito "-03:00" para forçar fuso fixo
// de São Paulo independente do fuso do servidor ou do navegador.

import { useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Trash2, Loader2, UserPlus, AlertTriangle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { QuickClientModal } from './QuickClientModal';
import { ClientCombobox } from './ClientCombobox';
import { Button } from '@/components/ui/Button';

import type {
  AppointmentItem,
  BookableStaffItem,
  ClientOption,
  ServiceOption,
} from '../types';
import {
  useCreateAppointment,
  useUpdateAppointment,
  useCancelAppointment,
} from '../hooks';
import type { BusinessHours } from '@/sites/ruah/types';

type Mode =
  | { kind: 'create'; defaults?: { staffId?: string; startsAt?: string } }
  | { kind: 'edit'; appointment: AppointmentItem };

interface Props {
  open: boolean;
  mode: Mode;
  clients: ClientOption[];
  services: ServiceOption[];
  staff: BookableStaffItem[];
  businessHours: BusinessHours;
  onClose: () => void;
}

/**
 * ISO datetime → { date:'YYYY-MM-DD', time:'HH:mm' } no fuso de São Paulo.
 * Usa Intl.DateTimeFormat com timeZone explícito — funciona igual em servidor e browser.
 */
function splitISO(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const fmt = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  // sv-SE → "YYYY-MM-DD HH:mm"
  const [date, time] = fmt.format(d).split(' ');
  return { date: date!, time: time! };
}

/**
 * ✅ CORREÇÃO BUG DIA -1:
 * { date:'YYYY-MM-DD', time:'HH:mm' } no fuso de São Paulo → ISO UTC.
 */
function joinISO(date: string, time: string): string {
  return new Date(`${date}T${time}:00-03:00`).toISOString();
}

/** Próxima hora cheia (fuso studio) como default do create sem slot. */
function nextRoundHour(): { date: string; time: string } {
  const now = new Date();
  const { date } = splitISO(now.toISOString());
  const hh = Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      hour12: false,
    }).format(now),
  );
  const next = Math.min(hh + 1, 23);
  return { date, time: `${String(next).padStart(2, '0')}:00` };
}

/** Soma minutos a um 'HH:mm', sem virar o dia (clamp em 23:59). */
function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = Math.min(h! * 60 + m! + minutes, 23 * 60 + 59);
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

interface FormState {
  clientId: string;
  serviceId: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes: string;
}

function buildInitialState(mode: Mode): FormState {
  if (mode.kind === 'edit') {
    const a = mode.appointment;
    const start = splitISO(a.startsAt);
    const end = splitISO(a.endsAt);
    return {
      clientId: a.clientId,
      serviceId: a.serviceId,
      staffId: a.staffId,
      date: start.date,
      startTime: start.time,
      endTime: end.time,
      notes: a.notes ?? '',
    };
  }

  const base = mode.defaults?.startsAt
    ? splitISO(mode.defaults.startsAt)
    : nextRoundHour();

  return {
    clientId: '',
    serviceId: '',
    staffId: mode.defaults?.staffId ?? '',
    date: base.date,
    startTime: base.time,
    endTime: addMinutes(base.time, 30),
    notes: '',
  };
}

const fieldLabel = 'text-xs font-medium text-text-muted';
const fieldInput =
  'w-full rounded-button border border-border bg-surface px-3 py-2 text-sm text-text-body outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary';

export function AppointmentFormModal({
  open,
  mode,
  clients,
  services,
  staff,
  businessHours, // Mantido na prop para compatibilidade, mas não bloqueia mais o Admin
  onClose,
}: Props) {
  const isEdit = mode.kind === 'edit';
  const [form, setForm] = useState<FormState>(() => buildInitialState(mode));

  const [quickClientOpen, setQuickClientOpen] = useState(false);
  const [quickClientName, setQuickClientName] = useState('');

  const queryClient = useQueryClient();
  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();
  const cancelMutation = useCancelAppointment();

  // Reseta o formulário sempre que o modal abre ou o mode muda
  useEffect(() => {
    if (open) {
      setForm(buildInitialState(mode));
    }
  }, [open, mode]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Quando serviço muda, auto-preenche endTime com base na duração
  const selectedService = useMemo(
    () => services.find((s) => s.id === form.serviceId) ?? null,
    [services, form.serviceId],
  );

  useEffect(() => {
    if (!selectedService) return;
    set('endTime', addMinutes(form.startTime, selectedService.durationMinutes));
  }, [form.serviceId, form.startTime]);

  // VALIDAÇÕES DINÂMICAS (Campos Obrigatórios e Data Retroativa)
  const missingFields: string[] = [];
  let isRetroactiveError = false;
  
  if (!form.clientId) missingFields.push('Cliente');
  if (!form.serviceId) missingFields.push('Serviço');
  if (!form.staffId) missingFields.push('Profissional');

  if (form.date && form.startTime) {
    const selectedDate = new Date(joinISO(form.date, form.startTime));
    const now = new Date();
    
    let isRetroactive = selectedDate < now;
    
    // Se for edição, permite salvar se o horário não foi alterado (ex: apenas adicionando observação num agendamento passado)
    if (isEdit && isRetroactive) {
      const originalA = (mode as { kind: 'edit'; appointment: AppointmentItem }).appointment;
      const originalStart = new Date(originalA.startsAt);
      if (selectedDate.getTime() === originalStart.getTime()) {
        isRetroactive = false;
      }
    }

    if (isRetroactive) {
      isRetroactiveError = true;
    }
  }

  const canSubmit = missingFields.length === 0 && !isRetroactiveError && !!form.endTime;

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    cancelMutation.isPending;

  // Função centralizada para invalidar a query e fechar o modal
  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    onClose();
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    const startsAt = joinISO(form.date, form.startTime);
    const endsAt = joinISO(form.date, form.endTime);

    if (isEdit) {
      const a = (mode as { kind: 'edit'; appointment: AppointmentItem }).appointment;
      updateMutation.mutate(
        {
          id: a.id,
          staffId: form.staffId,
          serviceId: form.serviceId,
          startsAt,
          endsAt,
          notes: form.notes || null,
        },
        { onSuccess: handleSuccess },
      );
    } else {
      createMutation.mutate(
        {
          clientId: form.clientId,
          serviceId: form.serviceId,
          staffId: form.staffId,
          startsAt,
          endsAt,
          notes: form.notes || null,
        },
        { onSuccess: handleSuccess },
      );
    }
  }

  function handleDelete() {
    if (!isEdit) return;
    const a = (mode as { kind: 'edit'; appointment: AppointmentItem }).appointment;
    cancelMutation.mutate({ id: a.id }, { onSuccess: handleSuccess });
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-card border border-border bg-surface p-6 shadow-xl focus:outline-none">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-base font-bold">
              {isEdit ? 'Editar agendamento' : 'Novo agendamento'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-button p-1 text-text-muted hover:bg-surface-2 hover:text-text-body"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Cliente */}
            <div className="flex flex-col gap-1">
              <label className={fieldLabel}>Cliente</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <ClientCombobox
                    clients={clients}
                    value={form.clientId}
                    disabled={isEdit}
                    onChange={(id) => set('clientId', id)}
                    onCreateNew={(name) => {
                      setQuickClientName(name);
                      setQuickClientOpen(true);
                    }}
                  />
                </div>
                {!isEdit && (
                  <button
                    type="button"
                    title="Cadastrar cliente rápido"
                    onClick={() => {
                      setQuickClientName('');
                      setQuickClientOpen(true);
                    }}
                    // DESTAQUE COM A COR PRIMARY DO SEU TEMA 👇
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-button border border-primary/30 bg-primary/10 text-primary transition-colors hover:bg-primary/20 hover:text-primary-hover"
                  >
                    <UserPlus className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Serviço */}
            <div className="flex flex-col gap-1">
              <label className={fieldLabel}>Serviço</label>
              <select
                className={fieldInput}
                value={form.serviceId}
                onChange={(e) => set('serviceId', e.target.value)}
              >
                <option value="">Selecione…</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.durationMinutes}min)
                  </option>
                ))}
              </select>
            </div>

            {/* Profissional */}
            <div className="flex flex-col gap-1">
              <label className={fieldLabel}>Profissional</label>
              <select
                className={fieldInput}
                value={form.staffId}
                onChange={(e) => set('staffId', e.target.value)}
              >
                <option value="">Selecione…</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Data e Horários */}
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <label className={fieldLabel}>Data</label>
                <input
                  type="date"
                  className={fieldInput}
                  value={form.date}
                  onChange={(e) => set('date', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className={fieldLabel}>Início</label>
                <input
                  type="time"
                  className={fieldInput}
                  value={form.startTime}
                  onChange={(e) => set('startTime', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className={fieldLabel}>Fim</label>
                <input
                  type="time"
                  className={fieldInput}
                  value={form.endTime}
                  onChange={(e) => set('endTime', e.target.value)}
                />
              </div>
            </div>

            {/* Observações */}
            <div className="flex flex-col gap-1">
              <label className={fieldLabel}>Observações (opcional)</label>
              <textarea
                className={`${fieldInput} resize-none`}
                rows={2}
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                maxLength={1000}
              />
            </div>

            {/* Ações e Erros */}
            <div className="flex items-center justify-between pt-2">
              {isEdit ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 rounded-button px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {cancelMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Excluir
                </button>
              ) : (
                <span /> // Spacer para manter o alinhamento
              )}
              
              <div className="flex items-center gap-3">
                {/* Validações em Laranja */}
                {(missingFields.length > 0 || isRetroactiveError) && (
                  <div className="flex flex-col items-end text-sm font-medium text-orange-500 text-right max-w-[250px] leading-tight gap-1">
                    {missingFields.length > 0 && (
                      <span>Falta: {missingFields.join(', ')}</span>
                    )}
                    {isRetroactiveError && (
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4" />
                        Data/hora no passado
                      </span>
                    )}
                  </div>
                )}
                
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!canSubmit}
                  isLoading={isSaving}
                >
                  {isEdit ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </div>
          </form>

          <QuickClientModal
            open={quickClientOpen}
            initialName={quickClientName}
            onClose={() => setQuickClientOpen(false)}
            onCreated={(client) => set('clientId', client.id)}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}