/**
 * Studio Content Contracts — Ruah Barber Lounge
 * ----------------------------------------------------------------
 * Contratos TypeScript de TODAS as sections da landing pública.
 *
 * Filosofia:
 *   - Sections OBRIGATÓRIAS: Hero, Services, Contact, Footer
 *   - Sections OPCIONAIS:    About, Team, Gallery, Testimonials, SEO
 *
 * Como funciona em runtime:
 *   1. content.ts (em /config) implementa este contrato.
 *   2. Sections opcionais não populadas = section não renderiza.
 *   3. Componentes fazem: `if (!content.team) return null`.
 *
 * Por que sections opcionais?
 *   - Permite lançar o MVP enxuto sem refatorar contratos depois.
 *   - Conforme Willians gerar fotos/depoimentos, basta popular.
 *   - Tipagem cresce sem quebrar nada.
 *
 * Regras de modelagem:
 *   - Todos os preços em centavos (number), não string.
 *     Ex.: R$ 65,00 = 6500
 *   - URLs de imagem sempre absolutas a partir de /public.
 *     Ex.: '/ruah/images/team/joao.jpg'
 *   - Textos sempre em pt-BR.
 *   - Nenhum campo aceita HTML; markup fica nos componentes.
 * ----------------------------------------------------------------
 */

// ════════════════════════════════════════════════════════════════
// HERO — section principal (sempre presente)
// ════════════════════════════════════════════════════════════════

export interface HeroContent {
  /** Linha pequena acima do título (ex.: "Barber Lounge") */
  eyebrow?: string

  /**
   * Headline single-line (modo legado/fallback).
   *
   * Use APENAS se NÃO precisar de quebra com ênfase visual.
   * Para o padrão atual da landing Ruah, use `headlineLine1`
   * + `headlineLine2`, que renderizam a segunda linha com cor
   * de destaque (accent dourado).
   *
   * Pelo menos UM dos dois modos deve ser populado:
   *   • headline (single-line)            — modo simples
   *   • headlineLine1 + headlineLine2     — modo 2 linhas (preferido)
   */
  headline?: string

  /**
   * Headline em 2 linhas — modo destaque (PADRÃO RUAH).
   *
   * headlineLine1 = linha neutra (branca, peso normal).
   * headlineLine2 = linha de destaque (dourada / accent).
   *
   * O componente HeroSection consome line1/line2 quando presentes,
   * caindo em `headline` apenas como fallback.
   */
  headlineLine1?: string
  headlineLine2?: string

  /** Subtítulo de apoio (1-2 linhas curtas) */
  subheadline?: string

  /**
   * Imagem(ns) de fundo do hero (path absoluto desde /public).
   *
   * Aceita 2 formatos:
   *   • string    → 1 imagem estática (modo legado)
   *   • string[]  → carrossel crossfade automático (7s/slide)
   *
   * Comportamento em runtime (HeroSection):
   *   • string                 → 1 imagem (sem timer)
   *   • string[] com 1 item    → 1 imagem (sem timer)
   *   • string[] com 2+ itens  → carrossel ativo
   */
  backgroundImage: string | string[]

  /** Botão primário (geralmente "Agende seu horário") */
  primaryCta: {
    label: string
    /** Destino: link interno, âncora (#contact) ou wa.me */
    href: string
  }

  /** Botão secundário opcional (ex.: "Ver serviços") */
  secondaryCta?: {
    label: string
    href: string
  }
}

// ════════════════════════════════════════════════════════════════
// SERVICES — catálogo de serviços (sempre presente)
// ════════════════════════════════════════════════════════════════

export interface ServiceItem {
  /** Identificador estável (ex.: 'corte-classico') */
  id: string

  /** Nome do serviço (ex.: "Corte Clássico") */
  name: string

  /** Descrição curta (1-2 linhas) */
  description: string

  /** Preço em CENTAVOS. Ex.: R$ 65,00 = 6500 */
  priceCents: number

  /** Duração estimada em minutos */
  durationMin: number

