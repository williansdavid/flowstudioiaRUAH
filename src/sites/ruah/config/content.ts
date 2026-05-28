import type { StudioContent } from '../types'
import type { StudioContent } from '../types'
import { buildWhatsAppUrl } from '../lib/whatsapp'

/**
 * ============================================================
 * STUDIO CONTENT — Barbearia Ruah
 * ============================================================
 *
 * Conteúdo textual e mídia da landing pública do Ruah.
 *
 * ESCOPO DESTE ARQUIVO:
 *   - Textos das sections (hero, about, services intro, contact)
 *   - Mídia associada (imagens de fundo, ilustrações)
 *   - Metadados de SEO
 *   - CTA final + rodapé
 *
 * NÃO ENTRA AQUI (vive em outros arquivos):
 *   - Identidade do negócio       → identity.ts
 *   - Horários de funcionamento   → businessHours.ts
 *   - Cores e tema visual         → branding.ts
 *
 * SERVICES.items (catálogo):
 *   - Aqui está OMITIDO de propósito.
 *   - Em runtime, ServicesGrid busca do Supabase via SSR loader
 *     (src/lib/sections/fetchServices.ts).
 *   - Para popular hardcoded (demo/preview sem banco), adicione
 *     `items: [...]` dentro de `services`.
 *
 * HERO — modo 2 linhas:
 *   - headlineLine1 = linha neutra (branca, peso normal)
 *   - headlineLine2 = linha de destaque (dourada, accent)
 *   - O componente HeroSection.tsx consome esses 2 campos.
 *
 * ASSETS:
 *   - Path absoluto (/...) → servido de /public.
 *   - URLs externas (https://) → placeholders temporários.
 *
 *   TODO produção: substituir backgroundImage do hero e about.image
 *   por fotos profissionais do interior do Ruah.
 * ============================================================
 */
export const content: StudioContent = {
  // ─────────────────────────────────────────────────────────
  // HERO — Primeira dobra da landing
  // ─────────────────────────────────────────────────────────
  hero: {
    eyebrow: 'Experiência Premium',
    headlineLine1: 'Ruah',
    headlineLine2: 'Barber Lounge',
    subheadline:
      'Onde a sofisticação encontra a precisão.' ,
    backgroundImage: '/ruah/hero-barber-premium.webp',
/*	backgroundImage: '/ruah/images/hero/img1.jpeg',*/
    primaryCta: {
      label: 'Agendar Horário',
      href: buildWhatsAppUrl(
        'Olá! Vim pelo site da Ruah Barber Lounge e quero agendar um horário.',
      ),
    },
    secondaryCta: {
      label: 'Conheça a Barbearia',
      href: '#sobre',
    },
  },

  // ─────────────────────────────────────────────────────────
  // ABOUT — Sobre o studio
  // ─────────────────────────────────────────────────────────
  about: {
    eyebrow: 'Quem somos',
    title: 'Sobre a Ruah',
    paragraphs: [
      'Localizada no coração de Botucatu, a Barbearia Ruah nasceu com o propósito de elevar o padrão da barbearia tradicional.',
      'Combinamos técnicas clássicas com as tendências mais modernas do mercado, em um espaço planejado para oferecer conforto, com Wi-Fi, ambiente climatizado e profissionais altamente qualificados.',
    ],
    image:
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80',
    highlights: [
      'Ambiente climatizado e Wi-Fi grátis',
      'Profissionais altamente qualificados',
      'Atendimento personalizado',
    ],
  },

  // ─────────────────────────────────────────────────────────
  // SERVICES — Intro da section (items vêm do Supabase)
  // ─────────────────────────────────────────────────────────
  services: {
    eyebrow: 'Serviços',
    title: 'Nosso menu',
    subtitle: 'Tradição, técnica e estilo em cada atendimento.',
    // items: omitido de propósito → ServicesGrid busca do Supabase
  },

  // ─────────────────────────────────────────────────────────
  // CONTACT — Bloco de contato/lead
  // ─────────────────────────────────────────────────────────
  contact: {
    eyebrow: 'Contato',
    title: 'Fale com a gente',
    subtitle:
      'Tire dúvidas, peça orçamento ou agende seu horário pelo canal que preferir.',
    whatsappMessage:
      'Olá! Vim pelo site da Barbearia Ruah e quero agendar um horário.',
  },

  // ─────────────────────────────────────────────────────────
  // SEO — Metadados pra SSR <head>
  // ─────────────────────────────────────────────────────────
  seo: {
    title: 'Barbearia Ruah | Estilo Premium em Botucatu',
    description:
      'Barbearia premium em Botucatu. Cortes masculinos, barba e cuidado com agendamento online e atendimento via WhatsApp.',
    keywords: [
      'barbearia',
      'barbearia botucatu',
      'corte masculino botucatu',
      'barba botucatu',
      'ruah barbearia',
    ],
    ogImage: '/og.jpg',
  },

  // ─────────────────────────────────────────────────────────
  // FOOTER — CTA final + rodapé
  // ─────────────────────────────────────────────────────────
  footer: {
    finalCta: {
      title: 'Pronto pra renovar o visual?',
      subtitle: 'Agende seu horário e venha viver a experiência Ruah.',
      ctaLabel: 'Agendar agora',
      ctaHref: '#contato',
    },
    copyright: '© 2026 Barbearia Ruah. Todos os direitos reservados.',
    credits: 'Powered by FlowStudio AI',
  },
}
