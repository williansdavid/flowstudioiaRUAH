import type { StudioBranding } from '@/config/studio.types';

/**
 * Pipeline UNICO de branding white-label (SSR-safe).
 *
 * RESPONSABILIDADE:
 *   - Injetar APENAS a identidade visual do studio (cor da marca).
 *   - NAO sobrescreve tokens visuais do tema (--bg-page, --fg-*, --surface-*).
 *   - O tema completo vem do CSS (classic.css | soft.css | premium.css).
 *
 * REGRA DE OURO:
 *   classic.css = visual do tema (igual para todos os studios do mesmo tema)
 *   applyBranding = identidade do studio (cor unica de cada cliente)
 *
 * Alinhado ao DESIGN_SYSTEM_RUAH.md (Bloco 8.4).
 */

function getContrastColor(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return '#ffffff';
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.55 ? '#0A0A0B' : '#FFFFFF';
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Tokens que o branding INJETA via SSR.
 * Apenas brand colors + shadow derivada da brand.
 * NAO inclui --surface, --fg, --border (esses vem do tema CSS).
 */
export interface BrandingTokens {
  '--brand-50': string;
  '--brand-100': string;
  '--brand-300': string;
  '--brand-500': string;
  '--brand-600': string;
  '--brand-700': string;
  '--brand-900': string;
  '--brand-fg': string;

  /** Aliases legacy (retrocompat com componentes antigos) */
  '--brand-primary': string;
  '--brand-secondary': string;
  '--brand-accent': string;

  /** Sombra derivada da brand (precisa do RGB da cor do studio) */
  '--shadow-gold': string;
}

/**
 * Gera CSS vars a partir do branding do studio.
 * Apenas BRAND COLORS — nao toca em surface/fg/border.
 */
export function buildBrandingTokens(branding: StudioBranding): BrandingTokens {
  const brand = branding.primary;
  const brandFg = branding.primaryForeground ?? getContrastColor(brand[500]);
  const shadowGold = `0 4px 20px ${hexToRgba(brand[500], 0.25)}`;

  return {
    '--brand-50': brand[50],
    '--brand-100': brand[100],
    '--brand-300': brand[300],
    '--brand-500': brand[500],
    '--brand-600': brand[600],
    '--brand-700': brand[700],
    '--brand-900': brand[900],
    '--brand-fg': brandFg,

    '--brand-primary': brand[500],
    '--brand-secondary': branding.secondaryColor,
    '--brand-accent': branding.accentColor,

    '--shadow-gold': shadowGold,
  };
}

/**
 * Converte tokens em string CSS para style inline do <html>.
 */
export function brandingTokensToCss(tokens: BrandingTokens): string {
  return Object.entries(tokens)
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
}
