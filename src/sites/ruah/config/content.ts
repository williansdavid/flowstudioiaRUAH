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

// ─────────────────────────────────────────────────────────────
// EXTERNAL LINKS — URLs públicas centralizadas
// ─────────────────────────────────────────────────────────────
externalLinks: {
  booksy:
    'https://booksy.com/pt-br/339118_ruah-barber-lounge_barbearias_887298_botucatu',
  googleReviews: 'https://maps.app.goo.gl/Q1VCCNVrbmSPSVpRA',
  googleMaps: 'https://maps.app.goo.gl/Q1VCCNVrbmSPSVpRA',
},


  // ─────────────────────────────────────────────────────────
  // HERO — Primeira dobra da landing
  // ─────────────────────────────────────────────────────────
  hero: {
    eyebrow: 'Experiência Premium',
    headlineLine1: 'Ruah',
    headlineLine2: 'Barber Lounge',
    subheadline:
      'Onde a sofisticação encontra a precisão.' ,
/*    backgroundImage: '/ruah/hero-barber-premium.webp', */ 
/*	backgroundImage: '/ruah/images/hero/imgHero.webp',*/
/*	backgroundImage: '/ruah/images/hero/img1.jpeg',*/
    /**
     * Carrossel de fundo do hero.
     * Crossfade automático a cada 7s entre as imagens.
     * Para voltar a 1 imagem só, troque o array por uma string.
     *
     * TODO: adicionar 3ª foto em /ruah/images/hero/ (sugestão:
     * detalhe da cadeira/navalha ou cliente sendo atendido,
     * 1920×1080, WebP qualidade 80).
     */
    backgroundImage: [
      '/ruah/images/hero/ca1.webp',
      '/ruah/images/hero/ca2.webp',
	  '/ruah/images/hero/ca3.webp',
    ],
	primaryCta: {
	  label: 'Agendar Horário',
	  href: 'https://booksy.com/pt-br/339118_ruah-barber-lounge_barbearias_887298_botucatu',
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
	'/ruah/images/hero/imgabout.jpg',
	highlights: [
	  { icon: 'wifi',     label: 'Ambiente climatizado e Wi-Fi grátis' },
	  { icon: 'award',    label: 'Profissionais altamente qualificados' },
	  { icon: 'sparkles', label: 'Atendimento personalizado' },
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


  // ────────────────────────────────────────────────────────────
  // GALLERY — Carrossel premium de fotos e vídeos
  // ────────────────────────────────────────────────────────────
  /**
   * Galeria mista de fotos e vídeos.
   *
   * Para adicionar mídia:
   *   1. Coloque o arquivo em /public/ruah/images/gallery/ ou /public/ruah/videos/
   *   2. Adicione um item no array abaixo respeitando o discriminator `type`
   *
   * Vídeos: recomendado mp4 H.264, <5MB, 720p, sem áudio, 5-15s em loop.
   */
  gallery: {
    eyebrow: 'Galeria Premium',
    title: 'Nosso Trabalho',
    subtitle:
      'Cada imagem conta a história de precisão, elegância e dedicação ao ofício.',
    items: [
      // TODO: substituir pelos arquivos reais que você colocar em
      // /public/ruah/images/gallery/ e /public/ruah/videos/
      {
        type: 'image',
        src: '/ruah/images/gallery/img1.webp',
        alt: 'Atendimento na cadeira premium',
        featured: true,
      },
      {
        type: 'image',
        src: '/ruah/images/gallery/img2.webp',
        alt: 'Detalhe do acabamento clássico',
      },
      /*{
        type: 'image',
        src: '/ruah/images/gallery/img3.webp',
        alt: 'Ambiente lounge da barbearia',
      },
      {
        type: 'image',
        src: '/ruah/images/hero/showreel-poster.webp',
        alt: 'Acabamento de barba com navalha',
      },*/
      // Exemplo de vídeo (descomente quando tiver o arquivo):
       {
         type: 'video',
         src: '/ruah/videos/v1.mp4',
         poster: '/ruah/images/gallery/showreel-poster.webp',
         alt: 'Showreel da barbearia Ruah',
         featured: true,
       },
       {
         type: 'video',
         src: '/ruah/videos/v2.mp4',
         poster: '/ruah/images/gallery/showreel-poster.webp',
         alt: 'Showreel da barbearia Ruah',
         featured: true,
       },	   
    ],
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
    ogImage: '/ruah/images/logo/logo.jpg',
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
  // ════════════════════════════════════════════════════════════════
  // TESTIMONIALS — Depoimentos reais (Booksy ★ 5.0 · 61 avaliações)
  // Fonte: https://booksy.com/pt-br/339118_ruah-barber-lounge_barbearias_887298_botucatu
  // ════════════════════════════════════════════════════════════════
  testimonials: {
    eyebrow: 'Depoimentos',
    title: 'O que dizem nossos clientes',
    subtitle:
      'Avaliações reais e verificadas no Booksy — 100% recomendam o Ruah.',
items: [
  {
    id: 'andre-2026-03',
    name: 'André',
    quote: 'Atendimento excepcional! Renatão é fera demais!',
    rating: 5,
    context: 'Combo Barba e Cabelo · com Renato Soares',
    source: 'booksy',
    date: 'mar 2026',
  },
  {
    id: 'joaopaulo-2026-03',
    name: 'João Paulo',
    quote:
      'Renatão o que ele não tem de cabelo, tem de qualidade kkkk Tmj irmão!',
    rating: 5,
    context: 'Cabelo · com Renato Soares',
    source: 'booksy',
    date: 'mar 2026',
  },
  {
    id: 'julio-teixeira-google',
    name: 'Julio Teixeira',
    quote:
      'Cara talentoso e cuidadoso, podem confiar. Recomendo demais.',
    rating: 5,
    context: 'Avaliação no Google',
    source: 'google',
    date: '2025',
  },
  {
    id: 'miguel-2026-05',
    name: 'Miguel',
    quote:
      'Excelente atendimento e resultado impecável. Já virei cliente fixo!',
    rating: 5,
    context: 'Cabelo · com Leonardo De Paula',
    source: 'booksy',
    date: 'mai 2026',
  },
],

  },
  
}

