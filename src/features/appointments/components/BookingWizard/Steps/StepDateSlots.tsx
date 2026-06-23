// src/features/appointments/components/BookingWizard/Steps/StepDateSlots.tsx
import { useState, useMemo } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Loader2, CalendarX } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAvailableSlots } from '@/features/appointments/hooks';
import type { BusinessHours } from '@/sites/ruah/types';

interface Props {
  value: string;
  slotStartsAt: string;
  slotEndsAt: string;
  staffId: string;
  serviceId: string;
  businessHours: BusinessHours;
  onChange: (date: string, slotStartsAt: string, slotEndsAt: string) => void;
}

function todayLocal(): string {
  const d = new Date();
  const local = new Date(d.getTime() - 3 * 60 * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T00:00:00-03:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const timeFmt = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
});

function formatLongDate(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00-03:00`);
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });
}

export function StepDateSlots({
  value: selectedDate,
  slotStartsAt,
  slotEndsAt,
  staffId,
  serviceId,
  businessHours,
  onChange,
}: Props) {
  const today = todayLocal();
  const [weekOffset, setWeekOffset] = useState(0);

  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i + weekOffset * 7));
  const date = selectedDate || today;

  const { data: slotsData, isLoading: slotsLoading } = useAvailableSlots({
    staffId: staffId || null,
    serviceId: serviceId || null,
    startDate: days[0]!,
    days: 7,
    businessHours: businessHours as any,
  });

  const daySlotCount = useMemo(() => {
    const map = new Map<string, number>();
    if (!slotsData) return map;
    for (const day of slotsData) {
      map.set(day.date, day.slots.length);
    }
    return map;
  }, [slotsData]);

  const selectedDaySlots = useMemo(() => {
    if (!slotsData) return [];
    return slotsData.find((d) => d.date === date)?.slots ?? [];
  }, [slotsData, date]);

  return (
    <div className="flex flex-col gap-4 px-5 pt-2">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-slate-100">Escolha o dia e horário</h2>
        <p className="text-sm text-slate-500">
          {staffId && serviceId
            ? 'Dias sem indicador estão sem horários disponíveis.'
            : 'Selecione antes o serviço e profissional.'}
        </p>
      </div>

      {/* Navegação de semanas */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            setWeekOffset((p) => p - 1);
            onChange(days[0]!, '', '');
          }}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors"
          aria-label="Semana anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {weekOffset === 0
            ? 'Esta semana'
            : weekOffset === 1
              ? 'Próxima semana'
              : `+${weekOffset} semanas`}
        </span>
        <button
          type="button"
          onClick={() => {
            setWeekOffset((p) => p + 1);
            onChange(addDays(today, (weekOffset + 1) * 7), '', '');
          }}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors"
          aria-label="Próxima semana"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Grade de dias */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const d = new Date(`${day}T12:00:00-03:00`);
          const weekday = d.getDay();
          const dayNum = d.getDate();
          const isToday = day === today;
          const isSelected = day === date;
          const isPast = day < today;

          const slotCount = daySlotCount.get(day);
          const hasAvailability = !isPast && slotCount !== undefined && slotCount > 0;
          const isUnavailable = !isPast && slotCount !== undefined && slotCount === 0;
          const isUnknown = !isPast && slotCount === undefined;

          return (
            <button
              key={day}
              type="button"
              disabled={isPast || isUnavailable || isUnknown}
              onClick={() => onChange(day, '', '')}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-xl py-3 transition-all duration-200 relative',
                isPast && 'opacity-20 cursor-not-allowed',
                isUnavailable && 'opacity-45 cursor-not-allowed',
                isUnknown && 'opacity-60 cursor-wait',
                !isPast && !isUnavailable && !isUnknown && !isSelected && 'hover:bg-slate-800/60 active:scale-95',
                isSelected && 'bg-cyan-500/15 ring-1 ring-cyan-500/30',
              )}
            >
              <span className="text-[10px] font-semibold uppercase text-slate-500">
                {WEEKDAYS_SHORT[weekday]}
              </span>
              <span
                className={cn(
                  'text-sm font-bold',
                  isSelected ? 'text-cyan-400' : isToday ? 'text-cyan-300' : 'text-slate-100',
                  isUnavailable && 'text-slate-600',
                )}
              >
                {dayNum}
              </span>

              {/* Indicador visual de estado do dia */}
              <div className="h-2 flex items-center mt-0.5">
                {hasAvailability && (
                  <div className="flex gap-0.5">
                    <span className="h-1 w-1 rounded-full bg-emerald-400" />
                    <span className="h-1 w-1 rounded-full bg-emerald-400" />
                    <span className="h-1 w-1 rounded-full bg-emerald-400" />
                  </div>
                )}
                {isUnavailable && (
                  <span className="text-[8px] font-semibold uppercase tracking-wider text-slate-600">—</span>
                )}
                {isToday && !hasAvailability && !isUnavailable && (
                  <span className="h-1 w-1 rounded-full bg-cyan-400" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legenda fixa */}
      <div className="flex items-center justify-center gap-4 text-[10px] text-slate-600">
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Disponível
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="text-[8px] font-semibold">—</span>
          Indisponível / Folga
        </span>
      </div>

      {/* Data selecionada */}
      {date && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-700/20 bg-slate-800/40 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
            <CalendarDays className="h-5 w-5" />
          </div>
          <p className="text-sm font-bold text-slate-100 capitalize">{formatLongDate(date)}</p>
        </div>
      )}

      {/* Slots — grid 3 colunas no mobile */}
      <div className="border-t border-slate-700/20 pt-3">
        {slotsLoading && selectedDaySlots.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-6">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
            <span className="text-sm text-slate-500">Buscando horários...</span>
          </div>
        ) : !date ? (
          <p className="text-center text-sm text-slate-500 py-4">
            Selecione uma data para ver os horários.
          </p>
        ) : selectedDaySlots.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <CalendarX className="h-6 w-6 text-slate-500" />
            <p className="text-sm font-medium text-slate-400">
              Nenhum horário disponível nesta data.
            </p>
            <p className="text-xs text-slate-600">Tente selecionar outra data.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              {selectedDaySlots.length}{' '}
              {selectedDaySlots.length === 1 ? 'horário disponível' : 'horários disponíveis'}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {selectedDaySlots.map((slot) => {
                const sel = slotStartsAt === slot.startsAt;
                const time = timeFmt.format(new Date(slot.startsAt));

                return (
                  <button
                    key={slot.startsAt}
                    type="button"
                    onClick={() => onChange(date, slot.startsAt, slot.endsAt)}
                    className={cn(
                      'inline-flex items-center justify-center gap-1.5 rounded-xl border py-3 text-sm font-bold transition-all duration-200 active:scale-95',
                      sel
                        ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20'
                        : 'border-slate-700/30 bg-slate-800/40 text-slate-200 hover:border-slate-600/50 hover:bg-slate-800/70',
                    )}
                  >
                    <Clock className={cn('h-3.5 w-3.5', sel ? 'text-emerald-400' : 'text-slate-500')} />
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}