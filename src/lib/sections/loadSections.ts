import { studioSections } from '@/config/studio.sections';
import { studioConfig } from '@/config/studio.config';
import type { Section, StudioSectionsConfig, SectionId } from '@/types/sections';
import type { PublicServiceItem } from './types';

/**
 * Dados externos (vindos do SSR loader da rota) que precisam
 * ser injetados nas seções dinâmicas.
 */
export interface SectionsRuntimeData {
  services?: PublicServiceItem[];
}

/**
 * Retorna a configuração das seções da landing.
 *
 * Hoje: lê de `studio.sections.ts` + injeta conteúdo de `studio.config.ts`.
 * Amanhã: poderá ler do Supabase, sem alterar quem consome este loader.
 *
 * Regra arquitetural:
 *   studio.sections.ts → layout, variantes, preferências
 *   studio.config.ts   → conteúdo de negócio (textos, imagens, contatos)
 *
 * O loader é o ÚNICO ponto que mescla layout + conteúdo.
 */
export function loadStudioSections(): StudioSectionsConfig {
  const base = studioSections;
  const { hero, about } = studioConfig;

  return {
    ...base,
    sections: {
      ...base.sections,

      // Injeta conteúdo do studioConfig.hero no slot do Hero
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

      // Injeta conteúdo do studioConfig.about no slot do About
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
 * Retorna apenas as seções habilitadas, na ordem definida.
 *
 * Aceita dados de runtime (vindos do SSR loader) que são
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
