/**
 * Tipos do StudioConfig - fonte unica da identidade do studio.
 * Cada studio (deploy) tera seu proprio studio.config.ts versionado.
 */

export type StudioCategory =
  | 'barbershop'
  | 'salon'
  | 'nails'
  | 'aesthetics'
  | 'spa'
  | 'other';

/**
 * Tema visual completo do studio.
 * Cada tema corresponde a um arquivo CSS em src/styles/themes/.
 * Selecionado em build-time via @import em tokens.css.
 */
export type StudioTheme = 'classic' | 'soft' | 'premium';

export interface StudioContact {
  phone: string;
  whatsapp: string;
  email?: string;
  instagram?: string;
  instagramUrl?: string;
  facebookUrl?: string;
}

export interface StudioAddress {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  mapUrl: string;
}

/**
 * Escala de cor da marca (50 -> 900).
 * Permite uso semantico: bg-brand-500, hover:bg-brand-600, etc.
 */
export interface BrandColorScale {
  50: string;
  100: string;
  300: string;
  500: string;
  600: string;
  700: string;
  900: string;
}

export interface StudioBranding {
  /** Tema visual carregado em build-time. */
  theme: StudioTheme;
  /** Escala completa da cor da marca (white-label). */
  primary: BrandColorScale;
  /** Cor de texto que vai sobre brand-500 (gerado automaticamente se omitido). */
  primaryForeground?: string;
  /** @deprecated Use `primary[500]`. Mantido para compatibilidade. */
  primaryColor?: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  logoUrlDark?: string;
  faviconUrl: string;
}

export interface StudioHero {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaSecondaryText?: string;
  backgroundImage: string;
}

export interface StudioAbout {
  title: string;
  paragraphs: string[];
  image: string;
  imageAlt: string;
}

export interface StudioGalleryItem {
  src: string;
  alt: string;
}

export type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface DayHours {
  open: string;
  close: string;
}

export type StudioBusinessHours = Record<WeekDay, DayHours | null>;

export interface StudioSEO {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
}

export interface StudioFeatures {
  enableAIChat: boolean;
  enableWhatsAppIntegration: boolean;
  enableOnlineBooking: boolean;
  enableLeadCapture: boolean;
}

export interface StudioFooter {
  copyrightText: string;
}

export interface StudioConfig {
  id: string;
  slug: string;
  name: string;
  slogan: string;
  description: string;
  category: StudioCategory;
  contact: StudioContact;
  address: StudioAddress;
  branding: StudioBranding;
  hero: StudioHero;
  about: StudioAbout;
  gallery?: StudioGalleryItem[];
  businessHours: StudioBusinessHours;
  seo: StudioSEO;
  features: StudioFeatures;
  footer: StudioFooter;
}
