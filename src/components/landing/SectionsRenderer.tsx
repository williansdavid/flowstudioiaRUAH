import {
  getEnabledSectionsInOrder,
  type SectionsRuntimeData,
} from '@/lib/sections/loadSections';
import type { Section } from '@/types/sections';
import {
  HeroFullscreen,
  HeroSplit,
  HeroMinimal,
} from '@/components/landing/hero';
import { ServicesGrid } from '@/components/landing/services';

/**
 * Renderiza dinamicamente as seções da landing na ordem configurada.
 *
 * IMPORTANTE: este arquivo é o ÚNICO ponto que conhece o mapa
 * "seção + variante -> componente". Para adicionar nova variante,
 * registre no objeto `variantsMap` abaixo.
 *
 * Dados dinâmicos (vindos do SSR loader da rota) são passados via
 * a prop `data` e injetados na seção correspondente como prop extra.
 */

function MissingVariant({ section }: { section: Section }) {
  if (import.meta.env.DEV) {
    return (
      <div className="w-full bg-amber-50 border-y border-amber-200 py-6 px-4 text-center text-amber-900">
        <p className="font-semibold">
          ⚠️ Variante não implementada: <code>{section.id}.{section.variant}</code>
        </p>
        <p className="text-sm opacity-80 mt-1">
          Registre o componente em <code>src/components/landing/SectionsRenderer.tsx</code>.
        </p>
      </div>
    );
  }
  return null;
}

/**
 * Mapa de variantes -> componente.
 * Estrutura: variantsMap[sectionId][variant] = Component
 */
const variantsMap: Record<string, Record<string, React.ComponentType<any>>> = {
  hero: {
    fullscreen: HeroFullscreen,
    split: HeroSplit,
    minimal: HeroMinimal,
  },
  about: {},
  services: {
    grid: ServicesGrid,
  },
  team: {},
  gallery: {},
  testimonials: {},
  contact: {},
};

function resolveComponent(section: Section): React.ComponentType<any> | null {
  const bySection = variantsMap[section.id];
  if (!bySection) return null;
  return bySection[section.variant] ?? null;
}

/**
 * Extrai dados de runtime relevantes para a seção informada.
 * Centraliza a lógica de "qual chave de data vai pra qual seção".
 */
function getRuntimeDataForSection(
  section: Section,
  data?: SectionsRuntimeData
): Record<string, unknown> {
  if (!data) return {};

  switch (section.id) {
    case 'services':
      return { data: data.services ?? [] };
    default:
      return {};
  }
}

interface SectionsRendererProps {
  /** Dados vindos do SSR loader da rota (ex: services do Supabase). */
  data?: SectionsRuntimeData;
}

export function SectionsRenderer({ data }: SectionsRendererProps = {}) {
  const sections = getEnabledSectionsInOrder();

  return (
    <>
      {sections.map((section) => {
        const Component = resolveComponent(section);

        if (!Component) {
          return <MissingVariant key={section.id} section={section} />;
        }

        const runtimeProps = getRuntimeDataForSection(section, data);

        return (
          <Component key={section.id} {...section.props} {...runtimeProps} />
        );
      })}
    </>
  );
}
