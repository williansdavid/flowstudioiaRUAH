/**
 * Studio Content Contracts — Ruah Barber Lounge
 * ----------------------------------------------------------------
 * Contratos TypeScript de TODAS as sections da landing publica.
 *
 * Filosofia:
 *   - Sections OBRIGATORIAS: Hero, Services, Contact, Footer
 *   - Sections OPCIONAIS:    About, Team, Gallery, Testimonials, SEO
 *
 * Como funciona em runtime:
 *   1. content.ts (em /config) implementa este contrato.
 *   2. Sections opcionais nao populadas = section nao renderiza.
 *   3. Componentes fazem: `if (!content.team) return null`.
 *
 * Por que sections opcionais?
 *   - Permite lancar o MVP enxuto sem refatorar contratos depois.
 *   - Conforme Willians gerar fotos/depoimentos, basta popular.
 *   - Tipagem cresce sem quebrar nada.
 *
 * Regras de modelagem:
 *   - Todos os precos em centavos (number), nao string.
 *     Ex.: R$ 65,00 = 6500
 *   - URLs de imagem sempre absolutas a partir de /public.
 *     Ex.: '/ruah/images/team/joao.jpg'
 *   - Textos sempre em pt-BR.
 *   - Nenhum campo aceita HTML; markup fica nos componentes.
 * ----------------------------------------------------------------
 */

// SEO vive no NUCLEO — re-exportamos pra manter API publica do studio.
import type { SEOContent } from '@/lib/core/types/seo'
export type { SEOContent }

// ════════════════════════════════════════════════════════════════
// HERO — section principal (sempre presente)
// ════════════════════════════════════════════════════════════════

export interface HeroContent {
  /** Linha pequena acima do titulo (ex.: "Barber Lounge") */
  eyebrow?: string

  /**
   * Headline single-line (modo legado/fallback).
   *
   * Use APENAS se NAO precisar de quebra com enfase visual.
   * Para o padrao atual da landing Ruah, use `headlineLine1`
   * + `headlineLine2`, que renderizam a segunda linha com cor
   * de destaque (accent dourado).
   *
   * Pelo menos UM dos dois modos deve ser populado:
   *   • headline (single-line)            — modo simples
   *   • headlineLine1 + headlineLine2     — modo 2 linhas (preferido)
   */
  headline?: string

  /**
   * Headline em 2 linhas — modo destaque (PADRAO RUAH).
   *
   * headlineLine1 = linha neutra (branca, peso normal).
   * headlineLine2 = linha de destaque (dourada / accent).
   *
   * O componente HeroSection consome line1/line2 quando presentes,
   * caindo em `headline` apenas como fallback.
   */
  headlineLine1?: string
  headlineLine2?: string

  /** Subtitulo de apoio (1-2 linhas curtas) */
  subheadline?: string

  /**
   * Imagem(ns) de fundo do hero (path absoluto desde /public).
   *
   * Aceita 2 formatos:
   *   • string    -> 1 imagem estatica (modo legado)
   *   • string[]  -> carrossel crossfade automatico (7s/slide)
   *
   * Comportamento em runtime (HeroSection):
   *   • string                 -> 1 imagem (sem timer)
   *   • string[] com 1 item    -> 1 imagem (sem timer)
   *   • string[] com 2+ itens  -> carrossel ativo
   */
  backgroundImage: string | string[]

  /** Botao primario (geralmente "Agende seu horario") */
  primaryCta: {
    label: string
    /** Destino: link interno, ancora (#contact) ou wa.me */
    href: string
  }

  /** Botao secundario opcional (ex.: "Ver servicos") */
  secondaryCta?: {
    label: string
    href: string
  }
}

// ════════════════════════════════════════════════════════════════
// SERVICES — catalogo de servicos (sempre presente)
// ════════════════════════════════════════════════════════════════

export interface ServiceItem {
  /** Identificador estavel (ex.: 'corte-classico') */
  id: string

