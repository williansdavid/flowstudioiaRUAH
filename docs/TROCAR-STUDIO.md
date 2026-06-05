# Trocar / Provisionar Studio — FlowStudio AI

> **Fonte da verdade** para trocar o studio de um deploy ou provisionar um studio novo.
> Arquitetura: **1 studio = 1 deploy Netlify + 1 projeto Supabase**. Nada é compartilhado.

---

## 1. Modelo mental — 2 camadas

Trocar de studio mexe em **duas camadas independentes**:

| Camada | Onde mora | O que define | "Único arquivo"? |
|--------|-----------|--------------|------------------|
| **Identidade / visual** | `src/sites/<studio>/config/` + switch `src/config/active-studio.ts` | nome, cores, logo, conteúdo, SEO, horários, CSS | ✅ único ponto de acoplamento: `active-studio.ts` (1 linha) |
| **Infra / secrets** | `.env` (local) + Netlify env vars (produção) | Supabase URL/keys, APP_URL, integrações | ❌ credenciais por ambiente — não cabe em 1 arquivo |

**Regra de ouro:** o núcleo (`src/routes/__root.tsx` e afins) importa **somente** de `@/config/active-studio`. Nunca importa de `src/sites/` direto.

---

## 2. O switch — `src/config/active-studio.ts`

É o **único ponto de acoplamento** entre núcleo e studio:

```ts
// src/config/active-studio.ts
export * from '@/sites/ruah/studio'
```

Trocar o studio ativo do build = trocar **essa linha**:

```ts
export * from '@/sites/<outro-studio>/studio'
```

### Contrato estável exportado por todo `studio.ts`

Qualquer studio DEVE exportar exatamente isto (senão o núcleo quebra):

- `branding`, `content`, `identity` — dados crus
- `brandingCss` — CSS vars geradas do branding
- `themeClass` — classe de tema do `<html>`
- `seo` — SEO resolvido (`ResolvedSeo`)
- `buildLocalBusinessJsonLd` — builder de JSON-LD (função pura)
- `styleHrefs` — hrefs dos CSS na ordem de aplicação

---

## 3. Trocar studio num deploy JÁ existente

Cenário: o studio já existe em `src/sites/<studio>/` e você só quer apontar o build pra ele.

1. Editar `src/config/active-studio.ts` → trocar o `export * from`.
2. Conferir que o `.env` local aponta pro Supabase **desse** studio.
3. `npm run build` local pra validar.
4. Commit + push → Netlify rebuilda com o studio novo.

> ⚠️ As `VITE_*` são injetadas em **build time**. Se trocar studio, garanta que as env vars do Netlify (Supabase URL/keys) são as do studio correto **antes** de disparar o build.

---

## 4. Provisionar um studio NOVO do zero

### 4.1 Clonar o template

`ruah` é o template de referência. Copie a pasta inteira:

```powershell
$ErrorActionPreference = "Stop"
[Environment]::CurrentDirectory = (Get-Location).Path
$OutputEncoding = [System.Text.Encoding]::UTF8

$novo = "NOME-DO-STUDIO"   # ex.: "bella" — slug minusculo, sem espaco
Copy-Item "src/sites/ruah" "src/sites/$novo" -Recurse
Write-Host ">> src/sites/$novo criado a partir de ruah" -ForegroundColor Green
```

### 4.2 Editar os configs do studio

Em `src/sites/<novo>/config/`, ajustar:

| Arquivo | O que editar |
|---------|--------------|
| `identity.ts` | nome, slug, contato, endereço, redes |
| `branding.ts` | cores, tema, logo, fontes |
| `content.ts` | textos das seções, SEO (title/description) |
| `businessHours.ts` | horários de funcionamento |
| `seo/jsonLd.ts` | dados do LocalBusiness (JSON-LD) |
| `index.ts` | barrel — só confirmar reexports |

Revisar também `src/sites/<novo>/styles/*.css` e `assets/` (logo, imagens).

### 4.3 Apontar o switch

```ts
// src/config/active-studio.ts
export * from '@/sites/<novo>/studio'
```

### 4.4 Supabase — projeto próprio

Cada studio = **1 projeto Supabase isolado**.

