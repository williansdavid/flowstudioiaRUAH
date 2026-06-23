// src/features/appointments/components/BookingWizard/Steps/StepSlots.tsx

import { Clock, Loader2, CalendarX } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { DaySlots } from '@/features/appointments/server/getAvailableSlots';

interface Props {
  slotsData: DaySlots[] | undefined;
  isLoading: boolean;
  selectedDate: string;
  value: string; // ISO startsAt
  onChange: (startsAt: string, endsAt: string) => void;
}

const timeFmt = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
});

export function StepSlots({ slotsData, isLoading, selectedDate, value, onChange }: Props) {
  // Pega os slots do dia selecionado
  const dayData = slotsData?.find((d) => d.date === selectedDate);
  const slots = dayData?.slots ?? [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-5 pt-10">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        <p className="text-sm text-slate-500">Buscando horários disponíveis...</p>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-5 pt-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800">
          <CalendarX className="h-6 w-6 text-slate-500" />
        </div>
        <p className="text-sm font-medium text-slate-400">Nenhum horário disponível nesta data.</p>
        <p className="text-xs text-slate-600">Tente selecionar outra data.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-5 pt-2">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-slate-100">Escolha o horário</h2>
        <p className="text-sm text-slate-500">
          {slots.length} {slots.length === 1 ? 'horário disponível' : 'horários disponíveis'} para este dia.
        </p>
      </div>

      {/* Chips de horário */}
      <div className="flex flex-wrap gap-2">
        {slots.map((slot) => {
          const isSelected = value === slot.startsAt;
          const time = timeFmt.format(new Date(slot.startsAt));

          return (
            <button
              key={slot.startsAt}
              type="button"
              onClick={() => onChange(slot.startsAt, slot.endsAt)}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition-all duration-200 active:scale-95',
                isSelected
                  ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20'
                  : 'border-slate-700/30 bg-slate-800/40 text-slate-200 hover:border-slate-600/50 hover:bg-slate-800/70',
              )}
            >
              <Clock className={cn('h-4 w-4', isSelected ? 'text-emerald-400' : 'text-slate-500')} />
              {time}
            </button>
          );
        })}
      </div>
    </div>
  );
}