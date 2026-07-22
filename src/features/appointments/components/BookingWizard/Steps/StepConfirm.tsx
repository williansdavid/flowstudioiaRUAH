import { Check, ArrowLeft, CalendarDays, Clock, Scissors, User } from 'lucide-react';
import { Button } from '@/features/utils/ui/Button';
import type { WizardSelection } from '../BookingWizard.types';
import { formatPhoneBR } from '@/lib/core/utils';

interface Props {
  selection: WizardSelection;
  onBack?: () => void;
  onConfirm?: () => void;
  isSaving?: boolean;
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
});

export function StepConfirm({ selection, onBack, onConfirm, isSaving }: Props) {
  const slotDate = selection.slotStartsAt
    ? dateFmt.format(new Date(selection.slotStartsAt))
    : '';
  const slotTime = selection.slotStartsAt
    ? timeFmt.format(new Date(selection.slotStartsAt))
    : '';

  return (
    <div className="px-0 pt-0 sm:px-5 sm:pt-2">
      <p className="hidden text-lg font-bold text-slate-100 sm:block">
        Confirmar agendamento
      </p>
      <p className="hidden text-sm text-slate-400 sm:block">
        Revise os dados antes de confirmar.
      </p>

      <div className="mt-0 sm:mt-4 flex flex-col gap-3">
        {/* Cliente */}
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/15 to-emerald-500/5 p-3.5 shadow-lg shadow-emerald-500/15 ring-1 ring-emerald-500/10">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
            <User className="size-5" />
          </div>
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="text-sm font-semibold text-slate-200">
              {selection.clientName || 'Cliente'}
            </span>
            <span className="text-xs text-slate-400">{formatPhoneBR(selection.clientPhone) || 'Telefone não informado'}</span>
          </div>
        </div>

        {/* Serviço */}
        <div className="flex items-center gap-3 rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/15 to-cyan-500/5 p-3.5 shadow-lg shadow-cyan-500/15 ring-1 ring-cyan-500/10">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
            <Scissors className="size-5" />
          </div>
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="text-sm font-semibold text-slate-200">
              {selection.serviceName || '—'}
            </span>
            <span className="text-xs text-slate-400">
              {selection.serviceDuration}min · R$ {selection.servicePrice?.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Profissional */}
        <div className="flex items-center gap-3 rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-500/15 to-violet-500/5 p-3.5 shadow-lg shadow-violet-500/15 ring-1 ring-violet-500/10">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
            {selection.staffAvatarUrl ? (
              <img
                src={selection.staffAvatarUrl}
                alt={selection.staffName}
                className="size-10 rounded-xl object-cover"
              />
            ) : (
              <User className="size-5" />
            )}
          </div>
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="text-sm font-semibold text-slate-200">
              {selection.staffName || '—'}
            </span>
            <span className="text-xs text-slate-400">Profissional</span>
          </div>
        </div>

        {/* Data e Horário */}
        <div className="flex items-center gap-3 rounded-2xl border border-blue-500/20 bg-gradient-to-b from-blue-500/15 to-blue-500/5 p-3.5 shadow-lg shadow-blue-500/15 ring-1 ring-blue-500/10">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
            <CalendarDays className="size-5" />
          </div>
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="text-sm font-semibold text-slate-200">
              {slotDate || '—'}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="size-3" />
              {slotTime || '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Ações */}
      {(onBack || onConfirm) && (
        <div className="mt-6 flex items-center justify-between gap-3">
          {onBack && (
            <Button type="button" variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Voltar
            </Button>
          )}
          {onConfirm && (
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isSaving}
              isLoading={isSaving}
              variant="success"
              size="sm"
              className="gap-1.5"
            >
              <Check className="h-6 w-6" />
              Confirmar 
            </Button>
          )}
        </div>
      )}
    </div>
  );
}