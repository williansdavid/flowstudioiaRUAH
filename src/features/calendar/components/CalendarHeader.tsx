import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { CalendarView } from "../types";

interface CalendarHeaderProps {
  /** Data de referencia atual (dia selecionado ou primeiro dia da semana). */
  currentDate: Date;
  /** View ativa: 'day' | 'week'. */
  view: CalendarView;
  /** Disparado quando o usuario navega (prev/next/hoje). */
  onDateChange: (date: Date) => void;
  /** Disparado quando o usuario alterna a view. */
  onViewChange: (view: CalendarView) => void;
}

/**
 * Header de navegacao do calendario.
 *
 * Responsabilidades:
 *  - Exibir titulo contextual (dia ou intervalo da semana)
 *  - Navegar prev/next por unidade (1 dia ou 7 dias)
 *  - Botao "Hoje" pra resetar pra data atual
 *  - Alternar entre view 'day' e 'week'
 *
 * Componente puramente controlado: nao mantem estado interno.
 */
export function CalendarHeader({
  currentDate,
  view,
  onDateChange,
  onViewChange,
}: CalendarHeaderProps) {
  const isToday = isSameDay(currentDate, new Date());
  const title = formatTitle(currentDate, view);

  const handlePrev = () => {
    onDateChange(shiftDate(currentDate, view, -1));
  };

  const handleNext = () => {
    onDateChange(shiftDate(currentDate, view, 1));
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="flex flex-col gap-3 border-b border-neutral-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
      {/* Bloco esquerdo: navegacao + titulo */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePrev}
          aria-label={view === "day" ? "Dia anterior" : "Semana anterior"}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-700 transition-colors hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>

        <button
          type="button"
          onClick={handleNext}
          aria-label={view === "day" ? "Proximo dia" : "Proxima semana"}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-700 transition-colors hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>

        <button
          type="button"
          onClick={handleToday}
          disabled={isToday}
          className={cn(
            "ml-1 inline-flex h-9 items-center justify-center rounded-md border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 transition-colors",
            "hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          Hoje
        </button>

        <h2 className="ml-2 truncate text-sm font-semibold text-neutral-900 sm:text-base">
          {title}
        </h2>
      </div>

      {/* Bloco direito: toggle de view */}
      <div
        role="tablist"
        aria-label="Visualizacao do calendario"
        className="inline-flex self-start rounded-md border border-neutral-200 bg-neutral-50 p-0.5 sm:self-auto"
      >
        <ViewToggleButton
          active={view === "day"}
          onClick={() => onViewChange("day")}
          label="Dia"
        />
        <ViewToggleButton
          active={view === "week"}
          onClick={() => onViewChange("week")}
          label="Semana"
        />
      </div>
    </div>
  );
}

// --------------------------------------------
// Subcomponente: botao do toggle de view
// --------------------------------------------
interface ViewToggleButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

function ViewToggleButton({ active, onClick, label }: ViewToggleButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center justify-center rounded px-3 text-sm font-medium transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        active
          ? "bg-white text-neutral-900 shadow-sm"
          : "text-neutral-600 hover:text-neutral-900",
      )}
    >
      {label}
    </button>
  );
}

// --------------------------------------------
// Helpers de data (puros, sem libs externas)
// --------------------------------------------

const dayTitleFmt = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const weekDayMonthFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
});

const weekYearFmt = new Intl.DateTimeFormat("pt-BR", {
  year: "numeric",
});

/**
 * Compara se duas datas representam o mesmo dia civil.
 * Usa toDateString pra evitar problemas de timezone/hora.
 */
function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

/**
 * Retorna o primeiro dia (segunda-feira) da semana que contem `date`.
 * Padrao brasileiro: semana comeca na segunda.
 */
function getWeekStart(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay(); // 0=domingo, 1=segunda, ..., 6=sabado
  const diff = day === 0 ? -6 : 1 - day; // se domingo, volta 6 dias; senao volta ate segunda
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Avanca/retrocede a data conforme a view ativa.
 *  - day:  +/- 1 dia
 *  - week: +/- 7 dias
 */
function shiftDate(date: Date, view: CalendarView, direction: 1 | -1): Date {
  const result = new Date(date);
  const delta = view === "day" ? 1 : 7;
  result.setDate(result.getDate() + delta * direction);
  return result;
}

/**
 * Formata o titulo do header conforme a view.
 *  - day:  "segunda-feira, 26 de maio de 2026"
 *  - week: "26 de mai - 01 de jun de 2026"
 */
function formatTitle(date: Date, view: CalendarView): string {
  if (view === "day") {
    return capitalize(dayTitleFmt.format(date));
  }

  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const startLabel = weekDayMonthFmt.format(start).replace(".", "");
  const endLabel = weekDayMonthFmt.format(end).replace(".", "");
  const yearLabel = weekYearFmt.format(end);

  return `${startLabel} - ${endLabel} de ${yearLabel}`;
}

/**
 * Capitaliza primeira letra (PT-BR retorna lowercase no weekday).
 */
function capitalize(str: string): string {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
