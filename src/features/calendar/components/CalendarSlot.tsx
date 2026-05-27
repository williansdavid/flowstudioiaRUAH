/**
 * ============================================
 * CalendarSlot
 * ============================================
 *
 * Celula vazia do grid. Renderiza o "fundo" de cada slot de 30min.
 *
 * - Click opcional (callback do parent).
 * - Linha solida na hora cheia, tracejada no meio.
 * - Hover dourado translucido pra indicar interatividade.
 * - Tematizada via tokens CSS.
 */

interface CalendarSlotProps {
  slotIndex: number;
  columnIndex: number;
  onClick?: () => void;
  ariaLabel?: string;
}

export function CalendarSlot({
  slotIndex,
  columnIndex,
  onClick,
  ariaLabel,
}: CalendarSlotProps) {
  const isHourBoundary = slotIndex % 2 === 0; // 08:00, 09:00, ... (slots pares)

  const baseStyle: React.CSSProperties = {
    gridRow: slotIndex + 2,
    gridColumn: columnIndex,
    borderTopWidth: "1px",
    borderTopStyle: isHourBoundary ? "solid" : "dashed",
    borderTopColor: isHourBoundary
      ? "var(--border-default)"
      : "var(--border-subtle)",
    transition: "background-color 160ms ease",
  };

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className="group focus:outline-none"
        style={baseStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--bg-hover)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
        onFocus={(e) => {
          e.currentTarget.style.backgroundColor = "var(--bg-hover)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      />
    );
  }

  return <div style={baseStyle} aria-hidden="true" />;
}
