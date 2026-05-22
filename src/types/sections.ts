/**
 * Contratos das seções da landing page do studio.
 *
 * Cada seção possui:
 * - Tipos base reutilizáveis (CTA, overlay, alinhamento)
 * - Tipo específico com `id`, `enabled`, `variant` e `props`
 *
 * Adicionar nova seção:
 * 1. Criar tipo `XxxSection` aqui
 * 2. Adicionar no union `Section`
 * 3. Registrar no mapa de variantes do SectionsRenderer
 */

// ============================================================
// TIPOS BASE COMPARTILHADOS
// ============================================================

export type Alignment = 'left' | 'center' | 'right';

export type SectionHeight = 'auto' | 'sm' | 'md' | 'lg' | 'fullscreen';

export interface CtaConfig {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  external?: boolean;
}

export interface OverlayConfig {
  enabled: boolean;
  color?: string;        // ex: '#000000'
  opacity?: number;      // 0..1
}

export interface BackgroundImage {
  src: string;           // ex: '/studio/hero.jpg'
  alt?: string;
  position?: string;     // ex: 'center', 'top'
  overlay?: OverlayConfig;
}

/**
 * Base que todas as seções herdam.
 */
export interface SectionBase {
  id: string;
  enabled: boolean;
  variant: string;
}

// ============================================================
// HERO
// ============================================================

export type HeroVariant = 'fullscreen' | 'split' | 'minimal';

export interface HeroSection extends SectionBase {
  id: 'hero';
  variant: HeroVariant;
  props: {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    description?: string;
    alignment?: Alignment;
    height?: SectionHeight;
    background?: BackgroundImage;
    primaryCta?: CtaConfig;
    secondaryCta?: CtaConfig;
    sideImage?: {
      src: string;
      alt?: string;
      position?: 'left' | 'right';
    };
  };
}

// ============================================================
// SOBRE
// ============================================================

export type AboutVariant = 'text-only' | 'text-image' | 'stats';

export interface AboutStat {
  label: string;
  value: string;
}

export interface AboutSection extends SectionBase {
  id: 'about';
  variant: AboutVariant;
  props: {
    eyebrow?: string;
    title: string;
    description: string;
    alignment?: Alignment;
    image?: {
      src: string;
      alt?: string;
      position?: 'left' | 'right';
    };
    stats?: AboutStat[];
    cta?: CtaConfig;
  };
}

// ============================================================
// SERVIÇOS
// ============================================================

export type ServicesVariant = 'grid' | 'list' | 'cards-featured';

export interface ServicesSection extends SectionBase {
  id: 'services';
  variant: ServicesVariant;
  props: {
    eyebrow?: string;
    title: string;
    description?: string;
    source?: 'supabase' | 'static';
    items?: Array<{
      name: string;
      description?: string;
      price?: number;
      duration?: number;
      image?: string;
    }>;
    columns?: 2 | 3 | 4;
    showPrice?: boolean;
    showDuration?: boolean;
    cta?: CtaConfig;
  };
}

// ============================================================
// EQUIPE
// ============================================================

export type TeamVariant = 'grid' | 'carousel' | 'list';

export interface TeamSection extends SectionBase {
  id: 'team';
  variant: TeamVariant;
  props: {
    eyebrow?: string;
    title: string;
    description?: string;
    source?: 'supabase' | 'static';
    items?: Array<{
      name: string;
      role?: string;
      photo?: string;
      bio?: string;
      instagram?: string;
    }>;
    columns?: 2 | 3 | 4;
  };
}

// ============================================================
// GALERIA
// ============================================================

export type GalleryVariant = 'grid' | 'masonry' | 'carousel';

export interface GalleryImage {
  src: string;
  alt?: string;
  caption?: string;
}

export interface GallerySection extends SectionBase {
  id: 'gallery';
  variant: GalleryVariant;
  props: {
    eyebrow?: string;
    title: string;
    description?: string;
    images: GalleryImage[];
    columns?: 2 | 3 | 4;
    showCaptions?: boolean;
  };
}

// ============================================================
// DEPOIMENTOS
// ============================================================

export type TestimonialsVariant = 'grid' | 'carousel' | 'featured';

export interface Testimonial {
  name: string;
  role?: string;
  photo?: string;
  rating?: number;
  message: string;
}

export interface TestimonialsSection extends SectionBase {
  id: 'testimonials';
  variant: TestimonialsVariant;
  props: {
    eyebrow?: string;
    title: string;
    description?: string;
    items: Testimonial[];
    columns?: 2 | 3;
  };
}

// ============================================================
// CONTATO / LEADS
// ============================================================

export type ContactVariant = 'form-map' | 'form-only' | 'whatsapp-cta';

export interface ContactSection extends SectionBase {
  id: 'contact';
  variant: ContactVariant;
  props: {
    eyebrow?: string;
    title: string;
    description?: string;
    showMap?: boolean;
    mapEmbedUrl?: string;
    showAddress?: boolean;
    showPhone?: boolean;
    showWhatsapp?: boolean;
    showInstagram?: boolean;
    leadFormFields?: Array<'name' | 'phone' | 'email' | 'service' | 'message'>;
    whatsappCta?: CtaConfig;
  };
}

// ============================================================
// UNION
// ============================================================

export type Section =
  | HeroSection
  | AboutSection
  | ServicesSection
  | TeamSection
  | GallerySection
  | TestimonialsSection
  | ContactSection;

export type SectionId = Section['id'];

// ============================================================
// CONFIGURAÇÃO COMPLETA
// ============================================================

export interface StudioSectionsConfig {
  order: SectionId[];
  sections: {
    hero?: HeroSection;
    about?: AboutSection;
    services?: ServicesSection;
    team?: TeamSection;
    gallery?: GallerySection;
    testimonials?: TestimonialsSection;
    contact?: ContactSection;
  };
}