  /** Nome do servico (ex.: "Corte Classico") */
  name: string

  /** Descricao curta (1-2 linhas) */
  description: string

  /** Preco em CENTAVOS. Ex.: R$ 65,00 = 6500 */
  priceCents: number

  /** Duracao estimada em minutos */
  durationMin: number

  /** Marca este card como destaque visual no grid */
  featured?: boolean
}

export interface ServicesContent {
  /** Eyebrow do bloco (ex.: "Servicos") */
  eyebrow?: string

  /** Titulo da section (ex.: "Nosso menu") */
  title: string

  /** Subtitulo opcional */
  subtitle?: string

  /**
   * Lista de servicos (OPCIONAL).
   *
   * Comportamento de runtime:
   *   - Se PRESENTE: componente usa esta lista (modo estatico/demo).
   *   - Se AUSENTE:  componente busca via SSR loader do Supabase
   *                  (src/lib/public/services.ts).
   *
   * Casos de uso pra hardcodar items aqui:
   *   - Preview/demo sem banco configurado.
   *   - Studios com catalogo fixo que nao muda.
   *   - Testes locais sem Supabase rodando.
   *
   * Caso de uso pra OMITIR items:
   *   - Producao normal (admin gerencia via /admin/services).
   */
  items?: ServiceItem[]
}

// ════════════════════════════════════════════════════════════════
// CONTACT — bloco de contato + endereco (sempre presente)
// ════════════════════════════════════════════════════════════════

export interface ContactContent {
  eyebrow?: string
  title: string
  subtitle?: string

  /** Mensagem padrao que abre no WhatsApp quando cliente clica */
  whatsappMessage?: string

  /**
   * URL embed do Google Maps (iframe src).
   * Opcional — se ausente, componente nao renderiza o mapa.
   */
  mapEmbedUrl?: string
}

// ════════════════════════════════════════════════════════════════
// FOOTER — rodape institucional (sempre presente)
// ════════════════════════════════════════════════════════════════

export interface FooterContent {
  /**
   * Frase-manifesto do studio (aparece sob o logo no rodape).
   * Ex.: "Cada corte, uma experiencia. Cada cliente, uma historia."
   */
  manifesto: string

  /**
   * Nome do detentor dos direitos autorais.
   * Ex.: "Barbearia Ruah"
   * ATENCAO: NAO inclui o ano — e injetado dinamicamente no componente.
   */
  copyrightOwner: string

  /**
   * Sufixo do copyright (texto apos o nome).
   * Ex.: "Todos os direitos reservados."
   */
  copyrightSuffix: string

  /**
   * Linha de credito da plataforma.
   * Ex.: "Powered by FlowStudio AI"
   */
  credits: string
}

// ════════════════════════════════════════════════════════════════
// ABOUT — historia do studio (OPCIONAL)
// ════════════════════════════════════════════════════════════════

/**
 * Icone disponivel para um highlight do About.
 * Mapeado em AboutSection.tsx -> HIGHLIGHT_ICONS.
 */
export type AboutHighlightIcon =
  | 'wifi'
  | 'award'
  | 'sparkles'
  | 'scissors'
  | 'heart'
  | 'shield'

/**
 * Diferencial do studio (1 icone + 1 label curto).
 */
export interface AboutHighlight {
  icon: AboutHighlightIcon
  label: string
}

/**
 * Bloco de etimologia destacado — explica origem do nome do studio.
 * Opcional: se ausente, AboutSection pula o bloco.
 */
export interface AboutEtymology {
  /** Simbolo/grafia original (ex.: "רוּחַ" em hebraico) */
  symbol: string
  /** Transliteracao latina (ex.: "ruach") */
  transliteration: string
  /** Idioma de origem (ex.: "hebraico") */
  language: string
  /** Significados curtos separados por virgula (ex.: "vento, sopro, espirito") */
  meaning: string
  /** Descricao contextual (1-2 linhas) */
  description: string
}

