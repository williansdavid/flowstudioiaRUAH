// src/features/staff/components/StaffTimeOffManager.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Loader2, CalendarOff } from 'lucide-react';
import { formatRange } from '@/lib/studioTime';
import { Button } from '@/components/ui/Button';
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
      className="relative overflow-hidden p-5"
      style={{
        backgroundColor: 'var(--color-surface-2)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Filete dourado superior — assinatura Art Deco */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-60"
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--color-accent) 50%, transparent)',
        }}
      />

      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
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
            <CalendarOff className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h3
              className="text-base font-semibold leading-none tracking-tight"
              style={{
                fontFamily: 'var(--font-heading)',
                color: 'var(--color-text-heading)',
              }}
            >
              Folgas e bloqueios
            </h3>
            <p
              className="mt-1 text-sm"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Períodos sem agendamentos
            </p>
          </div>
        </div>

        {canEdit && (
          <Button
            variant="ghost"
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
        <div
          className="flex items-center gap-2 py-8 text-sm"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Carregando folgas…
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-start gap-2 py-6 text-sm">
          <span style={{ color: 'var(--color-danger)' }}>
            Falha ao carregar folgas.
          </span>
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-md px-3 py-1.5 text-xs transition-colors duration-200"
            style={{
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-heading)',
            }}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Empty */}
      {data && data.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <CalendarOff
            className="h-8 w-8"
            style={{ color: 'var(--color-text-muted)', opacity: 0.5 }}
            aria-hidden
          />
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Nenhuma folga cadastrada.
          </p>
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
              className="flex items-center justify-between gap-3 py-3"
              style={{
                borderTop:
                  index === 0 ? 'none' : '1px solid var(--color-border)',
              }}
            >
              <div className="min-w-0">
                <p
                  className="truncate text-sm font-medium"
                  style={{ color: 'var(--color-text-heading)' }}
                >
                  {formatRange(item.startsAt, item.endsAt)}
                </p>
                {item.reason && (
                  <p
                    className="truncate text-xs"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {item.reason}
                  </p>
                )}
              </div>

              {canEdit && (
                <div className="flex shrink-0 items-center gap-1">
                  {confirmId === item.id ? (
                    <>
                      <button
                        type="button"
                        disabled={deleteMut.isPending}
                        onClick={async () => {
                          await deleteMut.mutateAsync({ id: item.id });
                          setConfirmId(null);
                        }}
                        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors duration-200 disabled:opacity-50"
                        style={{
                          border:
                            '1px solid color-mix(in srgb, var(--color-danger) 35%, transparent)',
                          backgroundColor:
                            'color-mix(in srgb, var(--color-danger) 10%, transparent)',
                          color: 'var(--color-danger)',
                        }}
                      >
                        {deleteMut.isPending && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                        )}
                        Confirmar
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmId(null)}
                        className="rounded-md px-2.5 py-1.5 text-xs transition-colors duration-200"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        Voltar
                      </button>
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
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-200"
                        style={{ color: 'var(--color-text-muted)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            'color-mix(in srgb, var(--color-accent) 10%, transparent)';
                          e.currentTarget.style.color =
                            'var(--color-text-heading)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color =
                            'var(--color-text-muted)';
                        }}
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        aria-label="Remover folga"
                        onClick={() => setConfirmId(item.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-200"
                        style={{ color: 'var(--color-danger)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            'color-mix(in srgb, var(--color-danger) 10%, transparent)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
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
