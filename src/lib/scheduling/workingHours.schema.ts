import { z } from 'zod'

/**
 * Formato de staff.working_hours (coluna jsonb, untyped no banco).
 * Este schema e a FONTE DE VERDADE do formato.
 *
 * Estrutura:
 *  - Chaves "0".."6" (0=domingo ... 6=sabado), todas obrigatorias.
 *  - Valor null  => folga fixa (staff nao trabalha nesse dia).
 *  - Valor objeto => { start, end, breaks } com horarios "HH:MM" 24h.
 *  - breaks => bloqueios recorrentes (ex.: almoco), pode ser [].
 *
 * Validacoes ativas:
 *  1. end > start no dia e em cada break.
 *  2. cada break contido na janela do dia (start <= break < end).
 *
 * NAO valida (nota): sobreposicao entre breaks. O algoritmo de
 * subtracao de intervalos (server fn de slots) tolera overlap.
 */

// "HH:MM" 24h — aceita 00:00 ate 23:59
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

const timeSchema = z
  .string()
  .regex(TIME_RE, 'Horario deve estar no formato HH:MM (24h)')

/** Converte "HH:MM" em minutos desde meia-noite. */
function toMinutes(time: string): number {
  const [h, m] = time.split(':') as [string, string]
  return Number(h) * 60 + Number(m)
}

const breakSchema = z
  .object({
    start: timeSchema,
    end: timeSchema,
  })
  .refine((b) => toMinutes(b.end) > toMinutes(b.start), {
    message: 'O fim do intervalo deve ser maior que o inicio',
    path: ['end'],
  })

const dayScheduleSchema = z
  .object({
    start: timeSchema,
    end: timeSchema,
    breaks: z.array(breakSchema),
  })
  // Validacao 1: jornada do dia coerente
  .refine((d) => toMinutes(d.end) > toMinutes(d.start), {
    message: 'O fim da jornada deve ser maior que o inicio',
    path: ['end'],
  })
  // Validacao 2: cada break dentro da janela do dia
  .refine(
    (d) =>
      d.breaks.every(
        (b) =>
          toMinutes(b.start) >= toMinutes(d.start) &&
          toMinutes(b.end) <= toMinutes(d.end),
      ),
    {
      message: 'Cada intervalo deve estar contido na jornada do dia',
      path: ['breaks'],
    },
  )

/** Valor de um dia: null (folga fixa) ou jornada com breaks. */
const dayEntrySchema = dayScheduleSchema.nullable()

/**
 * working_hours completo: as 7 chaves "0".."6" obrigatorias.
 * z.record nao garante presenca das chaves, por isso o objeto explicito.
 */
export const workingHoursSchema = z.object({
  '0': dayEntrySchema,
  '1': dayEntrySchema,
  '2': dayEntrySchema,
  '3': dayEntrySchema,
  '4': dayEntrySchema,
  '5': dayEntrySchema,
  '6': dayEntrySchema,
})

// ---- Types de dominio (derivados do schema) ----
export type WorkingHours = z.infer<typeof workingHoursSchema>
export type DaySchedule = z.infer<typeof dayScheduleSchema>
export type DayBreak = z.infer<typeof breakSchema>

/** Chaves validas dos dias da semana. */
export type WeekdayKey = keyof WorkingHours

/**
 * Parse seguro de um working_hours vindo do banco (Json | null).
 * Retorna null se invalido ou ausente — caller decide fallback.
 */
export function parseWorkingHours(value: unknown): WorkingHours | null {
  const result = workingHoursSchema.safeParse(value)
  return result.success ? result.data : null
}
