A landing pública (rota `/`) é montada dinamicamente por `SectionsRenderer`,
lendo a configuração de `src/config/studio.sections.ts`.

## 🧱 Arquitetura
## 🧱 Arquitetura
studio.sections.ts → loadSections.ts → SectionsRenderer → Componentes de variante

- **`studio.sections.ts`** — Define ORDEM, quais seções estão ATIVAS e qual VARIANTE usar.
- **`loadSections.ts`** — Carrega config e retorna apenas seções habilitadas, ordenadas.
- **`SectionsRenderer.tsx`** — Mapeia `(sectionId + variant)` para o componente real.
- **`<section>/<Variant>.tsx`** — Implementação visual de cada variante.

## 📐 Seções e variantes disponíveis

| Seção         | Variantes                              |
|---------------|----------------------------------------|
| `hero`        | `fullscreen`, `split`, `minimal`       |
| `about`       | `text-only`, `text-image`, `stats`     |
| `services`    | `grid`, `list`, `cards-featured`       |
| `team`        | `grid`, `carousel`, `list`             |
| `gallery`     | `grid`, `masonry`, `carousel`          |
| `testimonials`| `grid`, `carousel`, `featured`         |
| `contact`     | `form-map`, `form-only`, `whatsapp-cta`|

## ➕ Adicionar nova variante

1. Criar componente em `src/components/landing/<section>/<NomeDaVariante>.tsx`
2. Registrar no `variantsMap` do `SectionsRenderer.tsx`
3. Adicionar o literal ao tipo `XxxVariant` em `src/types/sections.ts`
4. Documentar nesta tabela

## ➕ Adicionar nova seção

1. Criar tipo `XxxSection` em `src/types/sections.ts`
2. Adicionar no union `Section` e em `StudioSectionsConfig.sections`
3. Criar pasta `src/components/landing/<xxx>/`
4. Registrar entrada em `variantsMap` no `SectionsRenderer.tsx`
5. Adicionar bloco em `studio.sections.ts`

## 🔁 Reordenar seções

Edite o array `order` em `studio.sections.ts`.

## ⛔ Desativar seção

Defina `enabled: false` no bloco da seção em `studio.sections.ts`.

## 🖼️ Imagens

- Padrão atual: arquivos versionados em `public/studio/`
- Fallback: URLs externas (campo `src`)
- Futuro: Supabase Storage por studio

## 🚀 Migração futura para painel admin

`loadStudioSections()` é o único ponto que lê a config. Quando o painel
admin existir, basta substituir a leitura do arquivo por leitura da tabela
`studio_sections` no Supabase. Nenhum consumidor precisa mudar.
'@
Write-Host "✅ src/components/landing/README.md criado" -ForegroundColor Green
