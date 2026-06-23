// src/features/appointments/components/BookingWizard/Steps/StepConfirm.tsx

import { CalendarDays, Clock, Scissors, User, DollarSign, CheckCircle } from 'lucide-react';
import type { WizardSelection } from '../BookingWizard.types';

interface Props {
  selection: WizardSelection;
  isSaving: boolean;
}

const timeFmt = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
});

const dateFmt = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  timeZone: 'America/Sao_Paulo',
});

export function StepConfirm({ selection, isSaving }: Props) {
  const dateObj = new Date(selection.slotStartsAt);
  const formattedDate = dateFmt.format(dateObj);
  const formattedTime = timeFmt.format(dateObj);

  return (
    <div className="flex flex-col gap-6 px-5 pt-6">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle className="h-7 w-7 text-emerald-400" />
        </div>
        <h2 className="text-lg font-bold text-slate-100">Confirmar agendamento</h2>
        <p className="text-sm text-slate-500">Revise os dados antes de confirmar.</p>
      </div>

      {/* Cards de resumo */}
      <div className="flex flex-col gap-3">
        {/* Cliente */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-700/20 bg-slate-800/40 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Cliente</p>
            <p className="text-sm font-bold text-slate-100">{selection.clientName}</p>
          </div>
        </div>

        {/* Serviço */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-700/20 bg-slate-800/40 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
            <Scissors className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Serviço</p>
            <p className="text-sm font-bold text-slate-100">{selection.serviceName}</p>
          </div>
        </div>

        {/* Profissional */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-700/20 bg-slate-800/40 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Profissional</p>
            <p className="text-sm font-bold text-slate-100">{selection.staffName}</p>
          </div>
        </div>

        {/* Data e horário */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-700/20 bg-slate-800/40 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Data</p>
            <p className="text-sm font-bold text-slate-100 capitalize">{formattedDate}</p>
          </div>
        </div>

        {/* Horário */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-700/20 bg-slate-800/40 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Horário</p>
            <p className="text-sm font-bold text-slate-100">{formattedTime}</p>
          </div>
        </div>

        {/* Preço */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-700/20 bg-slate-800/40 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Valor</p>
            <p className="text-sm font-bold text-slate-100">
              {selection.servicePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}