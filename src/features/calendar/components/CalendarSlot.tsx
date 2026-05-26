/**
 * ============================================
 * CalendarSlot
 * ============================================
 *
 * Celula vazia do grid. Renderiza o "fundo" de cada slot de 30min.
 *
 * - Click opcional (callback do parent).
 * - Visual leve: linha tracejada sutil pra separacao.
 * - Hover sutil pra indicar interatividade quando clicavel.
 *
 * IMPORTANTE: AppointmentCards sao renderizados POR CIMA destes slots
 * (mesma celula do grid, mas z-index maior).
 */

interface CalendarSlotProps {
  /** Indice do slot (0 = 08:00, 1 = 08:30, ...). */
  slotIndex: number;
  /** Coluna do grid (1-based, pq col 1 = time column). */
  columnIndex: number;
  /** Se fornecido, slot vira clicavel. */
  onClick?: () => void;
  /** Para acessibilidade — descreve o slot ao screen reader. */
  ariaLabel?: string;
}

export function CalendarSlot({
  slotIndex,
  columnIndex,
  onClick,
  ariaLabel,
}: CalendarSlotProps) {
  const isHourBoundary = slotIndex % 2 === 0; // 08:00, 09:00, ... (slots pares)
  const baseClasses =
    "border-neutral-100 transition-colors " +
    (isHourBoundary ? "border-t" : "border-t border-dashed");

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className={`${baseClasses} hover:bg-neutral-50 focus:bg-neutral-100 focus:outline-none`}
        style={{
          gridRow: slotIndex + 2,
          gridColumn: columnIndex,
        }}
      />
    );
  }

  return (
    <div
      className={baseClasses}
      style={{
        gridRow: slotIndex + 2,
        gridColumn: columnIndex,
      }}
      aria-hidden="true"
    />
  );
}
