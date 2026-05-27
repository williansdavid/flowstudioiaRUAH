/**
 * Identity Types
 * ----------------------------------------------------------------
 * Contratos da identidade do studio: nome, descrição, contato,
 * endereço e redes sociais. Dados imutáveis por deploy.
 *
 * NÃO inclui textos editoriais (hero, about, etc.) — esses vivem
 * em `content/`.
 * ----------------------------------------------------------------
 */

export type StudioCategory =
  | 'barbershop'
  | 'beauty_salon'
  | 'hair_salon'
  | 'nail_studio'
  | 'spa'
  | 'aesthetic_clinic'

export interface StudioContact {
  /** Telefone fixo internacional E.164 — ex: +5514981893908 */
  phone: string
  /** WhatsApp apenas dígitos com DDI — ex: 5514981893908 */
  whatsapp: string
  /** E-mail institucional */
  email: string
  /** Instagram handle com @ — ex: @ruahbarbearia */
  instagram: string
  /** URL completa do Instagram */
  instagramUrl: string
  /** URL completa do Facebook (opcional) */
  facebookUrl?: string
  /** URL completa do TikTok (opcional) */
  tiktokUrl?: string
  /** URL pública do Google Business / Google Maps (opcional) */
  googleBusinessUrl?: string
}

export interface StudioAddress {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  country: string
  /** URL do Google Maps para exibir mapa/direções */
  mapUrl: string
}

export interface StudioIdentity {
  /** Nome oficial completo — ex: "Ruah Barber Lounge" */
  name: string
  /** Nome curto para uso em header/footer — ex: "Ruah" */
  shortName: string
  /** Slogan curto — uma frase */
  slogan: string
  /** Descrição completa (meta description fallback) */
  description: string
  /** Segmento de mercado */
  category: StudioCategory
  /** Contato e redes sociais */
  contact: StudioContact
  /** Endereço físico */
  address: StudioAddress
}
