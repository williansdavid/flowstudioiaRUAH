import { studioConfig } from './studio.config';
import type { StudioBusinessHours } from './studio.types';

/**
 * Helpers derivados do studioConfig.
 * Centralizam formatação/transformações comuns.
 */

/** Endereço formatado em uma linha — pronto pra exibir */
export function getFullAddress(): string {
  const { street, number, neighborhood, city, state, zipCode } =
    studioConfig.address;
  return `${street}, ${number} — ${neighborhood}, ${city}/${state} — ${zipCode}`;
}

/** URL do WhatsApp pronta para CTA */
export function getWhatsAppUrl(message?: string): string {
  const base = `https://wa.me/${studioConfig.contact.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Telefone formatado para exibição: +55 (14) 98189-3908 */
export function getFormattedPhone(): string {
  const phone = studioConfig.contact.phone.replace(/\D/g, '');
  if (phone.length === 13) {
    return `+${phone.slice(0, 2)} (${phone.slice(2, 4)}) ${phone.slice(4, 9)}-${phone.slice(9)}`;
  }
  return studioConfig.contact.phone;
}

/** Instagram URL — usa instagramUrl se existir, senão deriva do handle. Retorna null se não houver Instagram. */
export function getInstagramUrl(): string | null {
  if (studioConfig.contact.instagramUrl) {
    return studioConfig.contact.instagramUrl;
  }
  if (!studioConfig.contact.instagram) {
    return null;
  }
  const handle = studioConfig.contact.instagram.replace('@', '');
  return `https://www.instagram.com/${handle}`;
}

/** Verifica se o studio está aberto agora */
export function isOpenNow(): boolean {
  const now = new Date();
  const days: (keyof StudioBusinessHours)[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  const today = days[now.getDay()];

  if (!today) return false;

  const hours = studioConfig.businessHours[today];
  if (!hours) return false;

  const current = now.getHours() * 60 + now.getMinutes();
  const [openH = 0, openM = 0] = hours.open.split(':').map(Number);
  const [closeH = 0, closeM = 0] = hours.close.split(':').map(Number);

  return current >= openH * 60 + openM && current <= closeH * 60 + closeM;
}
