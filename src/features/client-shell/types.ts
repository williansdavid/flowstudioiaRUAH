import type { LucideIcon } from 'lucide-react'
import type { UserRole } from '@/features/auth/types'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  section: string
  roles: UserRole[]
}

export interface NavSection {
  section: string
  items: NavItem[]
}