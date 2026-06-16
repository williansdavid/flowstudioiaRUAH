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
      className="p-4 transition-colors duration-200"
      style={{
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--color-border)',
        backgroundColor: isWorking
          ? 'color-mix(in srgb, var(--color-accent) 5%, transparent)'
          : 'var(--color-surface)',
      }}
    >
      {/* Cabeçalho do dia: nome + toggle */}
      <div className="flex items-center justify-between gap-4">
        <span
          className="font-medium"
          style={{ color: 'var(--color-text-heading)' }}
        >
          {label}
        </span>

        <label
          className={`flex select-none items-center gap-2 text-sm ${
            canEdit ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
          }`}
          style={{
            color: isWorking
              ? 'var(--color-accent-bright)'
              : 'var(--color-text-muted)',
          }}
        >
          <input
            type="checkbox"
            checked={isWorking}
            disabled={!canEdit}
            onChange={(e) => toggleWorking(e.target.checked)}
            className="h-4 w-4"
            style={{ accentColor: 'var(--color-accent)' }}
          />
          {isWorking ? 'Trabalha' : 'Folga'}
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
              <span
                className="text-sm"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Intervalos
              </span>
              {canEdit && (
                <button
                  type="button"
                  onClick={addBreak}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors duration-200"
                  style={{ color: 'var(--color-accent-bright)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      'color-mix(in srgb, var(--color-accent) 10%, transparent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Plus className="h-4 w-4" aria-hidden /> Adicionar
                </button>
              )}
            </div>

            {value.breaks.length === 0 && (
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
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
                    className="mb-1 rounded-md p-1 transition-opacity duration-200 hover:opacity-70"
                    style={{ color: 'var(--color-danger)' }}
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
      <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <input
        type="time"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md px-2 py-1 outline-none transition-shadow duration-200 disabled:opacity-60"
        style={{
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface-2)',
          color: 'var(--color-text-heading)',
        }}
      />
    </label>
  );
}
