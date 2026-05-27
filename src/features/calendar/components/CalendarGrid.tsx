/**
 * ============================================
 * CalendarGrid
 * ============================================
 *
 * Container generico do grid de calendario.
 * Tematizado via tokens CSS — funciona em qualquer skin (luxury, classic, soft...).
 *
 * Responsabilidades:
 *  - Definir CSS Grid (linhas = slots, colunas = N + 1 (time column))
 *  - Renderizar coluna de horarios
 *  - Renderizar header das colunas (via renderHeader)
 *  - Renderizar conteudo de cada coluna (via renderColumn)
 *  - Renderizar slots vazios (background)
 *  - Linha do agora (se aplicavel)
 *  - Auto-scroll pra hora atual no mount (se alguma coluna tiver showNowLine)
 *
 * Render-prop pattern: o parent (DayView/WeekView) decide o que renderizar
 * em cada coluna, mas o GRID em si e generico.
 */

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import {
  CALENDAR_DAY_END_HOUR,
  CALENDAR_DAY_START_HOUR,
  CALENDAR_SLOTS_PER_DAY,
  CALENDAR_SLOT_HEIGHT_PX,
  dateToSlotIndex,
} from "../constants";
import { CalendarTimeColumn } from "./CalendarTimeColumn";
import { CalendarSlot } from "./CalendarSlot";
import { CalendarNowLine } from "./CalendarNowLine";

export interface CalendarGridColumn<T> {
  key: string;
  data: T;
  showNowLine?: boolean;
  /** Se true, header da coluna recebe destaque dourado (dia atual). */
  isToday?: boolean;
}

interface CalendarGridProps<T> {
  columns: CalendarGridColumn<T>[];
  renderHeader: (column: CalendarGridColumn<T>) => ReactNode;
  renderColumn: (column: CalendarGridColumn<T>, columnIndex: number) => ReactNode;
  onSlotClick?: (
    column: CalendarGridColumn<T>,
    slotIndex: number,
  ) => void;
}

/**
 * Quantos slots de "folga" acima da hora atual queremos mostrar
 * apos o auto-scroll. 2 slots = 1 hora de contexto antes do "agora".
 */
const AUTO_SCROLL_OFFSET_SLOTS = 2;

export function CalendarGrid<T>({
  columns,
  renderHeader,
  renderColumn,
  onSlotClick,
}: CalendarGridProps<T>) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const didAutoScrollRef = useRef(false);

  const gridRowsTemplate = useMemo(
    () =>
      `48px repeat(${CALENDAR_SLOTS_PER_DAY}, ${CALENDAR_SLOT_HEIGHT_PX}px)`,
    [],
  );

  const gridColumnsTemplate = useMemo(
    () => `64px repeat(${columns.length}, minmax(140px, 1fr))`,
    [columns.length],
  );

  /**
   * Auto-scroll pra hora atual.
   *
   * Roda apenas se:
   *  - alguma coluna tem showNowLine=true (ou seja, "hoje" esta visivel)
   *  - ainda nao rolamos nesta montagem
   *
   * Calculo:
   *  - slotIndex da hora atual via dateToSlotIndex
   *  - clamp entre 0 e CALENDAR_SLOTS_PER_DAY-1 (pra horas fora da janela)
   *  - scrollTop = (slotIndex - offset) * SLOT_HEIGHT
   *  - header sticky de 48px nao precisa entrar no calculo
   *    (scrollTop=0 ja deixa o header colado no topo)
   */
  const shouldAutoScroll = columns.some((c) => c.showNowLine === true);

