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
import { X, Trash2, Loader2, UserPlus } from 'lucide-react';
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
import { validateAppointmentHours } from '@/sites/ruah/utils/validateAppointmentHours';

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
 *
 * ANTES (bugado):
 *   const d = new Date(`${date}T${time}:00`);       // interpreta no fuso LOCAL do processo
 *   const utcTime = d.getTime() + 3 * 60 * 60 * 1000; // soma +3h manual
 *   return new Date(utcTime).toISOString();           // dupla conversão → dia errado
 *
 * DEPOIS (correto):
 *   Usa offset explícito "-03:00" → São Paulo fixo, sem depender do fuso do ambiente.
 *   new Date() parseia o offset e retorna o instante correto em UTC internamente.
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
  businessHours,
  onClose,
}: Props) {
  const isEdit = mode.kind === 'edit';
  const [form, setForm] = useState<FormState>(() => buildInitialState(mode));
  const [quickClientOpen, setQuickClientOpen] = useState(false);
  const [quickClientName, setQuickClientName] = useState('');

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

  const validationError = useMemo(() => {
    if (!form.date || !form.startTime || !form.endTime) return null;
    return validateAppointmentHours({
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      hours: businessHours,
    });
  }, [form.date, form.startTime, form.endTime, businessHours]);

  const canSubmit =
    form.clientId &&
    form.serviceId &&
    form.staffId &&
    form.date &&
    form.startTime &&
    form.endTime &&
    !validationError;

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    cancelMutation.isPending;

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
        { onSuccess: onClose },
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
        { onSuccess: onClose },
      );
    }
  }

  function handleDelete() {
    if (!isEdit) return;
    const a = (mode as { kind: 'edit'; appointment: AppointmentItem }).appointment;
    cancelMutation.mutate({ id: a.id }, { onSuccess: onClose });
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
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-button border border-border bg-surface text-text-muted hover:bg-surface-2 hover:text-text-body"
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

            {validationError && (
              <p className="text-xs text-red-600">{validationError}</p>
            )}

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

            {/* Ações */}
            <div className="flex items-center justify-between pt-1">
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
                <span />
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
