import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { CalendarView } from "../types";

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarView;
  onDateChange: (date: Date) => void;
  onViewChange: (view: CalendarView) => void;
}

/**
 * Header de navegacao do calendario.
 * Tematizado via tokens CSS (funciona em qualquer skin).
 *
 * Toggle Dia/Semana usa pill dourado pro estado ativo.
 */
export function CalendarHeader({
  currentDate,
  view,
  onDateChange,
  onViewChange,
}: CalendarHeaderProps) {
  const isToday = isSameDay(currentDate, new Date());
  const title = formatTitle(currentDate, view);

  const handlePrev = () => onDateChange(shiftDate(currentDate, view, -1));
  const handleNext = () => onDateChange(shiftDate(currentDate, view, 1));
  const handleToday = () => onDateChange(new Date());

  return (
    <div
      className="flex flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4"
      style={{
        backgroundColor: "var(--bg-subtle)",
        borderBottomColor: "var(--border-default)",
        boxShadow: "var(--metal-highlight)",
      }}
    >
      {/* Bloco esquerdo: navegacao + titulo */}
      <div className="flex items-center gap-2">
        <NavButton
          onClick={handlePrev}
          ariaLabel={view === "day" ? "Dia anterior" : "Semana anterior"}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </NavButton>

        <NavButton
          onClick={handleNext}
          ariaLabel={view === "day" ? "Proximo dia" : "Proxima semana"}
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </NavButton>

        <button
          type="button"
          onClick={handleToday}
          disabled={isToday}
          className={cn(
            "ml-1 inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition-all",
            "focus:outline-none focus-visible:ring-2",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border-default)",
            color: "var(--fg-default)",
          }}
        >
          Hoje
        </button>

        <h2
          className="ml-2 truncate text-sm font-semibold sm:text-base"
          style={{ color: "var(--fg-strong)" }}
        >
          {title}
        </h2>
      </div>

      {/* Bloco direito: toggle de view */}
      <div
        role="tablist"
        aria-label="Visualizacao do calendario"
        className="inline-flex self-start rounded-md border p-0.5 sm:self-auto"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-default)",
        }}
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
// Subcomponente: botao de navegacao (prev/next)
// --------------------------------------------
interface NavButtonProps {
  onClick: () => void;
  ariaLabel: string;
  children: React.ReactNode;
}

function NavButton({ onClick, ariaLabel, children }: NavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border transition-all hover:-translate-y-px focus:outline-none focus-visible:ring-2"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: "var(--border-default)",
        color: "var(--fg-default)",
      }}
    >
      {children}
    </button>
  );
}

// --------------------------------------------
// Subcomponente: toggle Dia/Semana com pill dourado
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
      className="inline-flex h-8 items-center justify-center rounded px-4 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2"
      style={
        active
          ? {
              background: "var(--brand-gradient, var(--brand-500))",
              color: "var(--brand-fg)",
              boxShadow: "var(--metal-highlight), var(--shadow-gold, none)",
            }
          : {
              backgroundColor: "transparent",
              color: "var(--fg-subtle)",
            }
      }
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

const weekYearFmt = new Intl.DateTimeFormat("pt-BR", { year: "numeric" });

function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

function getWeekStart(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function shiftDate(date: Date, view: CalendarView, direction: 1 | -1): Date {
  const result = new Date(date);
  const delta = view === "day" ? 1 : 7;
  result.setDate(result.getDate() + delta * direction);
  return result;
}

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

function capitalize(str: string): string {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
