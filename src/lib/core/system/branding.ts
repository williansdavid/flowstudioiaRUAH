import type { BrandIdentity } from '@/lib/core/types/branding'

export const systemDark: BrandIdentity = {
  colors: {
    primary: '#22C55E',
    primaryHover: '#16A34A',
    accent: '#F97316',
    accentHover: '#16A34A',
    accentBright: '#4ADE80',
  },
  surfaces: {
    background: '#0B0F17',
    surface: '#131A24',
    surfaceAlt: '#1B2330',
    surfaceDark: '#0A0E14',
  },
  text: {
    heading: '#F1F5F9',
    body: '#CBD5E1',
    muted: '#94A3B8',
    onDark: '#F1F5F9',
    onDarkMuted: '#94A3B8',
  },
  ui: {
    border: '#1E293B',
    borderAccent: '#22C55E',
  },
  typography: {
    display: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    heading: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    body: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  logo: {
    dark: '',
    light: '',
    gold: '',
    alt: '',
  },
  shape: {
    card: '1.25rem',
    button: '0.875rem',
    pill: '9999px',
  },
  theme: 'system-dark',
}

export const systemLight: BrandIdentity = {
  // Mantido inalterado — tema claro original
  colors: {
    primary: '#6366F1',
    primaryHover: '#4F46E5',
    accent: '#8B5CF6',
    accentHover: '#7C3AED',
    accentBright: '#A78BFA',
  },
  surfaces: {
    background: '#FFFFFF',
    surface: '#F8FAFC',
    surfaceAlt: '#F1F5F9',
    surfaceDark: '#E2E8F0',
  },
  text: {
    heading: '#0F172A',
    body: '#334155',
    muted: '#64748B',
    onDark: '#F8FAFC',
    onDarkMuted: '#CBD5E1',
  },
  ui: {
    border: '#E2E8F0',
    borderAccent: '#6366F1',
  },
  typography: {
    display: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    heading: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    body: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  logo: {
    dark: '',
    light: '',
    gold: '',
    alt: '',
  },
  shape: {
    card: '0.75rem',
    button: '0.5rem',
    pill: '9999px',
  },
  theme: 'system-light',
}