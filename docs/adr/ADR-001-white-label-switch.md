# ADR-001: Arquitetura White-Label com Switch Master

> **Status:** ✅ Aprovado
> **Data:** 02/06/2026
> **Decisores:** Willians + FlowStudio AI Architect
> **Supersedes:** —
> **Relacionado:** `ARCHITECTURE.md` §3 (Zonas) e §9 (Studio Config)

---

## Contexto

O FlowStudio AI é uma plataforma **white-label** com modelo de implantação **isolada por studio** (1 deploy Netlify + 1 Supabase + 1 código por cliente).

O modelo atual de configuração (`src/config/studio.config.ts`) tem **3 limitações operacionais** que comprometem a escalabilidade do white-label:

1. **Não amarra metadados de deploy** (qual Netlify, qual Supabase, qual repo). Risco: subir código do Studio A apontando pro banco do Studio B = **vazamento catastrófico de dados**.

2. **Não valida `.env` contra código.** Se o `.env` aponta pro Supabase do Lumi mas o código importa o branding do Ruah, o app sobe **sem erro** e expõe dados errados.

3. **Não tem ponto único de troca.** Para trocar de studio hoje, é preciso editar múltiplos arquivos em locais distintos — propenso a erro.

Adicionalmente, há uma **inconsistência conceitual**: o nome `studio.config.ts` sugere "configuração do studio", mas o studio em si vive em `src/sites/{slug}/`. O arquivo na verdade é um **switch** que aponta qual studio está ativo.

---

## Decisão

Adotar arquitetura **"Studio Autocontido + Switch Master"** com 3 princípios:

### Princípio 1 — Studio autocontido em `src/sites/{slug}/`

Cada studio é uma **pasta autocontida** com TUDO que lhe pertence:

- Componentes React específicos
- Branding (cores, fontes, logos)
- Conteúdo (textos, gallery, testimonials)
- Identidade (nome, slogan, contato)
- Horários de funcionamento
- SEO específico
- Estilos CSS próprios
- Helpers e utils locais

**Regra:** para criar um novo studio, basta copiar a pasta e editar o conteúdo.
**Regra:** nenhuma pasta `sites/A` importa de `sites/B`.

### Princípio 2 — Entrypoint consolidado por studio

Cada studio expõe um único arquivo de entrada que re-exporta toda sua config:

```
src/sites/{slug}/studio.ts
```

Esse arquivo consolida `identity + branding + content + businessHours` em um objeto `studio` tipado, pronto para consumo externo.

### Princípio 3 — Switch master + validação cruzada

Substituir `src/config/studio.config.ts` por `src/config/active-studio.ts`:

```ts
import { studio } from '@/sites/ruah/studio'

export { studio }

export const deploy = {
  slug: 'ruah',
  siteFolder: 'sites/ruah',
  netlifySiteName: 'ruah-barbearia',
  productionUrl: 'https://ruahbarbearia.com.br',
  supabaseProjectRef: 'ewexyctlrkvcpnutxygt',
  gitRepo: 'flowstudio-ruah',
  gitBranch: 'main',
} as const

// Validação cruzada: aborta o app se .env não bater com o studio importado
if (import.meta.env.VITE_STUDIO_SLUG !== deploy.slug) {
  throw new Error('STUDIO MISMATCH: ...')
}
```

**Para trocar de studio:** editar **1 import** + **2 vars do .env**. Fim.

---

## Alternativas consideradas

### ❌ Alternativa A — Import dinâmico via `.env`

```ts
const slug = import.meta.env.VITE_ACTIVE_STUDIO
const studio = await import(`@/sites/${slug}/studio.ts`)
```

**Descartada** por 3 motivos técnicos críticos:

- Vite não consegue tree-shake imports dinâmicos → **bundle inflado** com TODOS os studios
- SSR exige código síncrono em `head()` → import dinâmico **quebra SSR**
- TypeScript perde inferência de tipo → **perda de type-safety**

### ❌ Alternativa B — Pasta nova `src/studios/{slug}/` separada de `src/sites/`

Separar "dados do cliente" (`studios/`) de "código do template" (`sites/`).

**Descartada** por:

- Força refatoração desnecessária de tudo que já existe no Ruah
- Cria fronteira artificial onde "1 pasta = 1 studio" já resolvia
- Adiciona complexidade conceitual sem ganho prático

### ✅ Alternativa C (escolhida) — Studio autocontido em `sites/` + switch master

Vantagens decisivas:

- Mantém estrutura atual (zero refatoração destrutiva)
- 1 studio = 1 pasta (princípio limpo)
- Switch master amarra tudo em 1 arquivo
- Validação cruzada protege contra deploy errado
- Import estático = SSR-safe + tree-shake automático
- Escala linear (cliente novo = cópia + edit + deploy)

---

## Consequências

### Positivas

- 🛡️ **Segurança:** validação cruzada impede deploy de código com `.env` errado
- 🎯 **DX:** abrir `src/sites/ruah/` mostra TUDO do Ruah em um só lugar
- 📦 **Performance:** tree-shake automático mantém bundle enxuto (só o studio ativo)
- 🚀 **Escalabilidade:** novo studio = `cp -r` + 1 edit em switch + .env
- 🧩 **Manutenção:** decisão de "qual studio" centralizada em 1 arquivo
- 📝 **Documentação inline:** metadados de deploy ficam no código (Netlify, Supabase, repo)

### Negativas / Trade-offs

- 📂 Cada studio ocupa espaço no source (mesmo que não vá pro bundle)
  - **Mitigação:** ESLint rule futura proibindo imports cruzados `sites/A → sites/B`
- 🔀 Trocar de studio exige **rebuild** (não é runtime switch)
  - **Aceitável:** Netlify já faz rebuild por deploy, comportamento natural
- ⚠️ Disciplina manual no início (sem lint enforcement ainda)
  - **Mitigação:** code review + ADR documentado

---

## Implementação

Ver `CHECKPOINT.md` → **Sprint 0.5 — Fundação White-Label**.

Resumo dos passos:

1. Criar `src/sites/ruah/studio.ts` (entrypoint consolidado)
2. Criar `src/config/active-studio.ts` (switch + validação cruzada)
3. Atualizar `src/config/studio.types.ts` (tipo Studio consolidado)
4. Migrar consumidores de `@/config/studio.config` → `@/config/active-studio`
5. Deletar `src/config/studio.config.ts` (legacy)
6. Refatorar `__root.tsx` e `index.tsx` para consumir `active-studio`
7. Atualizar `.env.example` com `VITE_STUDIO_SLUG`
8. Validar typecheck + build + dev
9. Validar mismatch deliberado: trocar `VITE_STUDIO_SLUG` para valor errado → app deve abortar

---

**Fim do ADR-001.**
