/**
 * Studio Identity — Type Contract (NUCLEO)
 * ----------------------------------------------------------------
 * Contratos da identidade do studio: nome, descricao, contato,
 * endereco e redes sociais. Dados imutaveis por deploy.
 *
 * NAO inclui textos editoriais (hero, about, etc.) — esses vivem
 * em StudioContent (sites/<studio>/types/content.ts).
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
  /** WhatsApp apenas digitos com DDI — ex: 5514981893908 */
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
  /** URL publica do Google Business / Google Maps (opcional) */
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
  /** URL do Google Maps para exibir mapa/direcoes */
  mapUrl: string
}

export interface StudioIdentity {
  /** Nome oficial completo — ex: "Ruah Barber Lounge" */
  name: string
  /** Nome curto para uso em header/footer — ex: "Ruah" */
  shortName: string
  /** Slogan curto — uma frase */
  slogan: string
  /** Descricao completa (meta description fallback) */
  description: string
  /** Segmento de mercado */
  category: StudioCategory
  /** Contato e redes sociais */
  contact: StudioContact
  /** Endereco fisico */
  address: StudioAddress
}
