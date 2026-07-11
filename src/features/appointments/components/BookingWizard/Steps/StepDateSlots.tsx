import { useState, useMemo } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Loader2, CalendarX, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAvailableSlots } from '@/features/appointments/hooks';
import { useQuery } from '@tanstack/react-query';
import { getAvailableSlots } from '@/features/appointments/server/getAvailableSlots';

interface Props {
  value: string;          // selected date YYYY-MM-DD
  slotStartsAt: string;   // ISO string
  slotEndsAt: string;     // ISO string
  staffId: string;
  serviceId: string;
  onChange: (date: string, slotStartsAt: string, slotEndsAt: string) => void;
  onSlotConfirmed?: () => void;  // 🔥 NOVA prop — avança pro Confirm direto
}

// ── Helpers ──────────────────────────────────────────

function todayLocal(): string {
  const now = new Date();
  const offset = -3 * 60;
  const local = new Date(now.getTime() + offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T12:00:00-03:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const timeFmt = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
});

function formatLongDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00-03:00');
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const startPad = firstDay.getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevTotal = new Date(year, month, 0).getDate();
  const days: Array<{ day: number; dateStr: string; isCurrent: boolean }> = [];

  for (let i = startPad - 1; i >= 0; i--) {
    const d = prevTotal - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    days.push({
      day: d,
      dateStr: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      isCurrent: false,
    });
  }
  for (let d = 1; d <= totalDays; d++) {
    days.push({
      day: d,
      dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      isCurrent: true,
    });
  }
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    days.push({
      day: d,
      dateStr: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      isCurrent: false,
    });
  }
  return days;
}

// ── Componente principal ─────────────────────────────

export function StepDateSlots({
  value,
  slotStartsAt,
  slotEndsAt,
  staffId,
  serviceId,
  onChange,
  onSlotConfirmed,
}: Props) {
  const today = todayLocal();
  const [weekOffset, setWeekOffset] = useState(0);
  const todayDate = new Date(today + 'T12:00:00-03:00');
  const dow = todayDate.getDay();
  const weekStart = addDays(today, -dow);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i + weekOffset * 7));
  const date = value || today;

  const { data: slotsData, isLoading: slotsLoading } = useAvailableSlots({
    staffId: staffId || null,
    serviceId: serviceId || null,
    startDate: days[0]!,
    days: 7,
  });

  const daySlotCount = useMemo(() => {
    if (!slotsData) return {};
    const m: Record<string, number> = {};
    for (const d of slotsData) {
      if (d.slots) m[d.date] = d.slots.length;
    }
    return m;
  }, [slotsData]);

  const selectedDaySlots = useMemo(() => {
    if (!slotsData) return [];
    return slotsData.find((d) => d.date === date)?.slots ?? [];
  }, [slotsData, date]);

  // ── Calendar modal state ───────────────────────────

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarYear, setCalendarYear] = useState(() => {
    const d = date ? new Date(date + 'T12:00:00-03:00') : new Date();
    return d.getFullYear();
  });
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = date ? new Date(date + 'T12:00:00-03:00') : new Date();
    return d.getMonth();
  });
  const [calendarSelectedDate, setCalendarSelectedDate] = useState('');

  const monthDays = useMemo(
    () => getMonthDays(calendarYear, calendarMonth),
    [calendarYear, calendarMonth],
  );

  const { data: calendarDayData, isLoading: calendarDayLoading } = useQuery({
    queryKey: ['appointments', 'calendar-slot', calendarSelectedDate, staffId, serviceId],
    queryFn: () =>
      getAvailableSlots({
        data: {
          staffId: staffId!,
          serviceId: serviceId!,
          startDate: calendarSelectedDate,
          days: 1,
        },
      }),
    enabled: Boolean(staffId && serviceId && calendarSelectedDate && calendarOpen),
    staleTime: 30_000,
  });
  const calendarSlots = calendarDayData?.[0]?.slots ?? [];

