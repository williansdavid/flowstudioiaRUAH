// src/features/staff/components/StaffTimeOffManager.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Loader2, CalendarOff } from 'lucide-react';
import { formatRange } from '@/lib/studioTime';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import {
  useStaffTimeOff,
  useDeleteTimeOff,
  type TimeOffItem,
} from '../hooks';
import { TimeOffFormModal } from './TimeOffFormModal';

interface Props {
  staffId: string;
  canEdit: boolean;
}

type ModalState =
  | { open: false }
  | { open: true; mode: { kind: 'create' } | { kind: 'edit'; timeOff: TimeOffItem } };

export function StaffTimeOffManager({ staffId, canEdit }: Props) {
  const { data, isLoading, isError, refetch } = useStaffTimeOff(staffId);
  const deleteMut = useDeleteTimeOff(staffId);
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-2xl border border-slate-700/20 bg-slate-800/40 p-5 shadow-md"
    >
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/25">
            <CalendarOff className="h-5 w-5" aria-hidden />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-bold leading-none tracking-tight text-slate-100">
              Folgas e bloqueios
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Períodos sem agendamentos
            </p>
          </div>
        </div>

        {canEdit && (
          <Button
            variant="primary"
            onClick={() => setModal({ open: true, mode: { kind: 'create' } })}
            className="shrink-0"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Adicionar
          </Button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Carregando folgas…
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-start gap-2 py-6 text-sm">
          <span className="text-red-400">Falha ao carregar folgas.</span>
          <Button type="button" variant="ghost" size="sm" onClick={() => void refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Empty */}
      {data && data.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <CalendarOff className="h-8 w-8 text-slate-600" aria-hidden />
          <p className="text-sm text-slate-500">Nenhuma folga cadastrada.</p>
        </div>
      )}

      {/* List */}
      {data && data.length > 0 && (
        <ul className="flex flex-col">
          {data.map((item, index) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.28,
                delay: index * 0.04,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={cn(
                'flex items-center justify-between gap-3 py-3',
                index !== 0 && 'border-t border-slate-700/20',
              )}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-200">
                  {formatRange(item.startsAt, item.endsAt)}
                </p>
                {item.reason && (
                  <p className="truncate text-xs text-slate-500">
                    {item.reason}
                  </p>
                )}
              </div>

              {canEdit && (
                <div className="flex shrink-0 items-center gap-1">
                  {confirmId === item.id ? (
                    <>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        disabled={deleteMut.isPending}
                        isLoading={deleteMut.isPending}
                        onClick={async () => {
                          await deleteMut.mutateAsync({ id: item.id });
                          setConfirmId(null);
                        }}
                      >
                        Confirmar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmId(null)}
                      >
                        Voltar
                      </Button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        aria-label="Editar folga"
                        onClick={() =>
                          setModal({
                            open: true,
                            mode: { kind: 'edit', timeOff: item },
                          })
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-orange-500/10 hover:text-slate-200"
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        aria-label="Remover folga"
                        onClick={() => setConfirmId(item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-red-400 transition-colors hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </>
                  )}
                </div>
              )}
            </motion.li>
          ))}
        </ul>
      )}

      {modal.open && (
        <TimeOffFormModal
          open={modal.open}
          mode={modal.mode}
          staffId={staffId}
          onClose={() => setModal({ open: false })}
        />
      )}
    </motion.section>
  );
}