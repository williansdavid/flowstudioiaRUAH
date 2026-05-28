/**
 * / — Landing Pública do Ruah Barber Lounge
 * ----------------------------------------------------------------
 * Esta rota renderiza a landing pública do studio Ruah.
 *
 * Fonte da verdade: src/sites/ruah/**
 *
 * SSR:
 *   - `loader` busca services ativos via fetchPublicServices (server fn).
 *   - Dados injetados em <ServicesSection services={...} />.
 *   - HTML inicial já vem com cards renderizados (SEO + zero flicker).
 *   - Erro de fetch NÃO derruba a rota: fetchPublicServices retorna [].
 * ----------------------------------------------------------------
 */

import { createFileRoute } from '@tanstack/react-router'
import {
  Header,
  HeroSection,
  AboutSection,
  ServicesSection,
  GallerySection,
  TestimonialsSection,
  WhatsAppFloating,
} from '@/sites/ruah/components'
import { fetchPublicServices } from '@/lib/sections/fetchServices'

export const Route = createFileRoute('/')({
  loader: () => fetchPublicServices(),
  component: LandingRuah,
})

function LandingRuah() {
  const services = Route.useLoaderData()

  return (
    <>
      <Header />
      <main className="min-h-screen w-full" style={{ background: '#1a3a3a' }}>
        <HeroSection />
        <AboutSection />
        <ServicesSection services={services} />
        <GallerySection />
        <TestimonialsSection />
      </main>
      <WhatsAppFloating />
    </>
  )
}
