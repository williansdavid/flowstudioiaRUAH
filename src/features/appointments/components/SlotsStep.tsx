import { useMemo, useState } from 'react';
import { AlertCircle, CalendarX, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useAvailableSlots } from '../hooks';
import type { DaySlots, SlotItem } from '../server/getAvailableSlots';
import { todayLocalDate } from '../utils/todayLocalDate';
import { Button } from '@/features/utils/ui/Button';
import { parseISO } from 'date-fns';

const RANGE_DAYS = 14;

interface SlotsStepProps {
  staffId: string | null;
  serviceId: string | null;
  /** Slot escolhido (controlado pelo wizard pai). */
  selectedStartsAt: string | null;
  onSelect: (slot: SlotItem) => void;
}

const WEEKDAY_LABEL = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sb'] as const;

function formatDayLabel(date: string): { weekday: string; dayMonth: string } {
  const d = new Date(`${date}T12:00:00-03:00`);
  const wd = WEEKDAY_LABEL[d.getDay()] ?? '';
  const dayMonth = d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });
  return { weekday: wd, dayMonth };
}

// ═══ Safe formatTime — NUNCA lança RangeError ═══
function formatTime(iso: string): string {
  try {
    const d = parseISO(iso);
    if (isNaN(d.getTime())) return '--:--';
    return d.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
    });
  } catch {
    return '--:--';
  }
}
// ═══ Fim safe formatTime ═══

export function SlotsStep({
  staffId,
  serviceId,
  selectedStartsAt,
  onSelect,
}: SlotsStepProps) {
  // Navegação por "página" de 14 dias. offset em dias a partir de hoje.
  const [offset, setOffset] = useState(0);

  const startDate = useMemo(() => {
    const base = todayLocalDate();
    if (offset === 0) return base;
    const d = new Date(`${base}T00:00:00-03:00`);
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  }, [offset]);

  const {
    data: days,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useAvailableSlots({
    staffId,
    serviceId,
    startDate,
    days: RANGE_DAYS,
  });

  // Pré-requisito do wizard: Janela 1 incompleta.
  if (!staffId || !serviceId) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-sm text-muted-foreground">
        <CalendarX className="size-6 opacity-60" />
        <p>Selecione o serviço e o profissional para ver os horários.</p>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        <span>Carregando horários…</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <AlertCircle className="size-6 text-destructive" />
        <p className="text-sm text-muted-foreground">
          {error.message || 'Não foi possível carregar os horários.'}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => void refetch()}
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  const hasAnySlot = days.some((d) => d.slots.length > 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Navegação de range */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOffset((o) => Math.max(0, o - RANGE_DAYS))}
          disabled={offset === 0 || isFetching}
        >
          <ChevronLeft className="size-4" />
          Anterior
        </Button>
        <span className="text-xs text-muted-foreground">
          {isFetching ? 'Atualizando…' : `Próximos ${RANGE_DAYS} dias`}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOffset((o) => o + RANGE_DAYS)}
          disabled={isFetching}
        >
          Próximo
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {!hasAnySlot ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-sm text-muted-foreground">
          <CalendarX className="size-6 opacity-60" />
          <p>Nenhum horário disponível neste período.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {days
            .filter((d) => d.slots.length > 0)
            .map((day) => (
              <DayRow
                key={day.date}
                day={day}
                selectedStartsAt={selectedStartsAt}
                onSelect={onSelect}
              />
            ))}
        </div>
      )}
    </div>
  );
}

interface DayRowProps {
  day: DaySlots;
  selectedStartsAt: string | null;
  onSelect: (slot: SlotItem) => void;
}

function DayRow({ day, selectedStartsAt, onSelect }: DayRowProps) {
  const { weekday, dayMonth } = formatDayLabel(day.date);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-1.5">
        <span className="text-sm font-semibold capitalize">{weekday}</span>
        <span className="text-xs text-muted-foreground">{dayMonth}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {day.slots.map((slot) => {
          const active = slot.startsAt === selectedStartsAt;
          return (
            <button
              key={slot.startsAt}
              type="button"
              onClick={() => onSelect(slot)}
              aria-pressed={active}
              className={
                active
                  ? 'rounded-md border border-primary bg-primary px-2 py-2 text-sm font-medium text-text-on-dark'
                  : 'rounded-md border px-2 py-2 text-sm hover:border-primary hover:bg-accent'
              }
            >
              {formatTime(slot.startsAt)}
            </button>
          );
        })}
      </div>
    </div>
  );
}