# ADR-001: Arquitetura White-Label com Switch Master

> ## SUBSTITUIDO POR ADR-002 (./ADR-002-switch-simplificado.md) — 05/06/2026
> Este ADR esta descontinuado. A validacao cruzada via VITE_STUDIO_SLUG
> e o objeto deploy foram descartados na implementacao real por
> acoplamento desnecessario. Mantido intacto como registro historico
> (regra de imutabilidade da pasta adr/). Para a decisao vigente, ver ADR-002.

---

> Status: Substituido por ADR-002
> Data: 02/06/2026
> Decisores: Willians + FlowStudio AI Architect
> Supersedes: —
> Substituido por: ADR-002 (05/06/2026)
> Relacionado: ARCHITECTURE.md

---

## Contexto

O FlowStudio AI e uma plataforma white-label com modelo de implantacao
isolada por studio (1 deploy Netlify + 1 Supabase + 1 codigo por cliente).

O modelo de configuracao antigo (src/config/studio.config.ts) tinha
3 limitacoes operacionais:

1. Nao amarrava metadados de deploy (qual Netlify, qual Supabase, qual repo).
   Risco: subir codigo do Studio A apontando pro banco do Studio B = vazamento.
2. Nao validava .env contra codigo. App subia sem erro mesmo com .env de um
   studio e branding de outro.
3. Nao tinha ponto unico de troca. Trocar de studio exigia editar varios arquivos.

---

## Decisao (descontinuada)

Adotar "Studio Autocontido + Switch Master" com 3 principios:

### Principio 1 — Studio autocontido em src/sites/{slug}/
Cada studio e uma pasta autocontida com tudo que lhe pertence (componentes,
branding, conteudo, identidade, horarios, SEO, estilos, helpers).
Este principio sobrevive no ADR-002.

### Principio 2 — Entrypoint consolidado por studio
Cada studio expoe src/sites/{slug}/studio.ts re-exportando sua config.
Este principio sobrevive no ADR-002.

### Principio 3 — Switch master + validacao cruzada (DESCARTADO)
Substituir studio.config.ts por active-studio.ts com objeto deploy e
validacao cruzada abortando o app se VITE_STUDIO_SLUG !== deploy.slug.
Este principio foi DESCARTADO — ver ADR-002.

---

## Alternativas consideradas

### Alternativa A — Import dinamico via .env (descartada)
Vite nao tree-shake import dinamico (bundle inflado), quebra SSR
(head() exige sincrono), perde inferencia de tipo.

### Alternativa B — Pasta src/studios/{slug}/ separada de src/sites/ (descartada)
Refatoracao destrutiva desnecessaria, fronteira artificial, complexidade
sem ganho.

### Alternativa C (escolhida na epoca) — Studio autocontido + switch master
Escolhida entao. O ADR-002 manteve os Principios 1 e 2 e descartou apenas
o Principio 3 (validacao cruzada).

---

## Consequencias (registradas na epoca)

### Positivas
- Validacao cruzada impediria deploy com .env errado
- Tudo do studio em um lugar
- Tree-shake automatico
- Novo studio = copia + edit + deploy

### Negativas / Trade-offs
- Trocar de studio exige rebuild (aceitavel)
- Disciplina manual sem lint enforcement

---

## Por que foi substituido

Na implementacao real (Sprint 0.5), o Principio 3 mostrou-se acoplamento
desnecessario:

- A validacao cruzada via VITE_STUDIO_SLUG duplicava em env uma verdade que
  ja vive no codigo (active-studio.ts).
- O .env passou a conter apenas infra/secrets — identidade de studio nunca
  mais entrou em env, eliminando a classe de erro que a validacao tentava pegar.
- O objeto deploy no codigo adicionava metadados que, na pratica, vivem no
  painel Netlify/Supabase — nao no source.

Resultado: o switch foi simplificado para export * puro. Ver ADR-002.

---

Fim do ADR-001 (descontinuado).
