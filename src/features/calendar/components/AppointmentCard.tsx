import { forwardRef, type CSSProperties, type MouseEvent } from "react";
import type { AppointmentStatus } from "@/features/appointments/types";
import { APPOINTMENT_STATUS_LABEL } from "@/features/appointments/utils/status";
import { CALENDAR_SLOT_HEIGHT_PX } from "../constants";
import { cn } from "@/lib/utils/cn";
import type { PositionedAppointment } from "../types";

interface AppointmentCardProps {
  /** Agendamento ja posicionado pelo slot-mapping (ver slot-mapping.ts). */
  positioned: PositionedAppointment;
  /** Callback opcional disparado ao clicar no card (ligado na fase 8.5). */
  onClick?: (positioned: PositionedAppointment) => void;
  /** Classe extra opcional. */
  className?: string;
}

/**
 * Mapa de status -> estilos visuais do card.
 *
 * Convencao:
 *  - borda esquerda solida com cor forte (identificacao rapida)
 *  - background suave da mesma familia de cor
 *  - texto escuro pra contraste AA
 *
 * Cores alinhadas com `components/ui/Badge.tsx`.
 *
 * Status `cancelled` e `no_show` recebem tratamento "morto":
 *  opacidade reduzida + line-through aplicado no nome do cliente.
 */
const statusStyles: Record<
  AppointmentStatus,
  { border: string; bg: string; text: string; muted: boolean }
> = {
  pending: {
    border: "border-l-amber-500",
    bg: "bg-amber-50 hover:bg-amber-100",
    text: "text-amber-900",
    muted: false,
  },
  confirmed: {
    border: "border-l-blue-500",
    bg: "bg-blue-50 hover:bg-blue-100",
    text: "text-blue-900",
    muted: false,
  },
  completed: {
    border: "border-l-green-500",
    bg: "bg-green-50 hover:bg-green-100",
    text: "text-green-900",
    muted: false,
  },
  cancelled: {
    border: "border-l-neutral-400",
    bg: "bg-neutral-50 hover:bg-neutral-100",
    text: "text-neutral-700",
    muted: true,
  },
  no_show: {
    border: "border-l-red-500",
    bg: "bg-red-50 hover:bg-red-100",
    text: "text-red-900",
    muted: true,
  },
};

const timeFmt = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Card visual de UM agendamento dentro do calendario.
 *
 * Renderizacao:
 *  - Posicionado via `position: absolute` dentro do wrapper relativo de coluna
 *    que o CalendarGrid renderiza (gridRow: 2 / span 24).
 *  - `top` = visibleSlotStart * CALENDAR_SLOT_HEIGHT_PX
 *  - `height` = (visibleSlotEnd - visibleSlotStart) * CALENDAR_SLOT_HEIGHT_PX
 *
 * Clipping (overflow do horario fora da janela 08:00-20:00):
 *  - isClippedStart: arredondamento removido no topo + indicador "..."
 *  - isClippedEnd:   arredondamento removido no rodape + indicador "..."
 *
 * Conteudo adaptativo:
 *  - 1 slot visivel (30min):  hora + nome do cliente
 *  - 2+ slots visiveis (60min+): hora + nome + servico
 *
 * Acessibilidade:
 *  - <button> quando ha onClick, <div role="article"> caso contrario
 *  - aria-label completo cobre cliente, servico, staff, horario e status
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
    const style: CSSProperties = {
      top: `${visibleSlotStart * CALENDAR_SLOT_HEIGHT_PX}px`,
      height: `${slotsVisible * CALENDAR_SLOT_HEIGHT_PX}px`,
    };

    const statusStyle = statusStyles[appointment.status];
    const start = new Date(appointment.startsAt);
    const end = new Date(appointment.endsAt);
    const startLabel = timeFmt.format(start);
    const endLabel = timeFmt.format(end);

    const showService = slotsVisible >= 2;

    const ariaLabel = [
      `Agendamento de ${appointment.clientName}`,
      appointment.serviceName,
      `com ${appointment.staffName}`,
      `das ${startLabel} as ${endLabel}`,
      APPOINTMENT_STATUS_LABEL[appointment.status],
    ].join(", ");

    const baseClasses = cn(
      "absolute inset-x-1 z-10 overflow-hidden border border-l-[3px] border-neutral-200 px-2 py-1 text-left text-xs transition-colors",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
      // Arredondamento condicional por clipping
      isClippedStart ? "rounded-b-md" : "rounded-md",
      isClippedEnd && !isClippedStart && "rounded-t-md rounded-b-none",
      isClippedStart && isClippedEnd && "rounded-none",
      statusStyle.border,
      statusStyle.bg,
      statusStyle.text,
      statusStyle.muted && "opacity-60",
      onClick && "cursor-pointer",
      className,
    );

    const content = (
      <>
        {isClippedStart && (
          <div
            className="text-center text-[10px] leading-none opacity-60"
            aria-hidden
          >
            ...
          </div>
        )}
        <div className="flex items-baseline gap-1 font-semibold leading-tight">
          <span className="tabular-nums">{startLabel}</span>
        </div>
        <div
          className={cn(
            "mt-0.5 truncate font-medium leading-tight",
            statusStyle.muted && "line-through",
          )}
          title={appointment.clientName}
        >
          {appointment.clientName}
        </div>
        {showService && (
          <div
            className="mt-0.5 truncate text-[11px] leading-tight opacity-80"
            title={appointment.serviceName}
          >
            {appointment.serviceName}
          </div>
        )}
        {isClippedEnd && (
          <div
            className="text-center text-[10px] leading-none opacity-60"
            aria-hidden
          >
            ...
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
