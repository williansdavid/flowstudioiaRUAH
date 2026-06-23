// src/features/staff/components/DayRow.tsx
import { Plus, Trash2 } from 'lucide-react';
import type { DaySchedule } from '@/lib/scheduling/workingHours.schema';

interface DayRowProps {
  label: string;
  value: DaySchedule | null;
  onChange: (next: DaySchedule | null) => void;
  canEdit?: boolean;
}

export function DayRow({ label, value, onChange, canEdit = true }: DayRowProps) {
  const isWorking = value !== null;

  function toggleWorking(next: boolean) {
    onChange(next ? { start: '09:00', end: '18:00', breaks: [] } : null);
  }

  function patchDay(patch: Partial<DaySchedule>) {
    if (!value) return;
    onChange({ ...value, ...patch });
  }

  function addBreak() {
    if (!value) return;
    onChange({
      ...value,
      breaks: [...value.breaks, { start: '12:00', end: '13:00' }],
    });
  }

  function patchBreak(idx: number, field: 'start' | 'end', time: string) {
    if (!value) return;
    onChange({
      ...value,
      breaks: value.breaks.map((b, i) =>
        i === idx ? { ...b, [field]: time } : b,
      ),
    });
  }

  function removeBreak(idx: number) {
    if (!value) return;
    onChange({
      ...value,
      breaks: value.breaks.filter((_, i) => i !== idx),
    });
  }

  return (
    <div
      className={`rounded-2xl border border-slate-700/20 p-4 transition-colors duration-200 ${
        isWorking ? 'bg-slate-800/60' : 'bg-slate-800/30'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="font-semibold text-slate-100">
          {label}
        </span>

        <label
          className={`flex select-none items-center gap-2 text-sm ${
            canEdit ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
          }`}
        >
          <input
            type="checkbox"
            checked={isWorking}
            disabled={!canEdit}
            onChange={(e) => toggleWorking(e.target.checked)}
            className="h-4 w-4 accent-orange-500"
          />
          <span className={isWorking ? 'text-orange-400 font-semibold' : 'text-slate-500'}>
            {isWorking ? 'Trabalha' : 'Folga'}
          </span>
        </label>
      </div>

      {value && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <TimeField
              label="Início"
              value={value.start}
              disabled={!canEdit}
              onChange={(t) => patchDay({ start: t })}
            />
            <TimeField
              label="Fim"
              value={value.end}
              disabled={!canEdit}
              onChange={(t) => patchDay({ end: t })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Intervalos
              </span>
              {canEdit && (
                <button
                  type="button"
                  onClick={addBreak}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-orange-400 transition-colors hover:bg-orange-500/10"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  Adicionar
                </button>
              )}
            </div>

            {value.breaks.length === 0 && (
              <p className="text-sm text-slate-500">
                Nenhum intervalo.
              </p>
            )}

            {value.breaks.map((b, idx) => (
              <div key={idx} className="flex flex-wrap items-end gap-3">
                <TimeField
                  label="De"
                  value={b.start}
                  disabled={!canEdit}
                  onChange={(t) => patchBreak(idx, 'start', t)}
                />
                <TimeField
                  label="Até"
                  value={b.end}
                  disabled={!canEdit}
                  onChange={(t) => patchBreak(idx, 'end', t)}
                />
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => removeBreak(idx)}
                    className="mb-1 rounded-md p-1 text-red-400 transition-opacity hover:opacity-70"
                    aria-label="Remover intervalo"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TimeField({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (time: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-slate-500">{label}</span>
      <input
        type="time"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-700/30 bg-slate-800/60 px-2 py-1.5 text-sm text-slate-300 outline-none transition-shadow duration-200 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 disabled:opacity-60"
      />
    </label>
  );
}