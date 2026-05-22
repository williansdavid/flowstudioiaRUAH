import type { StudioConfig } from './studio.types';

/**
 * ============================================
 * Studio Config — Fonte única da identidade
 * ============================================
 *
 * Este arquivo é versionado por studio (deploy isolado).
 * Cada empresa terá sua própria versão deste config.
 *
 * ⚠️ Secrets (Supabase keys, API keys) NÃO ficam aqui.
 *    Use: .env + src/lib/env.ts
 */
export const studioConfig: StudioConfig = {
  id: 'barbearia-ruah-001',
  slug: 'barbearia-ruah',
  name: 'Barbearia Ruah',
  slogan: 'Estilo, cuidado e excelência em cada detalhe.',
  description:
    'Barbearia premium em Botucatu com agendamento online e atendimento via WhatsApp.',
  category: 'barbershop',

  contact: {
    phone: '+5514981893908',
    whatsapp: '5514981893908',
    email: 'contato@ruahbarbearia.com.br',
    instagram: '@ruahbarbearia',
    instagramUrl: 'https://www.instagram.com/ruahbarbearia',
  },

  address: {
    street: 'Rua Campos Salles',
    number: '1227',
    neighborhood: 'Vila Padovan',
    city: 'Botucatu',
    state: 'SP',
    zipCode: '18607-750',
    country: 'Brasil',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=Rua+Campos+Salles+1227+Vila+Padovan+Botucatu+SP',
  },

  branding: {
    primaryColor: '#D97757',
    secondaryColor: '#1a1a1a',
    accentColor: '#f5e6d3',
    logoUrl: '/logo.svg',
    faviconUrl: '/favicon.ico',
  },

  hero: {
    title: 'Estilo que define você',
    subtitle:
      'Cortes, barba e cuidado masculino com a excelência que você merece.',
    ctaText: 'Agendar agora',
    backgroundImage: '/hero.jpg',
  },

  businessHours: {
    monday: { open: '09:00', close: '19:00' },
    tuesday: { open: '09:00', close: '19:00' },
    wednesday: { open: '09:00', close: '19:00' },
    thursday: { open: '09:00', close: '19:00' },
    friday: { open: '09:00', close: '20:00' },
    saturday: { open: '08:00', close: '17:00' },
    sunday: null,
  },

  seo: {
    title: 'Barbearia Ruah | Estilo Premium em Botucatu',
    description:
      'Barbearia premium em Botucatu — Vila Padovan. Cortes masculinos, barba e cuidado com agendamento online.',
    keywords: [
      'barbearia',
      'barbearia botucatu',
      'corte masculino botucatu',
      'barba botucatu',
      'ruah barbearia',
      'vila padovan',
    ],
    ogImage: '/og.jpg',
  },

  features: {
    enableAIChat: true,
    enableWhatsAppIntegration: true,
    enableOnlineBooking: true,
    enableLeadCapture: true,
  },

  footer: {
    copyrightText: '© 2026 Barbearia Ruah. Todos os direitos reservados.',
  },
};
