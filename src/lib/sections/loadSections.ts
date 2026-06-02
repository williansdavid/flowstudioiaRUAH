import { studioSections } from '@/_legacy/admConfig/studio.sections';
import { studioConfig } from '@/_legacy/admConfig/studio.config';
import type { Section, StudioSectionsConfig, SectionId } from '@/types/sections';
import type { PublicServiceItem } from './types';

/**
 * Dados externos (vindos do SSR loader da rota) que precisam
 * ser injetados nas seÃ§Ãµes dinÃ¢micas.
 */
export interface SectionsRuntimeData {
  services?: PublicServiceItem[];
}

/**
 * Retorna a configuraÃ§Ã£o das seÃ§Ãµes da landing.
 *
 * Hoje: lÃª de `studio.sections.ts` + injeta conteÃºdo de `studio.config.ts`.
 * AmanhÃ£: poderÃ¡ ler do Supabase, sem alterar quem consome este loader.
 *
 * Regra arquitetural:
 *   studio.sections.ts â†’ layout, variantes, preferÃªncias
 *   studio.config.ts   â†’ conteÃºdo de negÃ³cio (textos, imagens, contatos)
 *
 * O loader Ã© o ÃšNICO ponto que mescla layout + conteÃºdo.
 */
export function loadStudioSections(): StudioSectionsConfig {
  const base = studioSections;
  const { hero, about } = studioConfig;

  return {
    ...base,
    sections: {
      ...base.sections,

      // Injeta conteÃºdo do studioConfig.hero no slot do Hero
      hero: base.sections.hero && {
        ...base.sections.hero,
        props: {
          ...base.sections.hero.props,
          title: hero.title,
          subtitle: hero.subtitle,
          background: {
            ...base.sections.hero.props.background,
            src: hero.backgroundImage,
          },
          primaryCta: base.sections.hero.props.primaryCta && {
            ...base.sections.hero.props.primaryCta,
            label: hero.ctaText,
          },
          secondaryCta:
            base.sections.hero.props.secondaryCta && hero.ctaSecondaryText
              ? {
                  ...base.sections.hero.props.secondaryCta,
                  label: hero.ctaSecondaryText,
                }
              : undefined,
        },
      },

      // Injeta conteÃºdo do studioConfig.about no slot do About
      about: base.sections.about && {
        ...base.sections.about,
        props: {
          ...base.sections.about.props,
          title: about.title,
          description: about.paragraphs.join('\n\n'),
          image: base.sections.about.props.image ?? {
            src: about.image,
            alt: about.imageAlt,
          },
        },
      },
    },
  };
}

/**
 * Retorna apenas as seÃ§Ãµes habilitadas, na ordem definida.
 *
 * Aceita dados de runtime (vindos do SSR loader) que sÃ£o
 * passados adiante pelo SectionsRenderer.
 */
export function getEnabledSectionsInOrder(): Section[] {
  const config = loadStudioSections();
  const result: Section[] = [];

  for (const id of config.order) {
    const section = config.sections[id as SectionId];
    if (section && section.enabled) {
      result.push(section as Section);
    }
  }

  return result;
}