1. Criar projeto novo no painel Supabase.
2. Rodar as migrations do projeto (schema: `profiles`, `clients`, `staff`, `services`, `appointments`, `finance_transactions`, `leads`, view `clients_view`, enums, function `current_user_role()`).
3. Conferir RLS habilitado em todas as tabelas.
4. Copiar do painel (Settings → API):
   - **Project URL** → vai em `VITE_SUPABASE_URL`
   - **anon public** → vai em `VITE_SUPABASE_ANON_KEY`
   - **service_role** → vai em `SUPABASE_SERVICE_ROLE_KEY`

### 4.5 Reescrever o `.env` local

O `.env` é **só infra/secrets** — nenhuma identidade de studio aqui. Trocar pelos valores do Supabase novo + URL do studio:

```env
# -------- Supabase (CLIENT — exposto ao browser) --------
VITE_SUPABASE_URL=https://<novo-projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key do studio novo>

# -------- Supabase (SERVER ONLY — nunca exponha) --------
SUPABASE_SERVICE_ROLE_KEY=<service role do studio novo>

# -------- App --------
VITE_APP_URL=http://localhost:3000   # local; em prod = dominio do studio
NODE_ENV=development

# -------- Evolution / IA / Seguranca --------
# preencher conforme o studio usar (opcionais)
```

Base sempre disponível: `.env.example`.

### 4.6 Netlify — criar site + subir env vars

1. **New site** no Netlify, conectado ao mesmo repo (ou branch dedicada).
2. Build: `npm run build` · publish: conforme adapter TanStack Start.
3. **Site settings → Environment variables** → adicionar:

| Variável | Camada | Quando é usada | Troca por studio? |
|----------|--------|----------------|-------------------|
| `VITE_SUPABASE_URL` | CLIENT | **build** (entra no bundle) | ✅ |
| `VITE_SUPABASE_ANON_KEY` | CLIENT | **build** | ✅ |
| `VITE_APP_URL` | CLIENT | **build** | ✅ (domínio do studio) |
| `SUPABASE_SERVICE_ROLE_KEY` | SERVER | runtime (functions SSR) | ✅ |
| `NODE_ENV` | SERVER | runtime | = `production` |
| `EVOLUTION_API_URL` | SERVER | runtime | opcional |
| `EVOLUTION_API_KEY` | SERVER | runtime | opcional |
| `EVOLUTION_INSTANCE_NAME` | SERVER | runtime | opcional |
| `EVOLUTION_WEBHOOK_SECRET` | SERVER | runtime | opcional |
| `OPENAI_API_KEY` | SERVER | runtime | opcional |
| `AI_MODEL` | SERVER | runtime | default `gpt-4o-mini` |
| `RATE_LIMIT_PUBLIC_PER_MINUTE` | SERVER | runtime | default `10` |

> ⚠️ **`VITE_*` em build time:** se editar uma `VITE_*` no Netlify, precisa **redeploy/rebuild** — não basta salvar. O valor já foi "queimado" no bundle do build anterior.

### 4.7 Deploy + verificação

1. Push da branch do studio (ou trigger manual de deploy).
2. Após o deploy, conferir:
   - Landing renderiza com a identidade do studio correto.
   - Login/auth conecta no Supabase **certo** (não no do ruah).
   - SEO/JSON-LD com dados do studio (view-source).
   - Sem erro de env no log de build (`env.ts` falha rápido se faltar var).

---

## 5. Checklist rápido (copiável)

```text
[ ] Copiei src/sites/ruah -> src/sites/<novo>
[ ] Editei identity / branding / content / businessHours / seo/jsonLd
[ ] Troquei assets (logo, imagens) e revisei styles/*.css
[ ] Apontei o switch em src/config/active-studio.ts
[ ] Criei projeto Supabase novo + migrations + RLS
[ ] Copiei URL / anon / service_role
[ ] Reescrevi .env local com as credenciais do studio novo
[ ] npm run build local passou sem erro de env
[ ] Criei site no Netlify conectado ao repo
[ ] Subi TODAS as env vars (CLIENT + SERVER) no Netlify
[ ] Deploy disparado
[ ] Verifiquei landing / auth / SEO no dominio do studio
```

---

## Notas de arquitetura

- **Nunca** colocar identidade de studio no `.env`. Identidade vive em `src/sites/<studio>/config/`.
- **`VITE_STUDIO_NAME` / `VITE_STUDIO_SLUG` estão obsoletos** — não existem no código atual nem no `env.ts`. Ignorar.
- O núcleo nunca importa de `src/sites/` direto — só via `@/config/active-studio`.
- Sites consomem o core via fachadas (`buildBrandingCss`, `buildSeo`).
