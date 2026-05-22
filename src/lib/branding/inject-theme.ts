import { studioConfig } from '@/config/studio.config';

/**
 * Gera o CSS de variáveis do studio para injeção no <head>.
 * Chamado no root SSR — garante FOUC zero.
 */
export function getStudioThemeCSS(): string {
  const { primaryColor } = studioConfig.branding;
  return `:root { --brand-primary: ${primaryColor}; }`;
}
