/**
 * Barrel de exports da camada pública.
 *
 * Tudo aqui é seguro pra landing consumir:
 *   - tipos (PublicServiceItem, ...)
 *   - server fetchers (fetchPublicServices, ...)
 *
 * Conforme novos domínios públicos forem ativados (team, testimonials,
 * gallery, leads), adicionar exports neste arquivo.
 */

export type { PublicServiceItem } from './types';
export { fetchPublicServices } from './services';
