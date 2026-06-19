// src/features/staff/components/WorkingHoursEditor.tsx
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { workingHoursSchema } from '@/lib/scheduling/workingHours.schema';
import type { WorkingHours, DaySchedule } from '@/lib/scheduling/workingHours.schema';
import { WEEKDAY_ORDER, WEEKDAY_LABEL } from '../types';
import { useUpdateStaffWorkingHours } from '../hooks';
import { DayRow } from './DayRow';

interface WorkingHoursEditorProps {
  staffId: string;
  initial: WorkingHours;
  canEdit: boolean;
  onDirtyChange?: (dirty: boolean) => void;
}

export function WorkingHoursEditor({
  staffId,
  initial,
  canEdit,
  onDirtyChange,
}: WorkingHoursEditorProps) {
  const [draft, setDraft] = useState<WorkingHours>(initial);
  const mutation = useUpdateStaffWorkingHours(staffId);
  const prevDirtyRef = useRef(false);

  // Notifica o pai quando o rascunho diverge do original
  useEffect(() => {
    const isDirty = JSON.stringify(draft) !== JSON.stringify(initial);
    if (isDirty !== prevDirtyRef.current) {
      prevDirtyRef.current = isDirty;
      onDirtyChange?.(isDirty);
    }
  }, [draft, initial, onDirtyChange]);

  // Atualiza a referência quando o initial muda (recarregou dados)
  useEffect(() => {
    prevDirtyRef.current = false;
  }, [initial]);

  function patchDay(key: keyof WorkingHours, value: DaySchedule | null) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    const parsed = workingHoursSchema.safeParse(draft);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      toast.error(first?.message ?? 'Grade inválida.');
      return;
    }
    mutation.mutate(
      { staffId, workingHours: parsed.data },
      {
        onSuccess: () => {
          onDirtyChange?.(false);
          prevDirtyRef.current = false;
        },
      },
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden p-5"
      style={{
        backgroundColor: 'var(--color-surface-2)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-60"
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--color-accent) 50%, transparent)',
        }}
      />
      <div className="mb-5 flex items-center gap-2.5">
        <span
          className="shrink-0 rounded-xl p-2"
          style={{
            backgroundColor:
              'color-mix(in srgb, var(--color-accent) 14%, transparent)',
            color: 'var(--color-accent-bright)',
            boxShadow:
              'inset 0 0 0 1px color-mix(in srgb, var(--color-accent) 25%, transparent)',
          }}
        >
          <CalendarClock className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p
            className="text-[11px] font-semibold uppercase leading-none tracking-[0.14em]"
            style={{ color: 'var(--color-accent-bright)' }}
          >
            Horários de trabalho
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {WEEKDAY_ORDER.map((key, index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.28,
              delay: index * 0.04,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <DayRow
              label={WEEKDAY_LABEL[key] ?? key}
              value={draft[key]}
              onChange={(next) => patchDay(key, next)}
              canEdit={canEdit}
            />
          </motion.div>
        ))}
      </div>
      {canEdit && (
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} isLoading={mutation.isPending}>
            Salvar horários
          </Button>
        </div>
      )}
    </motion.div>
  );
}