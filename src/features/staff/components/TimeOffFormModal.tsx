// src/features/staff/components/TimeOffFormModal.tsx
import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2 } from 'lucide-react';
import { joinISO, splitISO, nextRoundHour, formatRange } from '@/lib/studioTime';
import { useCreateTimeOff, useUpdateTimeOff, type TimeOffItem } from '../hooks';

type Mode =
  | { kind: 'create' }
  | { kind: 'edit'; timeOff: TimeOffItem };

interface Props {
  open: boolean;
  mode: Mode;
  staffId: string;
  onClose: () => void;
}

interface FormState {
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}

function buildInitialState(mode: Mode): FormState {
  if (mode.kind === 'edit') {
    const start = splitISO(mode.timeOff.startsAt);
    const end = splitISO(mode.timeOff.endsAt);
    return {
      date: start.date,
      startTime: start.time,
      // se a folga cruza dias, o input fim usa o time do fim mas a data base é a de início
      endTime: end.time,
      reason: mode.timeOff.reason ?? '',
    };
  }
  const base = nextRoundHour();
  return {
    date: base.date,
    startTime: base.time,
    endTime: `${String(Math.min(Number(base.time.slice(0, 2)) + 1, 23)).padStart(2, '0')}:00`,
    reason: '',
  };
}

const fieldLabel = 'text-xs font-medium text-text-muted';
const fieldInput =
  'w-full rounded-button border border-border bg-surface px-3 py-2 text-sm text-text-body outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary';

export function TimeOffFormModal({ open, mode, staffId, onClose }: Props) {
  const isEdit = mode.kind === 'edit';
  const [form, setForm] = useState<FormState>(() => buildInitialState(mode));
  const [conflictMsg, setConflictMsg] = useState<string | null>(null);

  const createMut = useCreateTimeOff(staffId);
  const updateMut = useUpdateTimeOff(staffId);
  const isSaving = createMut.isPending || updateMut.isPending;

  useEffect(() => {
    if (open) {
      setForm(buildInitialState(mode));
      setConflictMsg(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const errors = useMemo(() => {
    const e: string[] = [];
    if (!form.date) e.push('Informe a data.');
    if (form.endTime <= form.startTime)
      e.push('Horário final deve ser após o inicial.');
    return e;
  }, [form]);

  const canSubmit = errors.length === 0 && !isSaving;

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!canSubmit) return;
    setConflictMsg(null);

    const startsAt = joinISO(form.date, form.startTime);
    const endsAt = joinISO(form.date, form.endTime);
    const reason = form.reason.trim() ? form.reason.trim() : null;

    try {
      const res =
        mode.kind === 'edit'
          ? await updateMut.mutateAsync({
              id: mode.timeOff.id,
              staffId,
              startsAt,
              endsAt,
              reason,
            })
          : await createMut.mutateAsync({ staffId, startsAt, endsAt, reason });

      if (res.ok) {
        onClose();
        return;
      }
      if (res.reason === 'CONFLICT') {
        const labels = res.conflicts
          .map((c) => formatRange(c.startsAt, c.endsAt))
          .join(', ');
        setConflictMsg(
          `Conflito com ${res.conflicts.length} agendamento(s)/folga(s): ${labels}`,
        );
      } else {
        setConflictMsg('Sem permissão para esta ação.');
      }
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
              {isEdit ? 'Editar folga' : 'Nova folga / bloqueio'}
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
            <label className="flex flex-col gap-1">
              <span className={fieldLabel}>Data</span>
              <input
                type="date"
                className={fieldInput}
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className={fieldLabel}>Início</span>
                <input
                  type="time"
                  step={900}
                  className={fieldInput}
                  value={form.startTime}
                  onChange={(e) => set('startTime', e.target.value)}
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

            <label className="flex flex-col gap-1">
              <span className={fieldLabel}>Motivo</span>
              <textarea
                rows={2}
                maxLength={500}
                className={`${fieldInput} resize-none`}
                value={form.reason}
                onChange={(e) => set('reason', e.target.value)}
                placeholder="Opcional (ex: férias, consulta médica)"
              />
            </label>

            {errors.length > 0 && (
              <p className="text-xs text-red-600">{errors[0]}</p>
            )}
            {conflictMsg && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-button border border-amber-300 bg-amber-100 px-3 py-2.5 text-sm font-medium text-amber-900"
              >
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>{conflictMsg}</span>
              </div>
            )}

            <div className="mt-1 flex items-center justify-end">
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center gap-1.5 rounded-button bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEdit ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
