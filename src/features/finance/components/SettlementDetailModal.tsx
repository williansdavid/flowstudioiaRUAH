// src/features/finance/components/SettlementDetailModal.tsx
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  CheckCircle2,
  CheckSquare,
  Loader2,
  Square,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { getStaffCommissionDetail } from '../server/getStaffCommissionDetail';
import { settleCommission } from '../server/settleCommission';
import type { StaffCommissionSummary, FinancePeriod, PeriodRange } from '../types';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

interface Props {
  staff: StaffCommissionSummary;
  open: boolean;
  onClose: () => void;
  period: { period: FinancePeriod; customRange?: PeriodRange };
  allowSettlement?: boolean;
}

export function SettlementDetailModal({ staff, open, onClose, period, allowSettlement = false }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const detailQuery = useQuery({
    queryKey: [
      'finance', 'settlement', 'detail', staff.staffId,
      period.period, period.customRange,
    ],
    queryFn: () => getStaffCommissionDetail({ data: { staffId: staff.staffId, ...period } }),
    enabled: open,
  });

  const settleMutation = useMutation({
    mutationFn: (transactionIds: string[]) =>
      settleCommission({ data: { transactionIds } }),
    onSuccess: () => {
      toast.success('Comissões acertadas com sucesso!');
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ['finance', 'settlement'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'settlement', 'detail', staff.staffId] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'summary'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'byStaff'] });
    },
    onError: (error) => {
      toast.error('Erro ao acertar comissões: ' + String(error));
    },
  });

  if (!open) return null;

  const pendingRows = detailQuery.data?.filter((t) => !t.isSettled) ?? [];
  const settledRows = detailQuery.data?.filter((t) => t.isSettled) ?? [];
  const allPendingSelected = pendingRows.length > 0 && pendingRows.every((r) => selectedIds.has(r.id));
  const hasSelection = selectedIds.size > 0;

  function toggleAll() {
    if (allPendingSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingRows.map((r) => r.id)));
    }
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSettle() {
    if (selectedIds.size === 0) return;
    settleMutation.mutate(Array.from(selectedIds));
  }
  // ─── Soma das comissões selecionadas ───
  const selectedTotal = detailQuery.data
    ?.filter((tx) => selectedIds.has(tx.id))
    .reduce((sum, tx) => sum + tx.commissionValue, 0) ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-700/20 bg-slate-800 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/20 px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: staff.staffColor ?? '#94a3b8' }}
              aria-hidden
            />
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-slate-100">{staff.staffName}</h2>
              <p className="text-xs text-slate-500">Extrato de comissões</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-700/50 hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-3 gap-3 border-b border-slate-700/20 px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Comissão</p>
            <p className="text-base font-bold text-orange-400">{brl.format(staff.totalCommission)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400/80">Acertado</p>
            <p className="text-base font-bold text-emerald-400">{brl.format(staff.settledCommission)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-red-400/80">Pendente</p>
            <p className="text-base font-bold text-red-400">{brl.format(staff.pendingCommission)}</p>
          </div>
        </div>

        {/* Corpo — lista de transações */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Loading */}
          {detailQuery.isLoading ? (
            <div className="flex h-32 items-center justify-center text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : null}

          {/* Error */}
          {detailQuery.isError ? (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p>Erro ao carregar extrato.</p>
                <p className="mt-1 text-xs text-red-400/70">{String(detailQuery.error)}</p>
              </div>
            </div>
          ) : null}

          {/* Empty */}
          {detailQuery.data && detailQuery.data.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-slate-500">
              Nenhuma transação no período
            </div>
          ) : null}

          {/* Select all — apenas admin */}
          {allowSettlement && detailQuery.data && pendingRows.length > 0 ? (
            <button
              type="button"
              onClick={toggleAll}
              className="mb-3 flex w-full items-center gap-2 rounded-xl border border-dashed border-slate-700/30 px-3 py-2.5 text-left text-xs font-medium text-slate-400 transition-colors hover:border-slate-600/50 hover:text-slate-300"
            >
              {allPendingSelected ? (
                <CheckSquare className="h-4 w-4 shrink-0 text-orange-400" />
              ) : (
                <Square className="h-4 w-4 shrink-0" />
              )}
              {allPendingSelected ? 'Desmarcar todas' : `Selecionar todas pendentes (${pendingRows.length})`}
            </button>
          ) : null}

          {/* Transaction list */}
          {detailQuery.data ? (
            <div className="space-y-1">
              {detailQuery.data.map((tx) => {
                const isSettled = tx.isSettled;
                const selected = selectedIds.has(tx.id);

                return (
                  <button
                    key={tx.id}
                    type="button"
                    disabled={isSettled || !allowSettlement}
                    onClick={() => !isSettled && allowSettlement && toggleOne(tx.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                      isSettled
                        ? 'cursor-default opacity-60'
                        : selected
                          ? 'bg-orange-500/10 hover:bg-orange-500/15'
                          : 'hover:bg-slate-700/30'
                    } ${!allowSettlement && !isSettled ? 'cursor-default' : ''}`}
                  >
                    {/* Checkbox / status icon */}
                    {isSettled ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    ) : allowSettlement ? (
                      selected ? (
                        <CheckSquare className="h-4 w-4 shrink-0 text-orange-400" />
                      ) : (
                        <Square className="h-4 w-4 shrink-0 text-slate-500" />
                      )
                    ) : (
                      <div className="h-4 w-4 shrink-0 rounded-full border-2 border-slate-600" />
                    )}

                    <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-200">
                          {tx.description ?? (tx.category === 'product' ? 'Produto' : 'Serviço')}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(tx.occurredAt).toLocaleDateString('pt-BR')}
                          {' · '}
                          {brl.format(tx.amount)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={`text-sm font-semibold ${isSettled ? 'text-emerald-400' : 'text-red-400'}`}>
                          {brl.format(tx.commissionValue)}
                        </p>
                        {isSettled && tx.settledAt ? (
                          <p className="text-[10px] text-emerald-500/70">
                            Acertado em {new Date(tx.settledAt).toLocaleDateString('pt-BR')}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-700/20 px-6 py-4">
          <p className="text-xs text-slate-500">
            <div>
            {pendingRows.length} pendente{pendingRows.length !== 1 ? 's' : ''}
            {' · '}            
            {settledRows.length} acertada{settledRows.length !== 1 ? 's' : ''}
            </div>
            <span className="text-xs text-slate-100" >
            {allowSettlement && selectedIds.size > 0
              ? `  ${selectedIds.size}    
              selecionada${selectedIds.size !== 1 ? 's' : ''} `
              : ''}
            </span>
          </p>

          {allowSettlement ? (
            <button
              type="button"
              disabled={!hasSelection || settleMutation.isPending}
              onClick={handleSettle}
              className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {settleMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Acertando...
                </span>
              ) : (
                `Acertar  ${brl.format(selectedTotal)}`
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-700 px-5 py-2 text-sm font-semibold text-slate-200 shadow-md transition-all duration-200 hover:bg-slate-600"
            >
              Fechar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}