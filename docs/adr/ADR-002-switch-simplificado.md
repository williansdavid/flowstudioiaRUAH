# ADR-002: Switch White-Label Simplificado (export *)

> Status: Aprovado
> Data: 05/06/2026
> Decisores: Willians + FlowStudio AI Architect
> Supersedes: ADR-001
> Relacionado: ARCHITECTURE.md, TROCAR-STUDIO.md

---

## Contexto

O ADR-001 propos um switch white-label com 3 principios. Os dois primeiros
(studio autocontido em src/sites/{slug}/ + entrypoint studio.ts) se provaram
corretos e seguem em vigor.

O terceiro principio — objeto deploy no switch + validacao cruzada abortando
o app quando VITE_STUDIO_SLUG !== deploy.slug — foi implementado e revertido
durante a Sprint 0.5, por tres motivos:

1. Redundancia. O studio ativo ja e definido em codigo (active-studio.ts).
   Replicar isso em VITE_STUDIO_SLUG criava duas fontes de verdade pro mesmo
   fato — e duas fontes de verdade e exatamente a classe de bug que a
   validacao tentava evitar.

2. Fronteira ja resolvida por convencao. O .env passou a conter somente
   infra/secrets (Supabase URL/keys, APP_URL, integracoes). Identidade de
   studio vive exclusivamente em src/sites/<slug>/config/. Com identidade
   fora do env, o mismatch que a validacao cacava deixou de existir na pratica.

3. Metadados de deploy nao pertencem ao source. netlifySiteName,
   supabaseProjectRef, gitRepo etc. vivem no painel Netlify/Supabase.
   Duplica-los num objeto deploy no codigo gerava manutencao dupla sem ganho.

---

## Decisao

O switch src/config/active-studio.ts e um re-export puro do studio ativo,
sem objeto deploy e sem validacao cruzada:

    // src/config/active-studio.ts
    export * from '@/sites/ruah/studio'

Trocar o studio ativo = trocar essa unica linha:

    export * from '@/sites/<outro-studio>/studio'

### Contrato estavel exportado por todo studio.ts

Qualquer studio DEVE exportar exatamente isto (senao o nucleo quebra):

- branding, content, identity   dados crus
- brandingCss                   CSS vars geradas do branding
- themeClass                    classe de tema do <html>
- seo                           SEO resolvido (ResolvedSeo)
- buildLocalBusinessJsonLd      builder de JSON-LD (funcao pura)
- styleHrefs                    hrefs dos CSS na ordem de aplicacao

### O que muda em relacao ao ADR-001

- Studio autocontido em sites/{slug}/      ADR-001: sim | ADR-002: sim (mantido)
- Entrypoint studio.ts consolidado         ADR-001: sim | ADR-002: sim (mantido)
- Objeto deploy no switch                  ADR-001: sim | ADR-002: removido
- Validacao cruzada VITE_STUDIO_SLUG       ADR-001: sim | ADR-002: removido
- VITE_STUDIO_SLUG / VITE_STUDIO_NAME      ADR-001: obrigatorio | ADR-002: obsoleto
- Forma do switch                          ADR-001: import + deploy + guard
                                           ADR-002: export * puro

---

## Alternativas consideradas

### Manter a validacao cruzada do ADR-001 (descartada)
Protege contra um erro (identidade no env) que deixou de existir quando
identidade saiu do env por convencao. Custo (duas fontes de verdade, env
extra, codigo de guard) sem beneficio real.

### Validar via comparacao active-studio vs. Supabase URL em runtime (descartada)
O env.ts (Zod) ja falha rapido se faltar/quebrar var de Supabase. Adicionar
checagem semantica "este Supabase e do studio X?" exigiria mapa
studio->projectRef no codigo — de volta ao problema de metadados no source.

### export * puro (escolhida)
- Uma unica fonte de verdade (o codigo).
- .env = so infra. Identidade = so sites/<slug>/config/.
- Zero codigo de guard pra manter.
- SSR-safe + tree-shake automatico (import estatico preservado).

---

## Consequencias

### Positivas
- Uma fonte de verdade pro studio ativo: o switch.
- Menos codigo: sem objeto deploy, sem guard de mismatch.
- Seguranca por convencao: identidade nunca no env -> mismatch impossivel.
- Tree-shake mantido: export * de import estatico e SSR-safe.

### Negativas / Trade-offs
- Sem trava automatica contra apontar .env do studio errado no build.
  Mitigacao: checklist de deploy em TROCAR-STUDIO.md + verificacao
  pos-deploy (auth conecta no Supabase certo, SEO/landing corretos).
- Disciplina manual ao provisionar studio novo.
  Mitigacao: TROCAR-STUDIO.md e a fonte da verdade do processo.

---

## Implementacao

Ja em vigor (Sprint 0.5 — CONCLUIDA):

1. src/sites/ruah/studio.ts consolidado.
2. src/config/active-studio.ts = export * from '@/sites/ruah/studio'.
3. studio.config.ts legado removido.
4. VITE_STUDIO_SLUG / VITE_STUDIO_NAME removidos do env.ts.
5. Nucleo importa so de @/config/active-studio.

---

Fim do ADR-002.
