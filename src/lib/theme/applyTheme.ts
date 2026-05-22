import type { StudioBranding } from '@/config/studio.types';

/**
 * Converte branding do studio em CSS vars + classe de tema.
 * SSR-safe: retorna strings que serão injetadas no <html>.
 *
 * Naming alinhado ao tailwind.config.ts:
 *   --brand-primary, --brand-fg, --surface, --surface-muted
 */

export interface ThemeTokens {
  className: string;
  cssVars: Record<string, string>;
  styleString: string;
}

const lightPalette = {
  surface: '#ffffff',
  surfaceMuted: '#f5f5f5',
  fg: '#0a0a0a',
  fgMuted: '#525252',
  border: '#e5e5e5',
  brandFg: '#ffffff',
};

const darkPalette = {
  surface: '#0f0f0f',
  surfaceMuted: '#1a1a1a',
  fg: '#e8e8e8',
  fgMuted: '#a3a3a3',
  border: '#262626',
  brandFg: '#1a1a1a',
};

export function buildThemeTokens(branding: StudioBranding): ThemeTokens {
  const isDark = branding.theme === 'dark';
  const p = isDark ? darkPalette : lightPalette;

  const cssVars: Record<string, string> = {
    '--brand-primary': branding.primaryColor,
    '--brand-secondary': branding.secondaryColor,
    '--brand-accent': branding.accentColor,
    '--brand-fg': p.brandFg,
    '--surface': p.surface,
    '--surface-muted': p.surfaceMuted,
    '--fg': p.fg,
    '--fg-muted': p.fgMuted,
    '--border': p.border,
  };

  const styleString = Object.entries(cssVars)
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');

  return {
    className: isDark ? 'theme-dark' : 'theme-light',
    cssVars,
    styleString,
  };
}