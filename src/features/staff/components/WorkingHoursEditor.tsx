// src/features/staff/components/WorkingHoursEditor.tsx
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/features/utils/ui/Button';
import { workingHoursSchema } from '@/lib/scheduling/workingHours.schema';
import type { WorkingHours, DaySchedule } from '@/lib/scheduling/workingHours.schema';
import { WEEKDAY_ORDER, WEEKDAY_LABEL } from '../types';
import { staffWorkingHoursQuery, useUpdateStaffWorkingHours } from '../hooks';
import { DayRow } from './DayRow';
import { buildDefaultWorkingHours } from '../utils/defaultWorkingHours';
import { useNavigate } from '@tanstack/react-router';

interface WorkingHoursEditorProps {
  staffId: string;
  canEdit: boolean;
  onDirtyChange?: (dirty: boolean) => void;
}

export function WorkingHoursEditor({
  staffId,
  canEdit,
  onDirtyChange,
}: WorkingHoursEditorProps) {
  const { data } = useQuery(staffWorkingHoursQuery(staffId));
  const initialWorkingHours = data?.workingHours ?? buildDefaultWorkingHours();

  const [draft, setDraft] = useState<WorkingHours>(initialWorkingHours);
  const mutation = useUpdateStaffWorkingHours(staffId);
  const prevDirtyRef = useRef(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(initialWorkingHours);

  // Sincroniza draft quando o dado da query é refetchado (ex: após salvar)
  useEffect(() => {
    setDraft(initialWorkingHours);
  }, [data?.workingHours]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (dirty !== prevDirtyRef.current) {
      prevDirtyRef.current = dirty;
      onDirtyChange?.(dirty);
    }
  }, [dirty, onDirtyChange]);

  useEffect(() => {
    prevDirtyRef.current = false;
  }, [initialWorkingHours]);

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

  const navigate = useNavigate();
  function handleCancel() {
    navigate({ to: '/admin/equipe' });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-2xl border border-slate-700/20 bg-slate-800/40 p-5 shadow-md"
    >
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/25">
          <CalendarClock className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-orange-400">
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
        <div className="sticky bottom-0 -mx-5 -mb-5 mt-6 flex items-center justify-between border-t border-slate-700/20 bg-slate-900/90 backdrop-blur-xl px-5 py-4 rounded-b-2xl">
          {dirty ? (
            <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-400">
              Alterações não salvas
            </span>
          ) : (
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              —
            </span>
          )}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} isLoading={mutation.isPending} size="sm">
              Salvar horários
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}