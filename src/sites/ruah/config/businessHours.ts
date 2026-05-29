/**
 * Studio Business Hours — Ruah Barber Lounge
 * ----------------------------------------------------------------
 * Horário de funcionamento. Usado no footer, seção de contato,
 * Schema.org e indicador "Aberto agora".
 *
 * Formato 24h (HH:mm).
 *
 * TODO: Willians — confirmar horários reais.
 * ----------------------------------------------------------------
 */

import type { BusinessHours } from '../types'

export const businessHours: BusinessHours = {
  sunday:    { open: false },
  monday:    { open: false },
  tuesday:   { open: true,  opensAt: '09:00', closesAt: '19:00' },
  wednesday: { open: true,  opensAt: '09:00', closesAt: '19:00' },
  thursday:  { open: true,  opensAt: '09:00', closesAt: '19:00' },
  friday:    { open: true,  opensAt: '09:00', closesAt: '19:00' },
  saturday:  { open: true,  opensAt: '08:00', closesAt: '16:00' },
}