const weekLabel = weekOffset === 0
  ? 'Esta semana'
  : weekOffset === 1
    ? 'Próxima semana'
    : `+${weekOffset} semanas`;

  return (
    <>
      {/* ─── Navegação semanal ─────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            setWeekOffset((p) => p - 1);
          }}
          className="p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-slate-400" />
        </button>

        {/* 🔥 Agora é um botão clicável que abre o calendário */}
        <button
          onClick={() => setCalendarOpen(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-300 transition-colors"
        >
          <CalendarDays className="h-3.5 w-3.5" />
          {weekLabel}
        </button>

        <button
          onClick={() => setWeekOffset((p) => p + 1)}
          className="p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      {/* ─── Grade de 7 dias (inalterada) ──────────── */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {WEEKDAYS_SHORT.map((name, i) => (
          <div key={i} className="text-center text-xs text-slate-500 font-medium py-1">
            {name}
          </div>
        ))}
        {days.map((dayStr) => {
          const dd = new Date(dayStr + 'T12:00:00-03:00');
          const isToday = dayStr === today;
          const isSelected = dayStr === date;
          const isPast = dayStr < today;
          const hasSlots = (daySlotCount[dayStr] ?? 0) > 0;
          return (
            <button
              key={dayStr}
              disabled={isPast}
              onClick={() => { if (!isPast) onChange(dayStr, '', ''); }}
              className={cn(
                'flex flex-col items-center justify-center py-2 rounded-lg transition-all',
                isPast && 'opacity-20 cursor-not-allowed',
                !isPast && 'hover:bg-slate-800 cursor-pointer',
                isSelected && 'bg-cyan-500/15 ring-1 ring-cyan-500/30',
                isToday && !isSelected && 'text-cyan-400',
              )}
            >
              <span className="text-sm font-semibold">{dd.getDate()}</span>
              {hasSlots && <span className="mt-0.5 h-1 w-1 rounded-full bg-emerald-400/70" />}
              {!isPast && !hasSlots && <span className="mt-0.5 text-[10px] text-slate-600">—</span>}
            </button>
          );
        })}
      </div>

      {/* ─── Legenda ─────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-4 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
          Disponível
        </span>
        <span className="flex items-center gap-1">
          <span className="text-xs">—</span>
          Indisponível
        </span>
      </div>

      {/* ─── Data selecionada ────────────────────────── */}
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays className="h-4 w-4 text-cyan-400" />
        <span className="text-sm font-semibold text-slate-200 capitalize">
          {formatLongDate(date)}
        </span>
      </div>

      {/* ─── Slots da data ──────────────────────────── */}
      {slotsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      ) : selectedDaySlots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-slate-500">
          <CalendarX className="h-8 w-8 mb-2" />
          <p className="text-sm">Nenhum horário disponível neste dia</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {selectedDaySlots.map((slot: any) => {
            const sel = slotStartsAt === slot.startsAt;
            return (
              <button
                key={slot.startsAt}
                onClick={() => onChange(date, slot.startsAt, slot.endsAt)}
                className={cn(
                  'rounded-xl border py-2.5 text-sm font-bold transition-all active:scale-95',
                  sel
                    ? 'border-cyan-500 bg-cyan-500/15 text-cyan-300'
                    : 'border-slate-700/60 bg-slate-800/40 text-slate-300 hover:border-slate-600',
                )}
              >
                <Clock className="inline-block h-3.5 w-3.5 mr-1 -mt-0.5" />
                {timeFmt.format(new Date(slot.startsAt))}
              </button>
            );
          })}
        </div>
      )}

      {/* ─── 🔥 CALENDÁRIO MODAL ───────────────────── */}
      {calendarOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setCalendarOpen(false)}  //{/* clica no backdrop = fecha */}
        >
          <div
            className="mx-auto w-full max-w-sm rounded-2xl bg-slate-900 p-5 shadow-xl border border-slate-800/60"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mês: ← Julho 2026 →  ✕ */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => {
                  if (calendarMonth === 0) { setCalendarYear((y) => y - 1); setCalendarMonth(11); }
                  else { setCalendarMonth((m) => m - 1); }
                }}
                className="p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-slate-400" />
              </button>
              <span className="text-sm font-semibold text-slate-200">
                {MONTHS[calendarMonth]} {calendarYear}
              </span>
              <button
                onClick={() => {
                  if (calendarMonth === 11) { setCalendarYear((y) => y + 1); setCalendarMonth(0); }
                  else { setCalendarMonth((m) => m + 1); }
                }}
                className="p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
              <button
                onClick={() => setCalendarOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            {/* Cabeçalho dos dias da semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAYS_SHORT.map((name, i) => (
                <div key={i} className="text-center text-xs text-slate-500 font-medium py-1">
                  {name}
                </div>
              ))}
            </div>

            {/* Grade de dias do mês */}
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((dayObj) => {
                const isPast = dayObj.dateStr < today;
                const isSel = dayObj.dateStr === calendarSelectedDate;
                return (
                  <button
                    key={dayObj.dateStr}
                    disabled={isPast}
                    onClick={() => { if (!isPast) setCalendarSelectedDate(dayObj.dateStr); }}
                    className={cn(
                      'flex items-center justify-center h-9 rounded-lg text-sm transition-all',
                      !dayObj.isCurrent && 'opacity-30',
                      isPast && 'opacity-20 cursor-not-allowed',
                      !isPast && dayObj.isCurrent && 'hover:bg-slate-800 cursor-pointer',
                      isSel && 'bg-cyan-500/15 ring-1 ring-cyan-500/30',
                    )}
                  >
                    {dayObj.day}
                  </button>
                );
              })}
            </div>

            {/* Slots da data selecionada no calendário */}
            {calendarSelectedDate && (
              <div className="mt-4 border-t border-slate-800/60 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <CalendarDays className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-semibold text-slate-200 capitalize">
                    {formatLongDate(calendarSelectedDate)}
                  </span>
                </div>

                {calendarDayLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  </div>
                ) : calendarSlots.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-4 text-slate-500">
                    <CalendarX className="h-6 w-6 mb-2" />
                    <p className="text-sm">Nenhum horário disponível</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {calendarSlots.map((slot: any) => (
                      <button
                        key={slot.startsAt}
                        onClick={() => {
                          onChange(calendarSelectedDate, slot.startsAt, slot.endsAt);
                          setCalendarOpen(false);
                          onSlotConfirmed?.(); // 🔥 AVANÇA PRO CONFIRM
                        }}
                        className="rounded-xl border border-slate-700/60 bg-slate-800/40 py-2.5 text-sm font-bold text-slate-300 transition-all active:scale-95 hover:border-slate-600"
                      >
                        <Clock className="inline-block h-3.5 w-3.5 mr-1 -mt-0.5" />
                        {timeFmt.format(new Date(slot.startsAt))}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}