import { forwardRef, type CSSProperties, type MouseEvent } from "react";
import type { AppointmentStatus } from "@/features/appointments/types";
import { APPOINTMENT_STATUS_LABEL } from "@/features/appointments/utils/status";
import { CALENDAR_SLOT_HEIGHT_PX } from "../constants";
import { cn } from "@/lib/utils/cn";
import type { PositionedAppointment } from "../types";

interface AppointmentCardProps {
  positioned: PositionedAppointment;
  onClick?: (positioned: PositionedAppointment) => void;
  className?: string;
}

/**
 * ============================================
 * Mapa de status -> tokens visuais do tema.
 * ============================================
 *
 * IMPORTANTE:
 *  - Tokens declarados em src/styles/themes/luxury.css (linha 125-134).
 *  - Status `no_show` (TS underscore) mapeia pra `--status-no-show-*` (CSS hifen).
 *  - Borda esquerda usa o proprio `fg` do status (3px solido) pra identificacao.
 *  - Fallback OKLCH inline garante funcionamento em temas que ainda nao
 *    declararam os tokens (classic/premium/soft).
 *
 * Cancelado / no_show: muted (opacity 60% + line-through no nome).
 */
const statusTokens: Record<
  AppointmentStatus,
  { bg: string; fg: string; muted: boolean }
> = {
  pending: {
    bg: "var(--status-pending-bg, oklch(0.78 0.14 80 / 0.15))",
    fg: "var(--status-pending-fg, oklch(0.85 0.12 82))",
    muted: false,
  },
  confirmed: {
    bg: "var(--status-confirmed-bg, oklch(0.70 0.10 230 / 0.15))",
    fg: "var(--status-confirmed-fg, oklch(0.82 0.08 230))",
    muted: false,
  },
  completed: {
    bg: "var(--status-completed-bg, oklch(0.72 0.13 145 / 0.15))",
    fg: "var(--status-completed-fg, oklch(0.82 0.11 145))",
    muted: false,
  },
  cancelled: {
    bg: "var(--status-cancelled-bg, oklch(0.65 0.18 25 / 0.15))",
    fg: "var(--status-cancelled-fg, oklch(0.78 0.14 25))",
    muted: true,
  },
  // ATENCAO: TS usa underscore, CSS token usa hifen.
  no_show: {
    bg: "var(--status-no-show-bg, oklch(0.45 0.01 65 / 0.20))",
    fg: "var(--status-no-show-fg, oklch(0.70 0.01 65))",
    muted: true,
  },
};

const timeFmt = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Card visual de UM agendamento.
 *
 * Conteudo adaptativo por altura:
 *  - 1 slot (30min):  hora inicio + nome
 *  - 2 slots (60min): hora inicio-fim + nome + servico
 *  - 3+ slots:        hora inicio-fim + nome + servico + staff
 *
 * Posicionamento: absolute dentro do wrapper de coluna do CalendarGrid.
 * Clipping: indicador "..." no topo/rodape se appointment ultrapassa janela 08:00-20:00.
 */
export const AppointmentCard = forwardRef<HTMLElement, AppointmentCardProps>(
  function AppointmentCard({ positioned, onClick, className }, ref) {
    const {
      appointment,
      visibleSlotStart,
      visibleSlotEnd,
      isClippedStart,
      isClippedEnd,
    } = positioned;

    const slotsVisible = visibleSlotEnd - visibleSlotStart;
    const tokens = statusTokens[appointment.status];

    const start = new Date(appointment.startsAt);
    const end = new Date(appointment.endsAt);
    const startLabel = timeFmt.format(start);
    const endLabel = timeFmt.format(end);

    // Estilo inline: backgroundColor + cor da borda esquerda derivada do fg
    const style: CSSProperties = {
      top: `${visibleSlotStart * CALENDAR_SLOT_HEIGHT_PX}px`,
      height: `${slotsVisible * CALENDAR_SLOT_HEIGHT_PX}px`,
      backgroundColor: tokens.bg,
      color: tokens.fg,
      borderLeftColor: tokens.fg,
      borderLeftWidth: "3px",
      borderLeftStyle: "solid",
      borderRightColor: "var(--border-subtle)",
      borderTopColor: "var(--border-subtle)",
      borderBottomColor: "var(--border-subtle)",
      borderRightWidth: "1px",
      borderTopWidth: "1px",
      borderBottomWidth: "1px",
      borderRightStyle: "solid",
      borderTopStyle: "solid",
      borderBottomStyle: "solid",
    };

    const showRange = slotsVisible >= 2;
    const showService = slotsVisible >= 2;
    const showStaff = slotsVisible >= 3;

    const ariaLabel = [
      `Agendamento de ${appointment.clientName}`,
      appointment.serviceName,
      `com ${appointment.staffName}`,
      `das ${startLabel} as ${endLabel}`,
      APPOINTMENT_STATUS_LABEL[appointment.status],
    ].join(", ");

    const baseClasses = cn(
      "absolute inset-x-1 z-10 overflow-hidden px-2 py-1 text-left text-xs",
      "transition-all duration-150 ease-out",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
      "focus-visible:ring-[var(--border-focus)]",
      // Arredondamento condicional por clipping
      isClippedStart ? "rounded-b-md" : "rounded-md",
      isClippedEnd && !isClippedStart && "rounded-t-md rounded-b-none",
      isClippedStart && isClippedEnd && "rounded-none",
      tokens.muted && "opacity-60",
      onClick &&
        "cursor-pointer hover:-translate-y-px hover:shadow-[var(--elevation-floating)]",
      className,
    );

    const content = (
      <>
        {isClippedStart && (
          <div
            className="text-center text-[10px] leading-none opacity-60"
            aria-hidden
          >
            ⋯
          </div>
        )}

        {/* Linha 1: hora (range se altura permitir) */}
        <div className="flex items-baseline gap-1 font-semibold leading-tight tabular-nums">
          <span>{startLabel}</span>
          {showRange && (
            <>
              <span className="opacity-50" aria-hidden>
                –
              </span>
              <span className="opacity-75">{endLabel}</span>
            </>
          )}
        </div>

        {/* Linha 2: nome do cliente */}
        <div
          className={cn(
            "mt-0.5 truncate text-[12px] font-semibold leading-tight",
            tokens.muted && "line-through",
          )}
          title={appointment.clientName}
        >
          {appointment.clientName}
        </div>

        {/* Linha 3: servico */}
        {showService && (
          <div
            className="mt-0.5 truncate text-[11px] leading-tight opacity-80"
            title={appointment.serviceName}
          >
            {appointment.serviceName}
          </div>
        )}

        {/* Linha 4: staff (so com altura confortavel) */}
        {showStaff && (
          <div
            className="mt-0.5 truncate text-[10px] uppercase leading-tight tracking-wide opacity-60"
            title={appointment.staffName}
          >
            {appointment.staffName}
          </div>
        )}

        {isClippedEnd && (
          <div
            className="text-center text-[10px] leading-none opacity-60"
            aria-hidden
          >
            ⋯
          </div>
        )}
      </>
    );

    if (onClick) {
      const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onClick(positioned);
      };
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          onClick={handleClick}
          aria-label={ariaLabel}
          style={style}
          className={baseClasses}
        >
          {content}
        </button>
      );
    }

    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        role="article"
        aria-label={ariaLabel}
        style={style}
        className={baseClasses}
      >
        {content}
      </div>
    );
  },
);