  /** Marca este card como destaque visual no grid */
  featured?: boolean
}

export interface ServicesContent {
  /** Eyebrow do bloco (ex.: "Serviços") */
  eyebrow?: string

  /** Título da section (ex.: "Nosso menu") */
  title: string

  /** Subtítulo opcional */
  subtitle?: string

  /**
   * Lista de serviços (OPCIONAL).
   *
   * Comportamento de runtime:
   *   - Se PRESENTE: componente usa esta lista (modo estático/demo).
   *   - Se AUSENTE:  componente busca via SSR loader do Supabase
   *                  (src/lib/sections/fetchServices.ts).
   *
   * Casos de uso pra hardcodar items aqui:
   *   - Preview/demo sem banco configurado.
   *   - Studios com catálogo fixo que não muda.
   *   - Testes locais sem Supabase rodando.
   *
   * Caso de uso pra OMITIR items:
   *   - Produção normal (admin gerencia via /admin/services).
   */
  items?: ServiceItem[]
}

// ════════════════════════════════════════════════════════════════
// CONTACT — bloco de contato + endereço (sempre presente)
// ════════════════════════════════════════════════════════════════

export interface ContactContent {
  eyebrow?: string
  title: string
  subtitle?: string

  /** Mensagem padrão que abre no WhatsApp quando cliente clica */
  whatsappMessage?: string

  /**
   * URL embed do Google Maps (iframe src).
   * Opcional — se ausente, componente não renderiza o mapa.
   */
  mapEmbedUrl?: string
}

// ════════════════════════════════════════════════════════════════
// FOOTER — rodapé + CTA final embutido (sempre presente)
// ════════════════════════════════════════════════════════════════

export interface FooterContent {
  /**
   * CTA final embutido no topo do footer.
   * Ex.: { title: "Pronto pra renovar o visual?",
   *        ctaLabel: "Agende agora", ctaHref: "#contact" }
   */
  finalCta: {
    title: string
    subtitle?: string
    ctaLabel: string
    ctaHref: string
  }

  /** Texto de copyright (ano é injetado dinamicamente) */
  copyright: string

  /** Linha de crédito opcional (ex.: "Powered by FlowStudio AI") */
  credits?: string
}

// ════════════════════════════════════════════════════════════════
// ABOUT — história do studio (OPCIONAL)
// ════════════════════════════════════════════════════════════════

/**
 * Ícone disponível para um highlight do About.
 * Mapeado em AboutSection.tsx → HIGHLIGHT_ICONS.
 */
export type AboutHighlightIcon =
  | 'wifi'
  | 'award'
  | 'sparkles'
  | 'scissors'
  | 'heart'
  | 'shield'

/**
 * Diferencial do studio (1 ícone + 1 label curto).
 */
export interface AboutHighlight {
  icon: AboutHighlightIcon
  label: string
}

export interface AboutContent {
  eyebrow?: string
  title: string

  /** Texto principal (1-3 parágrafos). Array = um item por parágrafo */
  paragraphs: string[]

  /** Imagem ilustrativa (interna do studio) */
  image?: string

  /** Lista curta de diferenciais com ícone + label */
  highlights?: AboutHighlight[]
}

// ════════════════════════════════════════════════════════════════
// TEAM — barbeiros e profissionais (OPCIONAL)
// ════════════════════════════════════════════════════════════════

export interface TeamMember {
  id: string
  name: string

  /** Cargo/função (ex.: "Master Barber") */
  role: string

  /** Bio curta (1-2 linhas) */
  bio?: string

  /** Foto do profissional (path absoluto desde /public) */
  photo: string

  /** Instagram pessoal (handle sem @ ou URL completa) */
  instagram?: string
}

export interface TeamContent {
  eyebrow?: string
  title: string
  subtitle?: string
  members: TeamMember[]
}

// ════════════════════════════════════════════════════════════════
// GALLERY — grid/carrossel de fotos E vídeos do studio (OPCIONAL)
// ════════════════════════════════════════════════════════════════

