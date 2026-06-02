/**
 * Contratos públicos do studio.
 *
 * Tipos compartilhados entre server (fetchers) e client (UI da landing).
 * Sem sufixo .server porque devem ser importáveis em qualquer bundle.
 *
 * Convenção:
 *   - camelCase (UI-facing)
 *   - shape estável independente do schema interno do Supabase
 *   - adapters em ./services.ts (etc) traduzem snake_case → camelCase
 */

/**
 * Item público de serviço exibido na landing.
 * Espelha o shape consumido pelo ServicesSection do studio.
 */
export interface PublicServiceItem {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  durationMinutes: number;
  imageUrl: string | null;
}
