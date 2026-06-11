// src/features/appointments/components/AppointmentFormModal.tsx
import { useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Trash2, Loader2, UserPlus } from 'lucide-react';
import { QuickClientModal } from './QuickClientModal';
import { ClientCombobox } from './ClientCombobox';
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

type Mode =
  | { kind: 'create'; defaults?: { staffId?: string; startsAt?: string } }
  | { kind: 'edit'; appointment: AppointmentItem };

interface Props {
  open: boolean;
  mode: Mode;
  clients: ClientOption[];
  services: ServiceOption[];
  staff: BookableStaffItem[];
  onClose: () => void;
}

const TZ_OFFSET = '-03:00';

/** ISO com offset -03:00 → { date:'YYYY-MM-DD', time:'HH:mm' } no fuso do studio. */
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

/** { date, time } no fuso do studio → ISO com offset -03:00. */
function joinISO(date: string, time: string): string {
  return new Date(`${date}T${time}:00${TZ_OFFSET}`).toISOString();
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
  onClose,
}: Props) {
  const isEdit = mode.kind === 'edit';
  const [form, setForm] = useState<FormState>(() => buildInitialState(mode));
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [quickClientOpen, setQuickClientOpen] = useState(false);
  const [quickClientName, setQuickClientName] = useState('');


  // Re-sincroniza quando reabre com outro mode (slot diferente / outro appt).
useEffect(() => {
  if (open) {
    setForm(buildInitialState(mode));
    setConfirmCancel(false);
    setQuickClientOpen(false);
    setQuickClientName('');
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [open, mode]);

  const createMut = useCreateAppointment();
  const updateMut = useUpdateAppointment();
  const cancelMut = useCancelAppointment();
  const isSaving = createMut.isPending || updateMut.isPending;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  /** Trocar serviço (no create) recalcula endTime a partir da duração. */
  function handleServiceChange(serviceId: string) {
    const svc = services.find((s) => s.id === serviceId);
    setForm((f) => ({
      ...f,
      serviceId,
      endTime:
        !isEdit && svc ? addMinutes(f.startTime, svc.durationMinutes) : f.endTime,
    }));
  }

  /** Mudar hora inicial (create) empurra a final mantendo a duração do serviço. */
  function handleStartChange(startTime: string) {
    const svc = services.find((s) => s.id === form.serviceId);
    setForm((f) => ({
      ...f,
      startTime,
      endTime:
        !isEdit && svc ? addMinutes(startTime, svc.durationMinutes) : f.endTime,
    }));
  }

  const errors = useMemo(() => {
    const e: string[] = [];
    if (!form.clientId) e.push('Selecione o cliente.');
    if (!form.serviceId) e.push('Selecione o serviço.');
    if (!form.staffId) e.push('Selecione o profissional.');
    if (form.endTime <= form.startTime)
      e.push('Horário final deve ser após o inicial.');
    return e;
  }, [form]);

  const canSubmit = errors.length === 0 && !isSaving;

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!canSubmit) return;

    const startsAt = joinISO(form.date, form.startTime);
    const endsAt = joinISO(form.date, form.endTime);
    const notes = form.notes.trim() ? form.notes.trim() : null;

    try {
      if (mode.kind === 'edit') {
        await updateMut.mutateAsync({
          id: mode.appointment.id,
          serviceId: form.serviceId,
          staffId: form.staffId,
          startsAt,
          endsAt,
          notes,
        });
      } else {
        await createMut.mutateAsync({
          clientId: form.clientId,
          serviceId: form.serviceId,
          staffId: form.staffId,
          startsAt,
          endsAt,
          notes,
        });
      }
      onClose();
    } catch {
      // toast já tratado nos hooks
    }
  }

  async function handleCancelAppointment() {
    if (mode.kind !== 'edit') return;
    try {
      await cancelMut.mutateAsync({ id: mode.appointment.id, reason: null });
      onClose();
    } catch {
      /* toast nos hooks */
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col rounded-card border border-border bg-surface shadow-md focus:outline-none">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <Dialog.Title className="text-lg font-bold tracking-tight text-text-body">
              {isEdit ? 'Editar agendamento' : 'Novo agendamento'}
            </Dialog.Title>
            <Dialog.Close
              className="inline-flex h-8 w-8 items-center justify-center rounded-pill text-text-muted transition-colors hover:bg-surface-2 hover:text-text-body"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 overflow-y-auto px-5 py-4"
          >
            {/* Cliente */}
            <div className="flex flex-col gap-1">
              <span className={fieldLabel}>Cliente</span>
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



            {/* Serviço */}
            <label className="flex flex-col gap-1">
              <span className={fieldLabel}>Serviço</span>
              <select
                className={fieldInput}
                value={form.serviceId}
                onChange={(e) => handleServiceChange(e.target.value)}
              >
                <option value="">Selecione…</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.durationMinutes} min)
                  </option>
                ))}
              </select>
            </label>

            {/* Profissional */}
            <label className="flex flex-col gap-1">
              <span className={fieldLabel}>Profissional</span>
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
            </label>

            {/* Data */}
            <label className="flex flex-col gap-1">
              <span className={fieldLabel}>Data</span>
              <input
                type="date"
                className={fieldInput}
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
              />
            </label>

            {/* Início / Fim */}
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className={fieldLabel}>Início</span>
                <input
                  type="time"
                  step={900}
                  className={fieldInput}
                  value={form.startTime}
                  onChange={(e) => handleStartChange(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className={fieldLabel}>Fim</span>
                <input
                  type="time"
                  step={900}
                  className={fieldInput}
                  value={form.endTime}
                  onChange={(e) => set('endTime', e.target.value)}
                />
              </label>
            </div>

            {/* Notas */}
            <label className="flex flex-col gap-1">
              <span className={fieldLabel}>Observações</span>
              <textarea
                rows={2}
                maxLength={1000}
                className={`${fieldInput} resize-none`}
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Opcional"
              />
            </label>

            {errors.length > 0 && (
              <p className="text-xs text-red-600">{errors[0]}</p>
            )}

            {/* Ações */}
            <div className="mt-1 flex items-center justify-between gap-2">
              {isEdit ? (
                confirmCancel ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={cancelMut.isPending}
                      onClick={handleCancelAppointment}
                      className="inline-flex items-center gap-1 rounded-button border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
                    >
                      {cancelMut.isPending && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      )}
                      Confirmar
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmCancel(false)}
                      className="rounded-button px-2.5 py-1.5 text-xs text-text-muted hover:text-text-body"
                    >
                      Voltar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmCancel(true)}
                    className="inline-flex items-center gap-1 rounded-button border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Cancelar agendamento
                  </button>
                )
              ) : (
                <span />
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center gap-1.5 rounded-button bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEdit ? 'Salvar' : 'Criar'}
              </button>
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
