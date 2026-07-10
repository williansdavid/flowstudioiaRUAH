// src/features/finance/components/CommissionSettlementPage.tsx
import { useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, DollarSign, Loader2, XCircle } from 'lucide-react';
import { PeriodFilter } from './PeriodFilter';
import { CustomRangePicker } from './CustomRangePicker';
import { SettlementDetailModal } from './SettlementDetailModal';
import { useCommissionSettlement, useCurrentUserRole } from '../hooks';
import type { StaffCommissionSummary, FinancePeriod, PeriodRange } from '../types';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function defaultCustomRange(): PeriodRange {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 29);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

function StatusBadge({ settled, pending }: { settled: number; pending: number }) {
  if (settled > 0 && pending === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
        <CheckCircle2 className="h-3 w-3" />
        Acertado
      </span>
    );
  }
  if (pending > 0 && settled === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400">
        <XCircle className="h-3 w-3" />
        Pendente
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-medium text-orange-400">
      <Clock className="h-3 w-3" />
      Parcial
    </span>
  );
}

function SingleStaffCard({ staff, onDetail }: { staff: StaffCommissionSummary; onDetail: (s: StaffCommissionSummary) => void }) {
  return (
    <button
      type="button"
      onClick={() => onDetail(staff)}
      className="w-full rounded-2xl border border-slate-700/20 bg-gradient-to-br from-slate-800/60 to-slate-800/20 p-6 text-left shadow-md transition-all duration-200 hover:bg-slate-700/40 active:scale-[0.99]"
    >
      <div className="flex items-center gap-4">
        <span
          className="h-4 w-4 shrink-0 rounded-full"
          style={{ backgroundColor: staff.staffColor ?? '#94a3b8' }}
          aria-hidden
        />
        <div>
          <p className="text-lg font-semibold text-slate-100">{staff.staffName}</p>
          <p className="text-sm text-slate-500">{staff.appointmentCount} atendimentos no período</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-slate-900/40 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Comissão total</p>
          <p className="mt-1 text-xl font-bold text-orange-400">{brl.format(staff.totalCommission)}</p>
        </div>
        <div className="rounded-xl bg-emerald-500/5 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400/80">Acertado</p>
          <p className="mt-1 text-xl font-bold text-emerald-400">{brl.format(staff.settledCommission)}</p>
        </div>
        <div className="rounded-xl bg-red-500/5 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-red-400/80">Pendente</p>
          <p className="mt-1 text-xl font-bold text-red-400">{brl.format(staff.pendingCommission)}</p>
        </div>
      </div>
    </button>
  );
}

export function CommissionSettlementPage() {
  const [period, setPeriod] = useState<FinancePeriod>('month');
  const [customRange, setCustomRange] = useState<PeriodRange>(defaultCustomRange);
  const [selectedStaff, setSelectedStaff] = useState<StaffCommissionSummary | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const input = period === 'custom' ? { period, customRange } : { period };
  const query = useCommissionSettlement(input);
  const { data: roleData } = useCurrentUserRole();
  const isAdmin = roleData?.role === 'admin';

  function handleOpenDetail(staff: StaffCommissionSummary) {
    setSelectedStaff(staff);
    setModalOpen(true);
  }

  // ⬇️ Variável com guarda — resolve o TS2554 (noUncheckedIndexedAccess)
  const singleStaff = query.data?.length === 1 ? query.data[0] : undefined;

  // Visão individual (staff logado) = apenas 1 profissional retornou
  const isSingleView = singleStaff !== undefined;

  return (
    <div className="w-full min-w-0 space-y-6 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-100">Acerto de Comissões</h1>
          <p className="text-sm text-slate-500">
            {isSingleView
              ? 'Seu resumo de comissões no período'
              : 'Controle de comissões por profissional — acertado vs pendente'}
          </p>
        </div>
        {!isSingleView ? (
          <div className="flex flex-wrap items-center gap-2">
            <PeriodFilter value={period} onChange={setPeriod} />
          </div>
        ) : null}
      </div>

      {period === 'custom' && !isSingleView ? (
        <CustomRangePicker value={customRange} onChange={setCustomRange} />
      ) : null}

      {/* Resumo geral (admin — múltiplos staff) */}
      {query.data && !isSingleView && query.data.length > 1 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-700/20 bg-slate-800/40 p-4 shadow-md">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Comissão total</p>
            <p className="mt-1 text-2xl font-bold text-slate-100">
              {brl.format(query.data.reduce((s, i) => s + i.totalCommission, 0))}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-md">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400/80">Já acertado</p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">
              {brl.format(query.data.reduce((s, i) => s + i.settledCommission, 0))}
            </p>
          </div>
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 shadow-md">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-red-400/80">Pendente</p>
            <p className="mt-1 text-2xl font-bold text-red-400">
              {brl.format(query.data.reduce((s, i) => s + i.pendingCommission, 0))}
            </p>
          </div>
        </div>
      ) : null}

      {/* Loading state */}
      {query.isLoading ? (
        <div className="flex h-64 items-center justify-center text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
        </div>
      ) : null}

      {/* Error state */}
      {query.isError ? (
        <div className="flex items-start gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <div>
            <p>Não foi possível carregar os dados de comissão.</p>
            <p className="mt-1 text-xs text-red-400/70">{String(query.error)}</p>
          </div>
        </div>
      ) : null}

      {/* Conteúdo principal */}
      {query.data && !query.isLoading ? (
        query.data.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-2xl border border-slate-700/20 bg-slate-800/40 text-sm text-slate-500">
            Nenhum profissional com comissão no período
          </div>
        ) : isSingleView ? (
          // ─── Staff logado: card individual destacado ───
          <SingleStaffCard staff={singleStaff!} onDetail={handleOpenDetail} />
        ) : (
          // ─── Admin: lista de profissionais ───
          <div className="space-y-3">
            {query.data.map((staff) => (
              <button
                key={staff.staffId}
                type="button"
                onClick={() => handleOpenDetail(staff)}
                className="w-full rounded-2xl border border-slate-700/20 bg-slate-800/40 p-4 text-left shadow-md transition-all duration-200 hover:bg-slate-700/40 active:scale-[0.99]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: staff.staffColor ?? '#94a3b8' }}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-200">{staff.staffName}</p>
                      <p className="text-xs text-slate-500">{staff.appointmentCount} atendimentos</p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-6">
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wide text-slate-500">Comissão</p>
                      <p className="text-sm font-semibold text-orange-400">{brl.format(staff.totalCommission)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wide text-slate-500">Pendente</p>
                      <p className={`text-sm font-semibold ${staff.pendingCommission > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {brl.format(staff.pendingCommission)}
                      </p>
                    </div>
                    <StatusBadge settled={staff.settledCommission} pending={staff.pendingCommission} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )
      ) : null}

      {/* Modal de detalhamento */}
      {selectedStaff ? (
        <SettlementDetailModal
          staff={selectedStaff}
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedStaff(null);
          }}
          period={input}
          allowSettlement={isAdmin}
        />
      ) : null}
    </div>
  );
}