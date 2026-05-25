import type { StudioSectionsConfig } from '@/types/sections';

/**
 * ============================================
 * Studio Sections — Layout do studio atual
 * ============================================
 * Define ORDEM, VARIANTE e PREFERÊNCIAS de UI.
 *
 * IMPORTANTE: campos de CONTEÚDO (title, subtitle, background.src)
 * são preenchidos em runtime pelo loader, lendo de studio.config.ts.
 * Aqui definimos apenas o "esqueleto" de layout.
 *
 * NOTA TEMPORÁRIA (Fase 2):
 *   Apenas `hero` está habilitado via SectionsRenderer.
 *   `services`, `about`, `contact` continuam inline na rota /
 *   até serem migrados para o sistema de variantes.
 *   Ao migrar cada seção:
 *     1. Criar componente em src/components/landing/<seção>/
 *     2. Registrar no variantsMap do SectionsRenderer
 *     3. Marcar enabled: true aqui
 *     4. Remover bloco inline da rota
 */
export const studioSections: StudioSectionsConfig = {
  order: ['hero', 'services', 'about', 'contact'],
  sections: {
    hero: {
      id: 'hero',
      enabled: true,
      variant: 'fullscreen',
      props: {
        title: '',
        eyebrow: 'Barbearia Premium',
        alignment: 'center',
        height: 'lg',
        background: {
          src: '',
          overlay: { enabled: true, opacity: 0.5 },
        },
        primaryCta: {
          label: '',
          href: '#contato',
          variant: 'primary',
        },
        secondaryCta: {
          label: '',
          href: 'https://wa.me/5514981893908',
          variant: 'outline',
          external: true,
        },
      },
    },

services: {
  id: 'services',
  enabled: true, // ✅ ativado — ServicesGrid registrado no variantsMap
  variant: 'grid',
  props: {
    title: 'Nossos Serviços',
    description: 'Tradição, técnica e estilo em cada atendimento.',
    source: 'supabase',
    columns: 3,
    showPrice: true,
    showDuration: true,
  },
},

    about: {
      id: 'about',
      enabled: false, // TODO: ativar após criar AboutTextImage
      variant: 'text-image',
      props: {
        title: '',
        description: '',
        alignment: 'left',
      },
    },

    contact: {
      id: 'contact',
      enabled: false, // TODO: ativar após criar ContactFormMap
      variant: 'form-map',
      props: {
        title: 'Fale com a gente',
        showMap: true,
        showAddress: true,
        showPhone: true,
        showWhatsapp: true,
        showInstagram: true,
        leadFormFields: ['name', 'phone', 'service', 'message'],
      },
    },
  },
};
