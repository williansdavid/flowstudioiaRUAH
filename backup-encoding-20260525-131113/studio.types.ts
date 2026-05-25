/**
 * Tipos do StudioConfig — fonte única da identidade do studio.
 * Cada studio (deploy) terá seu próprio studio.config.ts versionado.
 */

export type StudioCategory =
  | 'barbershop'
  | 'salon'
  | 'nails'
  | 'aesthetics'
  | 'spa'
  | 'other';

export type StudioTheme = 'dark' | 'light';

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

export interface StudioBranding {
  theme: StudioTheme;
  primaryColor: string;
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