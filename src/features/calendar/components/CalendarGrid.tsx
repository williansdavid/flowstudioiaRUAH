/**
 * ============================================
 * CalendarGrid
 * ============================================
 *
 * Container generico do grid de calendario.
 *
 * Responsabilidades:
 *  - Definir CSS Grid (linhas = slots, colunas = N + 1 (time column))
 *  - Renderizar coluna de horarios
 *  - Renderizar header das colunas (via renderHeader)
 *  - Renderizar conteudo de cada coluna (via renderColumn)
 *  - Renderizar slots vazios (background)
 *  - Linha do agora (se aplicavel)
 *
 * Render-prop pattern: o parent (DayView/WeekView) decide o que renderizar
 * em cada coluna, mas o GRID em si e generico.
 */

import { useMemo, type ReactNode } from "react";
import {
  CALENDAR_SLOTS_PER_DAY,
  CALENDAR_SLOT_HEIGHT_PX,
} from "../constants";
import { CalendarTimeColumn } from "./CalendarTimeColumn";
import { CalendarSlot } from "./CalendarSlot";
import { CalendarNowLine } from "./CalendarNowLine";

export interface CalendarGridColumn<T> {
  /** Chave estavel pra React (staffId ou ISO da data). */
  key: string;
  /** Dado arbitrario passado pra renderHeader/renderColumn. */
  data: T;
  /**
   * Se true, mostra a linha vermelha de "agora" sobre esta coluna.
   * (Tipicamente: true SOMENTE se a coluna representa o dia/staff "agora").
   */
  showNowLine?: boolean;
}

interface CalendarGridProps<T> {
  /** Lista de colunas a renderizar (alem da time column). */
  columns: CalendarGridColumn<T>[];
  /** Renderiza o header de cada coluna (nome do staff, data, etc). */
  renderHeader: (column: CalendarGridColumn<T>) => ReactNode;
  /** Renderiza o conteudo (cards) de cada coluna. */
  renderColumn: (column: CalendarGridColumn<T>, columnIndex: number) => ReactNode;
  /**
   * Click em slot vazio. Recebe coluna e indice do slot.
   * Se omitido, slots nao sao clicaveis.
   */
  onSlotClick?: (
    column: CalendarGridColumn<T>,
    slotIndex: number,
  ) => void;
}

export function CalendarGrid<T>({
  columns,
  renderHeader,
  renderColumn,
  onSlotClick,
}: CalendarGridProps<T>) {
  // grid-template-rows: header (48px) + 24 slots
  const gridRowsTemplate = useMemo(
    () =>
      `48px repeat(${CALENDAR_SLOTS_PER_DAY}, ${CALENDAR_SLOT_HEIGHT_PX}px)`,
    [],
  );

  // grid-template-columns: time col (64px) + N colunas (1fr)
  const gridColumnsTemplate = useMemo(
    () => `64px repeat(${columns.length}, minmax(140px, 1fr))`,
    [columns.length],
  );

  return (
    <div
      className="relative w-full overflow-auto rounded-lg border border-neutral-200 bg-white"
      style={
        {
          "--calendar-grid-rows": gridRowsTemplate,
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
            className="sticky top-0 z-10 flex items-center justify-center border-b border-l border-neutral-200 bg-white px-2 text-sm font-medium text-neutral-700"
            style={{
              gridRow: 1,
              gridColumn: idx + 2,
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

        {/* === BORDA ESQUERDA de cada coluna de conteudo === */}
        {columns.map((col, idx) => (
          <div
            key={`border-${col.key}`}
            className="pointer-events-none border-l border-neutral-200"
            style={{
              gridRow: `2 / span ${CALENDAR_SLOTS_PER_DAY}`,
              gridColumn: idx + 2,
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
            {/* Linha do agora (se aplicavel pra esta coluna) */}
            <CalendarNowLine show={col.showNowLine === true} />
            {/* Cards renderizados pelo parent */}
            {renderColumn(col, idx + 2)}
          </div>
        ))}
      </div>
    </div>
  );
}
