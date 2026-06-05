# FlowStudio AI — Checkpoint do Projeto

Ultima atualizacao: 05/06/2026
Estado: Sprint 1 iniciando — Auth + Login (core do zero)

---

## Contexto rapido

FlowStudio AI e uma plataforma white-label para studios de beleza. Cada
studio recebe deploy isolado (Netlify + Supabase proprios). A Sprint 0.5
fechou a fundacao white-label (switch) e DEMOLIU o admin legado. Agora o
core sera reconstruido do zero, comecando pela autenticacao.

---

## Estado real do codigo (validado por inspecao)

### Rotas existentes

- src/routes/__root.tsx
- src/routes/index.tsx (landing publica do Ruah)

NAO existe rota de login, /admin, nem _authed.

### Auth

- src/lib/supabase/server.ts  unico arquivo com auth.* / createServerClient
- src/lib/supabase/client.ts  client browser (anon)

AVISO: auth NAO esta cabeada. Nao ha signInWithPassword ativo, guard,
beforeLoad de sessao nem tela de login. Sobrou apenas a fundacao de clients.

### Infra de lib

- src/lib/env.ts          validacao Zod (sem VITE_STUDIO_SLUG/NAME)
- src/lib/query/client.ts React Query client

### White-label

- src/config/active-studio.ts  export * from '@/sites/ruah/studio' (ADR-002)
- src/sites/ruah/studio.ts     export consolidado (contrato estavel)

### Studio Ruah

- Landing publica funcional em /
- Identidade, branding, content, SEO, businessHours em config/
- Fachadas: buildBrandingCss.ts, buildSeo.ts

### Legado (somente referencia, nao builda)

- src/_legacy/admConfig/          admin antigo
- src/_legacy/docs/checkpoints/   checkpoints/roadmaps antigos
- src/sites/_legacy/              sites arquivados

---

## Sprint 0 — Housekeeping (CONCLUIDA)

- Remocao de .bak, pastas orfas, backups de styles
- Build + typecheck verdes

---

## Sprint 0.5 — Fundacao White-Label (CONCLUIDA)

- [x] docs/adr/ + ADR-001 + ADR-002 (supersede 001)
- [x] src/sites/ruah/studio.ts consolidado
- [x] src/config/active-studio.ts (export * puro)
- [x] studio.config.ts legado removido
- [x] VITE_STUDIO_SLUG/NAME removidos do env.ts
- [x] Admin legado demolido (commit f837eee) e arquivado em _legacy/
- [x] Checkpoints/roadmaps antigos arquivados
- [x] Typecheck + build verdes
- [x] Landing publica funcionando

---

## Sprint 1 — Auth + Login (EM ANDAMENTO)

Objetivo: Construir auth do zero + tela de login NOVA sobre os clients
Supabase existentes.

### Pendente

- [ ] src/features/auth/ (types, queries, hooks, components)
- [ ] src/server/auth/ (signIn, signOut, getSession)
- [ ] src/routes/login.tsx (UI nova, mobile-first)
- [ ] beforeLoad de sessao SSR no router
- [ ] Guard base para /admin/* (role via current_user_role())
- [ ] Redirects (nao auth -> /login ; auth em /login -> /admin)
- [ ] Typecheck + build verdes
- [ ] Smoke test login + sessao SSR (sem flash, console limpo)

---

## Proximo passo imediato

Investigar o conteudo real de src/lib/supabase/client.ts e server.ts para
saber exatamente o que ja existe (qual API de client, como a sessao e lida)
ANTES de desenhar a feature auth. Sem isso nao da pra cabear o login
corretamente.

Apos a investigacao:

1. Definir contrato da feature auth (types + server fns)
2. Construir src/routes/login.tsx
3. Cabear beforeLoad + guard
4. Validar typecheck + build + smoke test

---

## Arquivos criticos do projeto (referencia rapida)

- src/routes/__root.tsx           root layout + SSR head
- src/routes/index.tsx            landing do studio ativo
- src/lib/env.ts                  validacao Zod de env
- src/lib/supabase/client.ts      client browser
- src/lib/supabase/server.ts      client server (auth.*)
- src/lib/query/client.ts         React Query client
- src/config/active-studio.ts     switch white-label (ADR-002)
- src/sites/ruah/studio.ts        export consolidado do Ruah
- src/sites/ruah/config/          identidade, branding, content, seo, horarios
- src/sites/ruah/utils/           fachadas (buildBrandingCss, buildSeo)
- docs/ARCHITECTURE.md            arquitetura oficial (v2.0)
- docs/ROADMAP.md                 sprints planejados
- docs/CHECKPOINT.md              este documento
- docs/TECHDEBT.md                debitos tecnicos do nucleo
- docs/TROCAR-STUDIO.md           provisionar/trocar studio
- docs/adr/                       decisoes arquiteturais

---

## Zonas congeladas durante Sprint 1

- src/sites/ruah/ nao recebe alteracoes de feature (so a landing ja existe)
- src/_legacy/ somente leitura (referencia historica)

---

## Regras permanentes em vigor

- Investigar antes de planejar; nunca chutar
- Sempre fornecer comandos PowerShell prontos para Windows
- Sempre validar typecheck + build antes de fechar etapa
- Manter os 5 documentos sincronizados
  (ARCHITECTURE, ROADMAP, CHECKPOINT, TECHDEBT, TROCAR-STUDIO)
- Novos debitos registrados em docs/TECHDEBT.md no momento em que surgem
- Tech debt/roadmap especificos de studio vivem em src/sites/<studio>/docs/
- ADRs sao imutaveis; decisao que muda gera novo ADR que supersede

---

Fim do documento.