/**
 * Item de imagem da galeria.
 * Discriminator: type: 'image'
 */
export interface GalleryImage {
  type: 'image'

  /** Path absoluto desde /public */
  src: string

  /** Texto alt acessibilidade (descrever a foto) */
  alt: string

  /** Destaca este item (span maior em layouts masonry) */
  featured?: boolean
}

/**
 * Item de vídeo da galeria.
 * Discriminator: type: 'video'
 *
 * Recomendações de produção:
 *   - Formato: mp4 H.264, max 5MB, 720p, sem áudio
 *   - Duração: 5-15s em loop
 *   - Poster: frame estático para fallback antes do play
 */
export interface GalleryVideo {
  type: 'video'

  /** Path absoluto desde /public do arquivo .mp4/.webm */
  src: string

  /** Texto alt acessibilidade */
  alt: string

  /** Imagem de poster (mostrada antes do vídeo carregar) */
  poster?: string

  /** Destaca este item */
  featured?: boolean
}

/**
 * União discriminada — cada item da galeria pode ser foto ou vídeo.
 * Use o campo `type` para discriminar no render.
 */
export type GalleryMedia = GalleryImage | GalleryVideo

export interface GalleryContent {
  eyebrow?: string
  title: string
  subtitle?: string

  /**
   * Lista de mídias da galeria (fotos e/ou vídeos misturados).
   * Ordem do array = ordem do carrossel.
   */
  items: GalleryMedia[]
}


// ════════════════════════════════════════════════════════════════
// TESTIMONIALS — depoimentos reais de clientes (OPCIONAL)
// ════════════════════════════════════════════════════════════════

export interface Testimonial {
  id: string

  /** Nome do cliente */
  name: string

  /** Texto do depoimento */
  quote: string

  /** Nota de 1 a 5 estrelas (opcional) */
  rating?: 1 | 2 | 3 | 4 | 5

  /** Foto do cliente (opcional, gera avatar mais humano) */
  avatar?: string

  /** Data/contexto opcional (ex.: "Cliente desde 2023") */
  context?: string
}

export interface TestimonialsContent {
  eyebrow?: string
  title: string
  subtitle?: string
  items: Testimonial[]
}

// ════════════════════════════════════════════════════════════════
// SEO — metadados pra SSR <head> (OPCIONAL)
// ════════════════════════════════════════════════════════════════

/**
 * Metadados de SEO da landing pública.
 *
 * Consumido pelo head() do TanStack Router em runtime SSR.
 * Cada studio define seu próprio bloco SEO, mantendo
 * isolamento total e personalização por deploy.
 *
 * Se ausente em content.ts, a rota usa fallback genérico
 * derivado de identity.ts (nome do studio, slogan, etc.).
 */
export interface SEOContent {
  /** Title da página (ex.: "Barbearia Ruah | Premium em Botucatu") */
  title: string

  /** Meta description (até ~155 caracteres pra Google) */
  description: string

  /** Keywords pra SEO (uso limitado em 2026, mas mantemos) */
  keywords?: string[]

  /** Imagem Open Graph (1200x630 ideal). Path absoluto desde /public */
  ogImage?: string

  /** URL canônica da landing (preenchida no deploy) */
  canonicalUrl?: string
}

// ════════════════════════════════════════════════════════════════
// CONTAINER PRINCIPAL — agrega tudo
// ════════════════════════════════════════════════════════════════

/**
 * Contrato completo do conteúdo de uma landing Ruah.
 *
 * Implementado por: src/sites/ruah/config/content.ts.
 *
 * Sections opcionais não populadas resultam em section não
 * renderizada na página — os componentes fazem o guard.
 */
export interface StudioContent {
  // ── Obrigatórias ───────────────────────────────────────────
  hero: HeroContent
  services: ServicesContent
  contact: ContactContent
  footer: FooterContent

  // ── Opcionais ──────────────────────────────────────────────
  about?: AboutContent
  team?: TeamContent
  gallery?: GalleryContent
  testimonials?: TestimonialsContent
  seo?: SEOContent
}
