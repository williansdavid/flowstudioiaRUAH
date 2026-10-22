// src/features/appointments/components/BookingWizard/Steps/StepDate.tsx
import { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Props {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
}

function todayLocal(): string {
  const d = new Date();
  const local = new Date(d.getTime() - 3 * 60 * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

function formatDate(dateStr: string): { weekday: string; day: string; month: string } {
  const d = new Date(`${dateStr}T12:00:00-03:00`);
  const weekday = d.toLocaleDateString('pt-BR', { weekday: 'long' });
  const day = d.toLocaleDateString('pt-BR', { day: '2-digit' });
  const month = d.toLocaleDateString('pt-BR', { month: 'long' });
  return { weekday, day, month };
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T00:00:00-03:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function StepDate({ value, onChange }: Props) {
  const today = todayLocal();
  const [weekOffset, setWeekOffset] = useState(0);

  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i + weekOffset * 7));
  const selected = value || today;
  const selectedFmt = formatDate(selected);

  return (
    <div className="flex flex-col gap-4 px-5 pt-2">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-slate-100">Escolha o dia</h2>
        <p className="text-sm text-slate-500">Selecione a data para o agendamento.</p>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setWeekOffset((p) => p - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors"
          aria-label="Semana anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {weekOffset === 0 ? 'Esta semana' : weekOffset === 1 ? 'Próxima semana' : `+${weekOffset} semanas`}
        </span>
        <button
          type="button"
          onClick={() => setWeekOffset((p) => p + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors"
          aria-label="Próxima semana"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const d = new Date(`${day}T12:00:00-03:00`);
          const weekday = d.getDay();
          const dayNum = d.getDate();
          const isToday = day === today;
          const isSelected = day === selected;
          const isPast = day < today;

          return (
            <button
              key={day}
              type="button"
              disabled={isPast}
              onClick={() => onChange(day)}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-xl py-3 transition-all duration-200',
                isPast && 'opacity-30 cursor-not-allowed',
                !isPast && !isSelected && 'hover:bg-slate-800/60 active:scale-95',
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
                )}
              >
                {dayNum}
              </span>
              {isToday && <span className="h-1 w-1 rounded-full bg-cyan-400" />}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-slate-700/20 bg-slate-800/40 p-4 mt-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-100 capitalize">{selectedFmt.weekday}</p>
          <p className="text-xs text-slate-500">{selectedFmt.day} de {selectedFmt.month}</p>
        </div>
      </div>
    </div>
  );
}