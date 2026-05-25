import type { StudioConfig } from './studio.types';

/**
 * ============================================
 * Studio Config — Fonte única da identidade
 * ============================================
 * Versionado por studio (deploy isolado).
 * Secrets NÃO entram aqui. Use .env + src/lib/env.ts
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
    facebookUrl: 'https://www.facebook.com/462977123564580',
  },

  address: {
    street: 'Rua Campos Salles',
    number: '1227',
    neighborhood: 'Vila Sônia',
    city: 'Botucatu',
    state: 'SP',
    zipCode: '18607-750',
    country: 'Brasil',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=Rua+Campos+Salles+1227+Vila+Sonia+Botucatu+SP',
  },

  branding: {
    theme: 'dark',
    primaryColor: '#d4af37',
    secondaryColor: '#1a1a1a',
    accentColor: '#2c2c2c',
    logoUrl: '/logo.jpg',
    faviconUrl: '/favicon.ico',
  },

  hero: {
    title: 'Viva a experiência Ruah',
    subtitle:
      'Muito mais que um corte de cabelo — um momento de cuidado e estilo em ambiente moderno e acolhedor.',
    ctaText: 'Agendar agora',
    ctaSecondaryText: 'Falar no WhatsApp',
    backgroundImage: '/hero-bg.jpg',
  },

  about: {
    title: 'Sobre a Ruah',
    paragraphs: [
      'Localizada no coração de Botucatu, a Barbearia Ruah nasceu com o propósito de elevar o padrão da barbearia tradicional.',
      'Combinamos técnicas clássicas com as tendências mais modernas do mercado, em um espaço planejado para oferecer conforto, com Wi-Fi, ambiente climatizado e profissionais altamente qualificados.',
    ],
    image:
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Ambiente interno da Barbearia Ruah',
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
      'Barbearia premium em Botucatu. Cortes masculinos, barba e cuidado com agendamento online.',
    keywords: [
      'barbearia',
      'barbearia botucatu',
      'corte masculino botucatu',
      'barba botucatu',
      'ruah barbearia',
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