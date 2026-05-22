import { studioConfig } from './studio.config';

export { studioConfig };
export type * from './studio.types';

/**
 * Helpers derivados da config do studio.
 * Centralizam lógica de formatação para links externos e endereço.
 */
export const studioHelpers = {
  whatsappUrl: studioConfig.contact.whatsapp
    ? `https://wa.me/${studioConfig.contact.whatsapp.replace(/\D/g, '')}`
    : '',

  instagramUrl: studioConfig.contact.instagram
    ? `https://instagram.com/${studioConfig.contact.instagram.replace('@', '')}`
    : '',

  facebookUrl: studioConfig.contact.facebook
    ? `https://facebook.com/${studioConfig.contact.facebook.replace('@', '')}`
    : '',

  fullAddress: [
    `${studioConfig.address.street}, ${studioConfig.address.number}`,
    studioConfig.address.neighborhood,
    `${studioConfig.address.city} - ${studioConfig.address.state}`,
    studioConfig.address.zipCode,
  ]
    .filter(Boolean)
    .join(' — '),

  phoneFormatted: studioConfig.contact.phone,
} as const;
