// src/features/staff/components/TimeOffFormModal.tsx
import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { joinISO, splitISO, nextRoundHour, formatRange } from '@/lib/studioTime';
import { useCreateTimeOff, useUpdateTimeOff, type TimeOffItem } from '../hooks';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

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

const fieldLabel = 'text-[11px] font-semibold uppercase tracking-widest text-slate-400';
const fieldInput =
  'w-full rounded-lg border border-slate-700/30 bg-slate-800/60 px-3 py-2.5 text-sm text-slate-300 outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 focus:bg-slate-800';

function buildInitialState(mode: Mode): FormState {
  if (mode.kind === 'edit') {
    const start = splitISO(mode.timeOff.startsAt);
    const end = splitISO(mode.timeOff.endsAt);
    return {
      date: start.date,
      startTime: start.time,
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
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/20 backdrop-blur-md data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />

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
                {isEdit ? 'Editar folga' : 'Nova folga / bloqueio'}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-800/50 hover:text-slate-300"
                  aria-label="Fechar"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>

            {/* Form body */}
            <form
              id="timeoff-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-5 p-5"
            >
              <label className="flex flex-col gap-1.5">
                <span className={fieldLabel}>Data</span>
                <input
                  type="date"
                  className={fieldInput}
                  value={form.date}
                  onChange={(e) => set('date', e.target.value)}
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className={fieldLabel}>Início</span>
                  <input
                    type="time"
                    step={900}
                    className={fieldInput}
                    value={form.startTime}
                    onChange={(e) => set('startTime', e.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
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

              <label className="flex flex-col gap-1.5">
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
                <p className="text-xs text-red-400">{errors[0]}</p>
              )}
              {conflictMsg && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-orange-500/25 bg-orange-500/8 px-3 py-2.5 text-xs font-medium text-orange-400"
                >
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{conflictMsg}</span>
                </div>
              )}

              {/* Spacer pro footer fixo não encobrir o form */}
              <div className="h-16 sm:h-0" />
            </form>
          </div>

          {/* ═══ FOOTER FIXO — vidro premium ═══ */}
          <div className="shrink-0 border-t border-slate-700/20 bg-slate-900/80 backdrop-blur-xl px-5 py-4">
            <div className="flex items-center justify-end gap-3">
              {errors.length > 0 && (
                <span className="text-right text-xs font-medium text-red-400">
                  {errors[0]}
                </span>
              )}
              {conflictMsg && (
                <span className="text-right text-xs font-medium text-orange-400 leading-tight max-w-[200px]">
                  Conflito detectado
                </span>
              )}
              <Button
                type="submit"
                form="timeoff-form"
                variant="primary"
                size="sm"
                disabled={!canSubmit}
                isLoading={isSaving}
              >
                {isEdit ? 'Salvar' : 'Adicionar'}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}