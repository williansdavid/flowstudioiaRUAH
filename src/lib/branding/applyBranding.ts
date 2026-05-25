import type { StudioBranding } from '@/config/studio.types';

/**
 * Converte hex (#RRGGBB) em texto legível para texto sobre a cor.
 * Heurística simples: se a cor é "escura", retorna branco; senão preto.
 */
function getContrastColor(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return '#ffffff';

  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);

  // Luminância relativa (ITU-R BT.709)
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.55 ? '#0a0a0a' : '#ffffff';
}

export interface BrandingTokens {
  '--brand-primary': string;
  '--brand-fg': string;
  '--brand-secondary': string;
  '--brand-accent': string;
  '--surface': string;
  '--surface-muted': string;
  '--fg': string;
  '--fg-muted': string;
  '--border': string;
}

/**
 * Gera o objeto de CSS vars a partir do branding do studio.
 * Usado no SSR para injetar via style no <html>, sem flash.
 */
export function buildBrandingTokens(branding: StudioBranding): BrandingTokens {
  const isDark = branding.theme === 'dark';

  return {
    '--brand-primary': branding.primaryColor,
    '--brand-fg': getContrastColor(branding.primaryColor),
    '--brand-secondary': branding.secondaryColor,
    '--brand-accent': branding.accentColor,
    '--surface': isDark ? '#0a0a0a' : '#ffffff',
    '--surface-muted': isDark ? '#171717' : '#f5f5f5',
    '--fg': isDark ? '#fafafa' : '#0a0a0a',
    '--fg-muted': isDark ? '#a3a3a3' : '#525252',
    '--border': isDark ? '#262626' : '#e5e5e5',
  };
}

/**
 * Converte tokens em string CSS para injeção inline.
 * Ex: "--brand-primary:#d4af37;--brand-fg:#0a0a0a;..."
 */
export function brandingTokensToCss(tokens: BrandingTokens): string {
  return Object.entries(tokens)
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
}