export interface AboutContent {
  eyebrow?: string
  title: string

  /** Texto principal (1-5 paragrafos). Array = um item por paragrafo */
  paragraphs: string[]

  /** Imagem ilustrativa (interna do studio) */
  image?: string

  /** Bloco destacado com origem/significado do nome (OPCIONAL) */
  etymology?: AboutEtymology

  /** Linhas curtas de manifesto/closing em destaque dourado (OPCIONAL) */
  manifesto?: string[]

  /** Lista curta de diferenciais com icone + label */
  highlights?: AboutHighlight[]
}

// ════════════════════════════════════════════════════════════════
// TEAM — barbeiros e profissionais (OPCIONAL)
// ════════════════════════════════════════════════════════════════

export interface TeamMember {
  id: string
  name: string

  /** Cargo/funcao (ex.: "Master Barber") */
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
// GALLERY — grid/carrossel de fotos E videos do studio (OPCIONAL)
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
 * Item de video da galeria.
 * Discriminator: type: 'video'
 *
 * Recomendacoes de producao:
 *   - Formato: mp4 H.264, max 5MB, 720p, sem audio
 *   - Duracao: 5-15s em loop
 *   - Poster: frame estatico para fallback antes do play
 */
export interface GalleryVideo {
  type: 'video'

  /** Path absoluto desde /public do arquivo .mp4/.webm */
  src: string

  /** Texto alt acessibilidade */
  alt: string

  /** Imagem de poster (mostrada antes do video carregar) */
  poster?: string

  /** Destaca este item */
  featured?: boolean
}

/**
 * Uniao discriminada — cada item da galeria pode ser foto ou video.
 * Use o campo `type` para discriminar no render.
 */
export type GalleryMedia = GalleryImage | GalleryVideo

export interface GalleryContent {
  eyebrow?: string
  title: string
  subtitle?: string

  /**
   * Lista de midias da galeria (fotos e/ou videos misturados).
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

  /** Contexto curto (ex.: "Combo Barba e Cabelo · com Renato Soares") */
  context?: string

  /** Origem do depoimento — renderiza badge sutil no card */
  source?: 'booksy' | 'google' | 'instagram' | 'whatsapp'

  /** Data/periodo do depoimento (ex.: "mar 2026", "mai 2026") */
  date?: string
}

export interface TestimonialsContent {
  eyebrow?: string
  title: string
  subtitle?: string
  items: Testimonial[]
}

// ════════════════════════════════════════════════════════════════
// EXTERNAL LINKS — redes sociais, plataformas, reviews
// ════════════════════════════════════════════════════════════════

/**
 * Links externos do studio (redes sociais, plataformas de agendamento, reviews).
 * Centraliza URLs pra evitar hardcode em componentes.
 */
export interface ExternalLinks {
  /** URL publica do perfil Booksy do studio (agendamento online) */
  booksy?: string
  /** URL publica do Google Reviews / Google Business */
  googleReviews?: string
  /** URL do Google Maps (ficha do estabelecimento) */
  googleMaps?: string
}

// ════════════════════════════════════════════════════════════════
// CONTAINER PRINCIPAL — agrega tudo
// ════════════════════════════════════════════════════════════════

/**
 * Contrato completo do conteudo de uma landing Ruah.
 *
 * Implementado por: src/sites/ruah/config/content.ts.
 *
 * Sections opcionais nao populadas resultam em section nao
 * renderizada na pagina — os componentes fazem o guard.
 */
export interface StudioContent {
  // ── Obrigatorias ─────────────────────────────────────────────
  hero: HeroContent
  services: ServicesContent
  contact: ContactContent
  footer: FooterContent
  externalLinks?: ExternalLinks
  // ── Opcionais ────────────────────────────────────────────────
  about?: AboutContent
  team?: TeamContent
  gallery?: GalleryContent
  testimonials?: TestimonialsContent
  seo?: SEOContent
}
