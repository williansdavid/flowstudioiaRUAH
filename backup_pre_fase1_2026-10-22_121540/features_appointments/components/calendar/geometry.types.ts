// src/features/appointments/components/calendar/geometry.types.ts

/**
 * Tipos de VIEW do calendário (geometria/renderização).
 * NÃO são tipos de domínio — não confundir com AppointmentItem.
 */

/** Janela de horário visível na grade, em minutos desde 00:00. */
export interface GridWindow {
  /** Início da grade em minutos (ex: 510 = 08:30). */
  startMin: number
  /** Fim da grade em minutos (ex: 1170 = 19:30). */
  endMin: number
}

/** Bloco de agendamento já posicionado na grade. */
export interface PositionedBlock {
  appointmentId: string
  /** Coluna do staff (índice na lista de colunas). */
  columnIndex: number
  /** Posição vertical do topo, em px. */
  top: number
  /** Altura do bloco, em px. */
  height: number
  /** Faixa horizontal dentro da coluna (overlap). */
  lane: number
  /** Total de lanes no grupo de overlap (largura = 1/laneCount). */
  laneCount: number
}

/** Estado de arraste/redimensionamento (usado depois pelo bloco de drag). */
export interface DragState {
  appointmentId: string
  mode: 'move' | 'resize-start' | 'resize-end'
  /** Y inicial do ponteiro, em px relativos à grade. */
  originY: number
  /** Snapshot do bloco no início do drag. */
  initialTop: number
  initialHeight: number
  /** Coluna original (para detectar mudança de staff). */
  originColumnIndex: number
}
