import {
  LayoutDashboard,
  CalendarPlus,
  CalendarCheck,
  User,
} from 'lucide-react'
import type { NavItem, NavSection } from '../types'

export const CLIENT_NAV_ITEMS: readonly NavItem[] = [
  {
    label: 'Dashboard',
    to: '/cliente',
    icon: LayoutDashboard,
    section: 'Início',
    roles: ['client'],
  },
  {
    label: 'Novo Agendamento',
    to: '/cliente/agendar',
    icon: CalendarPlus,
    section: 'Início',
    roles: ['client'],
  },
  {
    label: 'Meus Agendamentos',
    to: '/cliente/agendamentos',
    icon: CalendarCheck,
    section: 'Agenda',
    roles: ['client'],
  },
  {
    label: 'Meu Perfil',
    to: '/cliente/perfil',
    icon: User,
    section: 'Conta',
    roles: ['client'],
  },
] as const

const SECTION_ORDER = ['Início', 'Agenda', 'Conta'] as const

export function getGroupedClientNavItems(): NavSection[] {
  return SECTION_ORDER.map((section) => ({
    section,
    items: CLIENT_NAV_ITEMS.filter((item) => item.section === section),
  })).filter((group) => group.items.length > 0)
}