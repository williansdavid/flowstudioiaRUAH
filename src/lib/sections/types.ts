/**
 * Tipos compartilhados entre client e server para seções da landing.
 * Mantido sem sufixo .server para ser importável de qualquer bundle.
 */

/**
 * Item público de serviço usado pela landing.
 * Espelha o shape consumido por ServicesGrid/ServiceCard.
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