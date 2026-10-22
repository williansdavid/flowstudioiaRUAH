// src/features/appointments/components/calendar/geometry.ts

import type { GridWindow, PositionedBlock } from './geometry.types'

// ── Constantes de escala ─────────────────────────────────────────
/** Granularidade do slot, em minutos. */
export const SLOT_MINUTES = 15
/** Altura de um slot, em px. (15min = 24px → 1h = 96px) */
export const SLOT_HEIGHT = 24
/** Margem antes/depois do expediente, em minutos. */
export const SLOT_MARGIN = 30
/** Altura mínima de um bloco, em px (legibilidade). */
const MIN_BLOCK_HEIGHT = 16

// ── Janela do dia ────────────────────────────────────────────────

/** Dia do businessHours já resolvido (formato HH:mm ou fechado). */
export interface DayHours {
  open: boolean
  opensAt?: string
  closesAt?: string
}

/** Converte "HH:mm" em minutos desde 00:00. Retorna null se inválido. */
export function hhmmToMin(value: string | undefined): number | null {
  if (!value) return null
  const [h, m] = value.split(':')
  const hours = Number(h)
  const mins = Number(m)
  if (!Number.isFinite(hours) || !Number.isFinite(mins)) return null
  return hours * 60 + mins
}

/**
 * Deriva a janela visível da grade a partir do horário do dia.
 * Aplica margem antes/depois. Retorna null se o dia está fechado.
 */
export function deriveGridWindow(
  day: DayHours,
  marginMin = SLOT_MARGIN,
): GridWindow | null {
  if (!day.open) return null
  const open = hhmmToMin(day.opensAt)
  const close = hhmmToMin(day.closesAt)
  if (open === null || close === null || close <= open) return null

  const startMin = Math.max(0, open - marginMin)
  const endMin = Math.min(24 * 60, close + marginMin)
  return { startMin, endMin }
}

/** Altura total da grade, em px. */
export function gridHeight(window: GridWindow): number {
  return ((window.endMin - window.startMin) / SLOT_MINUTES) * SLOT_HEIGHT
}

// ── Conversões tempo ⇄ pixel ─────────────────────────────────────

/** ISO datetime → minutos desde 00:00 (hora local). */
export function isoToMinutes(iso: string): number {
  const d = new Date(iso)
  return d.getHours() * 60 + d.getMinutes()
}

/** Minutos desde 00:00 → posição Y na grade, em px. */
export function timeToY(minutesOfDay: number, window: GridWindow): number {
  return ((minutesOfDay - window.startMin) / SLOT_MINUTES) * SLOT_HEIGHT
}

/** Posição Y na grade → minutos desde 00:00. */
export function yToTime(y: number, window: GridWindow): number {
  return window.startMin + (y / SLOT_HEIGHT) * SLOT_MINUTES
}

/** Arredonda minutos para o slot mais próximo (snap de 15 em 15). */
export function snapToSlot(minutes: number): number {
  return Math.round(minutes / SLOT_MINUTES) * SLOT_MINUTES
}

// ── Layout do dia (resolução de overlap em lanes) ────────────────

/** Entrada mínima necessária para posicionar um bloco. */
export interface LayoutInput {
  appointmentId: string
  staffId: string
  /** ISO datetime de início. */
  startsAt: string
  /** ISO datetime de fim. */
  endsAt: string
}

interface Interval extends LayoutInput {
  startMin: number
  endMin: number
}

/**
 * Posiciona os agendamentos do dia na grade.
 *
 * - `columnIndex` vem da ordem de `staffIds`.
 * - Blocos sobrepostos do MESMO staff são divididos em lanes
 *   (algoritmo de varredura por grupos de overlap).
 * - Agendamentos de staff fora de `staffIds` são ignorados.
 */
export function layoutDay(
  items: LayoutInput[],
  staffIds: string[],
  window: GridWindow,
): PositionedBlock[] {
  const columnByStaff = new Map<string, number>()
  staffIds.forEach((id, i) => columnByStaff.set(id, i))

  const result: PositionedBlock[] = []

  // Processa coluna por coluna (cada staff resolve overlap isolado).
  for (const staffId of staffIds) {
    const columnIndex = columnByStaff.get(staffId)!

    const intervals: Interval[] = items
      .filter((it) => it.staffId === staffId)
      .map((it) => ({
        ...it,
        startMin: isoToMinutes(it.startsAt),
        endMin: isoToMinutes(it.endsAt),
      }))
      .filter((it) => it.endMin > it.startMin)
      .sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin)

    // Agrupa intervalos que se sobrepõem em cadeia.
    let group: Interval[] = []
    let groupMaxEnd = -Infinity

    const flush = () => {
      if (group.length === 0) return
      placeGroup(group, columnIndex, window, result)
      group = []
      groupMaxEnd = -Infinity
    }

    for (const iv of intervals) {
      if (group.length > 0 && iv.startMin >= groupMaxEnd) flush()
      group.push(iv)
      groupMaxEnd = Math.max(groupMaxEnd, iv.endMin)
    }
    flush()
  }

  return result
}

/** Distribui um grupo de intervalos sobrepostos em lanes. */
function placeGroup(
  group: Interval[],
  columnIndex: number,
  window: GridWindow,
  out: PositionedBlock[],
): void {
  // laneEndMin[lane] = fim do último bloco naquela lane.
  const laneEndMin: number[] = []
  const laneOf = new Map<string, number>()

  for (const iv of group) {
    let lane = laneEndMin.findIndex((end) => iv.startMin >= end)
    if (lane === -1) {
      lane = laneEndMin.length
      laneEndMin.push(iv.endMin)
    } else {
      laneEndMin[lane] = iv.endMin
    }
    laneOf.set(iv.appointmentId, lane)
  }

  const laneCount = laneEndMin.length

  for (const iv of group) {
    const top = timeToY(iv.startMin, window)
    const rawHeight = timeToY(iv.endMin, window) - top
    out.push({
      appointmentId: iv.appointmentId,
      columnIndex,
      top,
      height: Math.max(MIN_BLOCK_HEIGHT, rawHeight),
      lane: laneOf.get(iv.appointmentId)!,
      laneCount,
    })
  }
}