useEffect(() => {
  if (!shouldAutoScroll) {
    console.log("[CalendarGrid] auto-scroll SKIPPED: shouldAutoScroll=false");
    return;
  }
  if (didAutoScrollRef.current) {
    console.log("[CalendarGrid] auto-scroll SKIPPED: ja rolou");
    return;
  }

  const container = scrollContainerRef.current;
  if (!container) {
    console.log("[CalendarGrid] auto-scroll SKIPPED: container nao montado");
    return;
  }

  const now = new Date();
  const hour = now.getHours();

  // Antes da janela operacional -> topo
  if (hour < CALENDAR_DAY_START_HOUR) {
    container.scrollTop = 0;
    didAutoScrollRef.current = true;
    return;
  }

  // Depois da janela -> fim
  if (hour >= CALENDAR_DAY_END_HOUR) {
    container.scrollTop = container.scrollHeight;
    didAutoScrollRef.current = true;
    return;
  }

  const rawSlotIndex = dateToSlotIndex(now);
  const targetSlotIndex = Math.max(
    0,
    Math.min(
      CALENDAR_SLOTS_PER_DAY - 1,
      rawSlotIndex - AUTO_SCROLL_OFFSET_SLOTS,
    ),
  );
  const targetScrollTop = targetSlotIndex * CALENDAR_SLOT_HEIGHT_PX;

  // Tenta rolar com retry: layout pode nao estar pronto na primeira passada
  const tryScroll = (attempt: number) => {
    if (!container) return;

    const canScroll = container.scrollHeight > container.clientHeight;

    console.log(`[CalendarGrid] auto-scroll attempt ${attempt}:`, {
      hour,
      rawSlotIndex,
      targetSlotIndex,
      targetScrollTop,
      scrollHeight: container.scrollHeight,
      clientHeight: container.clientHeight,
      canScroll,
    });

    if (!canScroll && attempt < 3) {
      // Layout ainda nao tem altura -> tenta de novo
      setTimeout(() => tryScroll(attempt + 1), 100);
      return;
    }

    container.scrollTop = targetScrollTop;
    didAutoScrollRef.current = true;

    console.log("[CalendarGrid] auto-scroll DONE. scrollTop=", container.scrollTop);
  };

  // Dupla rAF garante que o React commitou + browser pintou
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      tryScroll(1);
    });
  });
}, [shouldAutoScroll]);


  return (
    <div
      ref={scrollContainerRef}
      className="relative h-full w-full overflow-auto rounded-xl border"
      style={
        {
          "--calendar-grid-rows": gridRowsTemplate,
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border-default)",
          boxShadow: "var(--elevation-raised), var(--metal-highlight)",
        } as React.CSSProperties
      }
    >
      <div
        className="relative grid min-w-fit"
        style={{
          gridTemplateRows: gridRowsTemplate,
          gridTemplateColumns: gridColumnsTemplate,
        }}
      >
        {/* === COLUNA DE HORARIOS === */}
        <CalendarTimeColumn />

        {/* === HEADERS das colunas de conteudo === */}
        {columns.map((col, idx) => (
          <div
            key={`header-${col.key}`}
            className="sticky top-0 z-10 flex items-center justify-center border-b border-l px-2 text-sm font-medium"
            style={{
              gridRow: 1,
              gridColumn: idx + 2,
              backgroundColor: col.isToday
                ? "oklch(0.72 0.12 80 / 0.08)"
                : "var(--bg-subtle)",
              borderBottomColor: "var(--border-default)",
              borderLeftColor: "var(--border-subtle)",
              color: col.isToday ? "var(--brand-300)" : "var(--fg-default)",
            }}
          >
            {renderHeader(col)}
          </div>
        ))}

        {/* === SLOTS VAZIOS (background clicavel) === */}
        {columns.map((col, colIdx) =>
          Array.from({ length: CALENDAR_SLOTS_PER_DAY }).map((_, slotIdx) => (
            <CalendarSlot
              key={`slot-${col.key}-${slotIdx}`}
              slotIndex={slotIdx}
              columnIndex={colIdx + 2}
              onClick={
                onSlotClick ? () => onSlotClick(col, slotIdx) : undefined
              }
              ariaLabel={`Slot ${slotIdx} da coluna ${col.key}`}
            />
          )),
        )}

        {/* === BORDA ESQUERDA + leve tint dourado se hoje === */}
        {columns.map((col, idx) => (
          <div
            key={`border-${col.key}`}
            className="pointer-events-none border-l"
            style={{
              gridRow: `2 / span ${CALENDAR_SLOTS_PER_DAY}`,
              gridColumn: idx + 2,
              borderLeftColor: "var(--border-subtle)",
              backgroundColor: col.isToday
                ? "oklch(0.72 0.12 80 / 0.025)"
                : "transparent",
            }}
            aria-hidden="true"
          />
        ))}

        {/* === CONTEUDO de cada coluna (appointments) === */}
        {columns.map((col, idx) => (
          <div
            key={`content-${col.key}`}
            className="relative"
            style={{
              gridRow: `2 / span ${CALENDAR_SLOTS_PER_DAY}`,
              gridColumn: idx + 2,
            }}
          >
            <CalendarNowLine show={col.showNowLine === true} />
            {renderColumn(col, idx + 2)}
          </div>
        ))}
      </div>
    </div>
  );
}
