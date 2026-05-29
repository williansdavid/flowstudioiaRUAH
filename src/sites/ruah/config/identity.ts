/**
 * Studio Identity — Ruah Barber Lounge
 * ----------------------------------------------------------------
 * Dados oficiais do studio. Fonte única da verdade para:
 *   - Header / Footer
 *   - Schema.org (LocalBusiness)
 *   - Meta tags SEO
 *   - Links de contato (WhatsApp, telefone, mapa)
 *
 * TODO: Willians — revisar e ajustar com dados reais finais.
 * ----------------------------------------------------------------
 */

import type { StudioIdentity } from '../types'

export const identity: StudioIdentity = {
  name: 'Ruah Barber Lounge',
  shortName: 'Ruah',
  slogan: 'Tradição, estilo e cuidado em cada detalhe.',
  description:
    'Barbearia premium em Botucatu/SP. Cortes clássicos, barba feita com navalha, ambiente acolhedor e atendimento personalizado para o homem moderno.',
  category: 'barbershop',

  contact: {
    phone: '+5514981893908',
    whatsapp: '5514981893908',
    email: 'contato@ruahbarber.com.br',
    instagram: '@ruahbarbeariar',
    instagramUrl: 'https://instagram.com/ruahbarbearia',
    facebookUrl: 'https://facebook.com/renatosoaresbarber',
    googleBusinessUrl: 'https://g.page/ruahbarber',
  },

  address: {
    street: 'Rua Amando de Barros',
    number: '0000',
    complement: 'Sala 01',
    neighborhood: 'Centro',
    city: 'Botucatu',
    state: 'SP',
    zipCode: '18600-000',
    country: 'BR',
    mapUrl: 'https://maps.google.com/?q=Ruah+Barber+Botucatu',
  },
}
