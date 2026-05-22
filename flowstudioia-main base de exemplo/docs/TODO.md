# TODO.md — FlowStudio AI

> Documento de acompanhamento técnico do projeto  
> Última atualização: 15/05/2026

---

## 📌 VISÃO GERAL DO PROJETO

**Nome:** FlowStudio AI  
**Tipo:** Sistema SaaS/base white-label para gestão de salões, barbearias e estúdios de beleza  
**Arquitetura atual:** SSR com TanStack React Start + Supabase  
**Deploy:** Netlify  
**Banco/Auth:** Supabase  
**Status atual:** Ambiente local e deploy Netlify funcionando com CSS corrigido  

---

## 🧭 ESTRATÉGIA DE PRODUTO — FASE ATUAL

Neste primeiro momento, o FlowStudio AI será tratado como uma **base comum de sistema**, mas cada salão terá sua própria instância isolada.

A landing pública `/` será a **landing do salão implantado naquele deploy**, e não a landing institucional do SaaS FlowStudio AI.

### Modelo atual escolhido

```txt
Mesmo código-fonte base
+
Um deploy Netlify por salão
+
Um projeto Supabase por salão
+
Uma landing pública personalizada por salão
```

### Exemplo

```txt
Salão 1
- Landing própria
- Netlify próprio
- Supabase próprio
- Serviços próprios
- Equipe própria
- Clientes próprios
- Agendamentos próprios
- Leads próprios
- Configurações próprias

Salão 2
- Landing própria
- Netlify próprio
- Supabase próprio
- Serviços próprios
- Equipe própria
- Clientes próprios
- Agendamentos próprios
- Leads próprios
- Configurações próprias
```

### Objetivo desta fase

Validar o produto com clientes reais de forma mais simples, segura e rápida, mantendo os dados de cada empresa completamente separados.

### Benefícios deste modelo inicial

- Isolamento total de dados por salão.
- Menor complexidade inicial do que multiempresa/multi-tenant.
- Mais segurança operacional para o MVP.
- Facilidade para personalizar landing, imagens, contatos e identidade de cada salão.
- Permite vender como sistema personalizado para cada empresa.
- Reduz riscos de vazamento entre empresas.
- Facilita testes em produção com clientes reais.

### Pontos de atenção

- Cada novo salão exigirá configuração própria.
- Cada salão terá variáveis de ambiente próprias.
- Cada salão terá Supabase próprio.
- Cada salão terá deploy/site próprio.
- Atualizações de código precisarão ser publicadas em cada deploy.
- Migrations/alterações de banco precisarão ser replicadas em cada projeto Supabase.
- Será necessário padronizar o processo de implantação para evitar inconsistências.

### Evolução futura

Após validação do MVP, o projeto poderá evoluir para arquitetura multi-tenant:

```txt
Uma única base Supabase
+
Tabela de empresas/salões
+
tenant_id nas tabelas
+
controle de acesso por empresa
+
onboarding automatizado
+
landing institucional do SaaS separada das landings dos salões
```

Essa evolução será planejada em uma fase posterior.

---

## ✅ STATUS GERAL ATUAL

O projeto já está com o ambiente local estabilizado e com publicação em produção realizada com sucesso no Netlify.

### Concluído

- Ambiente local funcionando com:

```powershell
npm run dev
```

- CSS/Tailwind carregando corretamente.
- Build de produção funcionando.
- Deploy para produção no Netlify realizado com sucesso.
- Correção de cache/build antigo aplicada.
- Fluxo de deploy documentado.
- Script `.bat` de deploy recomendado.
- Estratégia inicial definida: **um salão por Supabase/deploy**.
- Landing pública definida como **landing do salão compilado**.

### Pendências principais

- Criar camada de configuração por salão.
- Remover dados fixos/falsos da landing.
- Ajustar landing para consumir configuração do salão.
- Validar todas as rotas em produção.
- Validar autenticação com Supabase em produção.
- Validar permissões por role.
- Validar módulos administrativos.
- Revisar warnings do TanStack Router sobre arquivos em `src/routes`.
- Padronizar processo de criação de novo salão.
- Validar conexão com Supabase correto por deploy.

---

## 🧱 STACK TECNOLÓGICA

| Camada | Tecnologia |
|---|---|
| Framework | TanStack React Start SSR |
| Roteamento | TanStack Router file-based |
| Backend/Auth/DB | Supabase |
| Client HTTP | `@supabase/supabase-js` |
| Estado assíncrono | TanStack React Query |
| UI | Tailwind CSS + Lucide Icons |
| Notificações | Sonner toast |
| Build | Vite |
| Deploy | Netlify |

---

## 🧩 SEPARAÇÃO ENTRE BASE COMUM E CONFIGURAÇÃO POR SALÃO

O projeto deve ser organizado separando claramente o que é comum a todos os salões e o que muda em cada implantação.

---

### Núcleo comum do FlowStudio AI

Tudo que pertence ao sistema-base deve permanecer reaproveitável entre todos os salões.

#### Itens comuns

```txt
src/routes/admin/*
src/routes/_protected/*
src/components/*
src/components/ui/*
src/components/admin/*
src/hooks/*
src/lib/*
src/integrations/supabase/*
src/styles.css
src/router.tsx
src/server.ts
src/start.ts
```

#### Funcionalidades comuns

- Login e autenticação.
- Guards de rota.
- Dashboard administrativo.
- Agenda.
- Clientes.
- Serviços.
- Equipe.
- Financeiro.
- Configurações.
- WhatsApp.
- Chat IA.
- Formulário de leads.
- Design system.
- Componentes UI.
- Integração Supabase.

---

### Itens específicos por salão

Cada salão poderá ter seus próprios dados e identidade visual.

#### Itens variáveis por salão

```txt
Nome do salão
Slogan/frase principal
Descrição da landing
Telefone
WhatsApp
Instagram
Endereço
Cidade/UF
Imagem hero
Imagens auxiliares
Texto do formulário
Texto do rodapé
Cores futuras
Serviços cadastrados
Equipe cadastrada
Dados de contato
Configurações WhatsApp
```

---

### Estratégia recomendada para configuração por salão

Criar uma camada dedicada de configuração para a landing pública.

#### Versão inicial recomendada

```txt
src/lib/site.config.ts
```

A landing pública deve ler os textos e dados institucionais desse arquivo de configuração, evitando deixar dados fixos diretamente dentro de:

```txt
src/routes/index.tsx
```

#### Estrutura futura sugerida

```txt
src/config/
  salons/
    default.ts
    studio-exemplo.ts
  site.config.ts
```

---

### Variável de ambiente para escolher o salão compilado

Cada deploy poderá informar qual salão será compilado/publicado usando variável de ambiente.

Exemplo:

```txt
VITE_SALON_SLUG=studio-exemplo
```

Com isso, o mesmo código poderá gerar uma landing diferente conforme o salão configurado no deploy.

---

### Variáveis de ambiente por salão

Cada salão terá seu próprio Supabase.

Exemplo de variáveis por deploy Netlify:

```txt
VITE_SALON_SLUG=studio-exemplo
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxx
```

ou, se o projeto exigir variáveis sem prefixo `VITE` no SSR:

```txt
SALON_SLUG=studio-exemplo
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=xxxxxxxx
```

A confirmação dos nomes exatos das variáveis ainda deve ser validada no código.

---

## 🗄️ BANCO DE DADOS — Supabase

Cada salão terá, nesta fase, seu **próprio projeto Supabase**.

### Tabelas principais

| Tabela | Descrição |
|---|---|
| `profiles` | Perfil do usuário: `id`, `full_name`, `phone`, `avatar_url` |
| `user_roles` | Papéis dos usuários: admin, staff, client |
| `clients` | Clientes do salão |
| `staff` | Profissionais/equipe |
| `services` | Serviços oferecidos |
| `appointments` | Agendamentos |
| `finance_transactions` | Transações financeiras |
| `leads` | Leads do formulário de contato |
| `whatsapp_messages` | Mensagens WhatsApp |
| `whatsapp_settings` | Configurações da integração WhatsApp |
| `ai_messages` | Mensagens do chat IA |

---

## 🔢 ENUMS DO BANCO

| Enum | Valores |
|---|---|
| `app_role` | `admin` \| `staff` \| `client` |
| `appointment_status` | `pending` \| `confirmed` \| `completed` \| `cancelled` \| `no_show` |
| `tx_type` | `income` \| `expense` |

---

## 🗺️ ESTRUTURA DE ROTAS

| Rota | Descrição | Acesso |
|---|---|---|
| `/` | Landing page pública do salão implantado | Público |
| `/login` | Login + Signup | Público |
| `/unauthorized` | Acesso negado | Público |
| `/admin` | Dashboard admin | 🔒 Protegido |
| `/admin/agenda` | Agenda | 🔒 Protegido |
| `/admin/clients` | Clientes | 🔒 Protegido |
| `/admin/finance` | Financeiro | 🔒 Protegido |
| `/admin/services` | Serviços | 🔒 Protegido |
| `/admin/settings` | Configurações | 🔒 Protegido |
| `/admin/staff` | Equipe | 🔒 Protegido |
| `/admin/whatsapp` | WhatsApp | 🔒 Protegido |
| `/api/public/whatsapp-webhook` | Webhook público | Público |

---

## 🔐 GUARDS DE ROTA

### Implementados

- **`SessionGuard`**  
  Verifica se o usuário possui sessão ativa no Supabase.  
  Redireciona para `/login` caso não esteja autenticado.

- **`RoleGuard`**  
  Verifica o `app_role` do usuário na tabela `user_roles`.  
  Redireciona para `/unauthorized` caso o papel não seja permitido.

### Estratégia aplicada

- Rotas `/admin/*` protegidas por `SessionGuard` + `RoleGuard(["admin", "staff"])`.
- Guards implementados como componentes wrappers no TanStack Router.
- Checagem de sessão feita server-side via `beforeLoad` nas rotas.

### Pendência de validação

Testar em produção:

- Usuário não logado acessando `/admin`.
- Usuário logado sem role permitido.
- Usuário `admin`.
- Usuário `staff`.
- Usuário `client`.

---

## 🎨 DESIGN SYSTEM — Aurea "Warm Sand"

### Sistema de cores OKLCH

| Token | Uso |
|---|---|
| `--color-primary` | Ações principais, CTAs |
| `--color-secondary` | Elementos de suporte |
| `--color-accent` | Destaques, badges |
| `--color-surface` | Fundo de cards e painéis |
| `--color-bg` | Background geral |
| `--color-text` | Texto principal |
| `--color-muted` | Texto secundário/desabilitado |
| `--color-border` | Bordas e divisores |

### Tipografia

- Fonte principal definida via CSS custom properties.
- Escala tipográfica modular.
- Interface orientada à leitura rápida e uso administrativo.

### Sombras

- Sistema de sombras com tokens:
  - `--shadow-sm`
  - `--shadow-md`
  - `--shadow-lg`

### Filosofia visual

- Inspirado na landing page pública.
- **Mobile First**.
- Bottom navigation em mobile.
- Sidebar em desktop.
- Consistência visual entre área pública e área admin.
- Capacidade futura de personalização visual por salão.

---

## 🏗️ LAYOUT ADMIN

### Estrutura esperada

O layout administrativo deve manter consistência entre os módulos protegidos.

### Desktop

- Sidebar lateral.
- Área principal com conteúdo.
- Cabeçalho interno quando necessário.
- Cards com fundo `surface`.
- Ações principais destacadas com `primary`.

### Mobile

- Navegação inferior.
- Conteúdo em coluna única.
- Cards responsivos.
- Botões com área de toque confortável.
- Priorizar ações principais por tela.

### Módulos administrativos

| Módulo | Status |
|---|---|
| Dashboard | ⏳ Validar |
| Agenda | ⏳ Validar |
| Clientes | ⏳ Validar |
| Financeiro | ⏳ Validar |
| Serviços | ⏳ Validar |
| Equipe | ⏳ Validar |
| Configurações | ⏳ Validar |
| WhatsApp | ⏳ Validar |

---

## 🏠 LANDING PAGE PÚBLICA DO SALÃO

Na fase atual, a rota `/` representa a landing pública do salão implantado naquele deploy, e não a landing institucional do SaaS FlowStudio AI.

### Objetivo da landing

A landing deve apresentar o salão para o cliente final e permitir:

- Ver serviços ativos.
- Ver equipe/profissionais ativos.
- Entrar em contato.
- Enviar lead/formulário.
- Iniciar conversa via WhatsApp.
- Usar chat IA, se habilitado.
- Acessar login administrativo pelo rodapé ou botão discreto.

---

### Dados que devem vir do Supabase

```txt
services
staff
leads
ai_messages
whatsapp_settings
```

---

### Dados que devem vir da configuração do salão

```txt
Nome do salão
Telefone
WhatsApp
Instagram
Endereço
Cidade/UF
Frase principal
Descrição do hero
Texto de contato
Imagem principal
Texto do rodapé
Mostrar ou não tecnologia FlowStudio AI
```

---

### Ajustes necessários na landing atual

| Item | Status | Ação |
|---|---|---|
| Nome fixo `FlowStudio AI` no topo | ⏳ Pendente | Trocar para nome do salão via config |
| Meta title | ⏳ Pendente | Gerar com nome do salão |
| Meta description | ⏳ Pendente | Gerar com descrição do salão |
| Hero | ⏳ Pendente | Personalizar por salão |
| Card `+1.200 clientes felizes` | ⏳ Pendente | Remover ou trocar por dado real/configurável |
| Serviços | ✅ Parcial | Já busca `services` no Supabase |
| Equipe | ✅ Parcial | Já busca `staff` no Supabase |
| Depoimentos fictícios | ⏳ Pendente | Remover ou tornar configurável |
| Contato falso | ⏳ Pendente | Trocar por dados reais/config |
| Rodapé | ⏳ Pendente | Mostrar nome do salão e opcionalmente "Tecnologia por FlowStudio AI" |
| Formulário de lead | ⏳ Validar | Já usa `submitLead`, precisa testar |
| Chat IA | ⏳ Validar | Confirmar comportamento por salão |

---

### Checklist da landing por salão

| Item | Status |
|---|---|
| Nome do salão vindo da configuração | ⏳ Pendente |
| Hero personalizado | ⏳ Pendente |
| Telefone real | ⏳ Pendente |
| WhatsApp real | ⏳ Pendente |
| Instagram real | ⏳ Pendente |
| Endereço real | ⏳ Pendente |
| Serviços vindos do Supabase correto | ⏳ Pendente |
| Equipe vinda do Supabase correto | ⏳ Pendente |
| Formulário gravando lead no Supabase correto | ⏳ Pendente |
| Chat IA gravando mensagens no Supabase correto | ⏳ Pendente |
| Imagens carregando corretamente | ⏳ Pendente |
| Mobile validado | ⏳ Pendente |
| Desktop validado | ⏳ Pendente |

---

## 🏢 PROCESSO PARA CRIAR UM NOVO SALÃO

Cada novo salão deve seguir um processo padronizado para evitar inconsistências.

---

### 1. Criar projeto Supabase do salão

Criar um novo projeto no Supabase exclusivo para o salão.

Exemplo:

```txt
flowstudio-studio-exemplo
```

---

### 2. Aplicar schema/migrations

O novo Supabase deve receber a mesma estrutura de tabelas usada no projeto-base.

Tabelas necessárias:

```txt
profiles
user_roles
clients
staff
services
appointments
finance_transactions
leads
whatsapp_messages
whatsapp_settings
ai_messages
```

Enums necessários:

```txt
app_role
appointment_status
tx_type
```

---

### 3. Criar usuário administrador

Criar o primeiro usuário admin do salão.

Depois, garantir registro na tabela:

```txt
user_roles
```

Com papel:

```txt
admin
```

---

### 4. Cadastrar dados iniciais

Cadastrar dados reais do salão:

```txt
Serviços
Equipe
Configurações gerais
WhatsApp
Horários
Dados de contato
```

---

### 5. Criar configuração visual/institucional do salão

Criar ou atualizar configuração do salão no código.

Dados mínimos:

```txt
slug
nome do salão
telefone
whatsapp
instagram
endereço
cidade/UF
frase principal
descrição do hero
imagem principal
texto de contato
```

---

### 6. Criar site Netlify do salão

Cada salão deve ter seu próprio site/deploy no Netlify.

Exemplo:

```txt
studio-exemplo.netlify.app
```

ou domínio próprio:

```txt
www.studioexemplo.com.br
```

---

### 7. Configurar variáveis de ambiente no Netlify

Variáveis por salão:

```txt
VITE_SALON_SLUG=studio-exemplo
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxx
```

Confirmar os nomes exatos usados pelo projeto antes de publicar.

---

### 8. Fazer deploy

Usar processo padrão:

```powershell
Remove-Item -Recurse -Force dist, .vite, node_modules/.vite, .netlify/v1 -ErrorAction SilentlyContinue
npm ci
npm run build
netlify deploy --prod --build
```

---

### 9. Validar produção

Checklist obrigatório após publicação:

| Item | Status |
|---|---|
| Landing abre corretamente | ⏳ Pendente |
| Nome do salão correto | ⏳ Pendente |
| Dados de contato corretos | ⏳ Pendente |
| Serviços corretos | ⏳ Pendente |
| Equipe correta | ⏳ Pendente |
| Formulário salva lead | ⏳ Pendente |
| Login funciona | ⏳ Pendente |
| Admin acessa `/admin` | ⏳ Pendente |
| Staff acessa rotas permitidas | ⏳ Pendente |
| Client é bloqueado no admin | ⏳ Pendente |
| Supabase correto conectado | ⏳ Pendente |
| CSS carregando | ⏳ Pendente |
| Mobile validado | ⏳ Pendente |
| Desktop validado | ⏳ Pendente |

---

## ✅ ATUALIZAÇÃO — 15/05/2026

### Status do ambiente

O ambiente local foi estabilizado com sucesso.

### Validações concluídas

- `npm ci` executado com sucesso.
- `npm run dev` funcionando.
- CSS/Tailwind carregando corretamente no ambiente local.
- Build realizado com sucesso.
- Deploy realizado com sucesso no Netlify.
- Site publicado em produção.
- Estratégia inicial definida: cada salão terá landing, deploy e Supabase próprios.

---

## 🛠️ CORREÇÕES REALIZADAS

### CSS/Tailwind

O problema de CSS não carregando foi resolvido após limpeza dos caches e artefatos antigos de build.

Pastas/arquivos limpos durante o processo:

```powershell
Remove-Item -Recurse -Force dist, .vite, node_modules/.vite, .netlify/v1 -ErrorAction SilentlyContinue
```

Após a limpeza, o ambiente voltou a carregar corretamente os estilos.

### Pontos validados

- `styles.css` está sendo importado corretamente.
- Tailwind está sendo processado pelo Vite.
- `@tailwindcss/vite` está funcionando.
- O CSS aparece corretamente no `npm run dev`.
- O deploy no Netlify também funcionou.

---

## 🌐 NETLIFY

### Problema corrigido

Foi identificado erro relacionado ao arquivo:

```txt
Could not resolve "../../../dist/server/server.js"
```

### Causa provável

- Cache antigo da pasta `.netlify`.
- Referência gerada anteriormente apontando para `dist/server/server.js`.
- Pasta `dist` removida sem regeneração adequada do build.
- Artefatos antigos do Vite/Netlify interferindo no build atual.

### Solução aplicada

- Limpeza de caches locais.
- Limpeza parcial da pasta `.netlify/v1`.
- Novo build.
- Deploy com build forçado.

Comando final utilizado:

```powershell
netlify deploy --prod --build
```

### Status

| Item | Status |
|---|---|
| Login Netlify CLI | ✅ OK |
| Projeto linkado | ✅ OK |
| Build local | ✅ OK |
| Deploy produção | ✅ OK |
| CSS em produção | ✅ OK |

---

## 🚀 PROCESSO RECOMENDADO DE DEPLOY

Para novos deploys, seguir este fluxo:

```powershell
Remove-Item -Recurse -Force dist, .vite, node_modules/.vite, .netlify/v1 -ErrorAction SilentlyContinue
npm ci
npm run build
netlify deploy --prod --build
```

### Observações importantes

- Usar `npm ci` em vez de `npm install` para respeitar o lockfile.
- Usar sempre `netlify deploy --prod --build`.
- Evitar deploy manual sem build.
- Não apagar toda a pasta `.netlify` sem necessidade, pois ela pode guardar o vínculo com o site.
- Preferir limpar apenas:

```txt
.netlify/v1
```

---

## 📦 SCRIPT RECOMENDADO — WINDOWS

Arquivo sugerido:

```txt
deploy-netlify.bat
```

Conteúdo recomendado:

```bat
@echo off
title FlowStudio AI - Build e Deploy Netlify
color 0A

echo.
echo ============================================
echo   FlowStudio AI - Build e Deploy Netlify
echo ============================================
echo.

echo [1/5] Limpando caches antigos...
if exist dist rmdir /s /q dist
if exist .vite rmdir /s /q .vite
if exist node_modules\.vite rmdir /s /q node_modules\.vite
if exist .netlify\v1 rmdir /s /q .netlify\v1
echo [OK] Caches limpos.
echo.

echo [2/5] Instalando dependencias pelo lockfile...
call npm ci
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao instalar dependencias!
    pause
    exit /b 1
)
echo [OK] Dependencias instaladas.
echo.

echo [3/5] Gerando build de producao...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Build falhou! Corrija os erros acima antes de continuar.
    pause
    exit /b 1
)
echo [OK] Build gerado com sucesso.
echo.

echo [4/5] Verificando link com Netlify...
call netlify status >nul 2>&1
if %errorlevel% neq 0 (
    echo Site nao linkado. Iniciando netlify link...
    call netlify link
    if %errorlevel% neq 0 (
        echo.
        echo [ERRO] Falha ao linkar com Netlify!
        pause
        exit /b 1
    )
)
echo [OK] Netlify linkado.
echo.

echo [5/5] Iniciando deploy para producao...
call netlify deploy --prod --build
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Deploy falhou!
    pause
    exit /b 1
)

echo.
echo ============================================
echo   Deploy finalizado com sucesso!
echo ============================================
echo.
pause
```

---

## ⚠️ WARNINGS TÉCNICOS OBSERVADOS

Durante o `npm run dev`, foram observados avisos do TanStack Router indicando arquivos dentro de `src/routes` que não exportam uma `Route`.

Arquivos mencionados:

```txt
src/routes/admin.tsx
src/routes/routes.ts
src/routes/AdminLayout.tsx
```

Aviso apresentado:

```txt
does not export a Route. This file will not be included in the route tree.
```

### Diagnóstico

Esses arquivos provavelmente estão dentro de `src/routes`, mas não deveriam ser tratados como rotas pelo TanStack Router.

### Ação recomendada

Se esses arquivos forem utilitários, layouts auxiliares ou componentes internos, renomear usando o prefixo `-`.

Exemplo:

```txt
src/routes/-admin.tsx
src/routes/-routes.ts
src/routes/-AdminLayout.tsx
```

Alternativa:

- Configurar `routeFileIgnorePattern` no setup do TanStack Router.

### Status

| Item | Status |
|---|---|
| Warning identificado | ✅ Sim |
| Bloqueia ambiente local | ❌ Não |
| Bloqueia deploy | ❌ Não |
| Deve ser corrigido depois | ✅ Sim |

---

## 🔑 VARIÁVEIS DE AMBIENTE

### Supabase

Verificar no ambiente local e no Netlify se as variáveis necessárias estão configuradas.

Possíveis variáveis utilizadas pelo projeto:

```txt
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

ou, dependendo da configuração SSR:

```txt
SUPABASE_URL
SUPABASE_ANON_KEY
```

### Salão compilado

Para permitir landing/configuração específica por salão:

```txt
VITE_SALON_SLUG
```

ou, dependendo da configuração SSR:

```txt
SALON_SLUG
```

### Pendência

Confirmar exatamente quais nomes estão sendo usados no projeto e replicar no painel do Netlify.

### Checklist

| Item | Status |
|---|---|
| Variáveis locais `.env` | ⏳ Validar |
| Variáveis no Netlify | ⏳ Validar |
| Supabase URL | ⏳ Validar |
| Supabase anon key | ⏳ Validar |
| Slug do salão | ⏳ Definir |
| Ambiente production | ⏳ Validar |

---

## 🔐 CHECKLIST DE AUTENTICAÇÃO

Testar os seguintes cenários:

| Cenário | Resultado esperado | Status |
|---|---|---|
| Acessar `/login` | Página abre normalmente | ⏳ Pendente |
| Criar nova conta | Conta criada no Supabase | ⏳ Pendente |
| Login com conta existente | Redireciona corretamente | ⏳ Pendente |
| Logout | Sessão encerrada | ⏳ Pendente |
| Acessar `/admin` sem login | Redireciona para `/login` | ⏳ Pendente |
| Acessar `/admin` sem role permitido | Redireciona para `/unauthorized` | ⏳ Pendente |
| Acessar `/admin` como admin | Permite acesso | ⏳ Pendente |
| Acessar `/admin` como staff | Permite acesso | ⏳ Pendente |
| Acessar `/admin` como client | Bloqueia acesso | ⏳ Pendente |

---

## 🧪 CHECKLIST DE PRODUÇÃO

Após cada deploy, validar:

| Item | Status |
|---|---|
| Landing page abre | ⏳ Pendente |
| CSS carregando | ✅ OK |
| Responsivo mobile | ⏳ Pendente |
| Responsivo desktop | ⏳ Pendente |
| `/login` abre | ⏳ Pendente |
| `/unauthorized` abre | ⏳ Pendente |
| `/admin` protegido | ⏳ Pendente |
| Assets carregando sem erro 404 | ⏳ Pendente |
| Console sem erros críticos | ⏳ Pendente |
| Network sem falhas críticas | ⏳ Pendente |
| Supabase correto conectado | ⏳ Pendente |
| Dados do salão correto exibidos | ⏳ Pendente |

---

## 📋 CHECKLIST FUNCIONAL POR MÓDULO

### Landing page pública do salão

| Item | Status |
|---|---|
| Hero section personalizada | ⏳ Validar |
| CTA principal | ⏳ Validar |
| Layout mobile | ⏳ Validar |
| Layout desktop | ⏳ Validar |
| Formulário de contato/leads | ⏳ Validar |
| Serviços vindos do Supabase | ⏳ Validar |
| Equipe vinda do Supabase | ⏳ Validar |
| Dados de contato vindos da configuração | ⏳ Validar |
| Rodapé com nome do salão | ⏳ Validar |

### Login/Signup

| Item | Status |
|---|---|
| Login | ⏳ Validar |
| Cadastro | ⏳ Validar |
| Mensagens de erro | ⏳ Validar |
| Redirecionamento pós-login | ⏳ Validar |
| Redirecionamento pós-logout | ⏳ Validar |

### Dashboard Admin

| Item | Status |
|---|---|
| Cards principais | ⏳ Validar |
| Dados vindos do Supabase | ⏳ Validar |
| Estado de loading | ⏳ Validar |
| Estado vazio | ⏳ Validar |
| Estado de erro | ⏳ Validar |

### Agenda

| Item | Status |
|---|---|
| Listagem de agendamentos | ⏳ Validar |
| Criar agendamento | ⏳ Validar |
| Editar agendamento | ⏳ Validar |
| Cancelar agendamento | ⏳ Validar |
| Status do agendamento | ⏳ Validar |

### Clientes

| Item | Status |
|---|---|
| Listagem de clientes | ⏳ Validar |
| Criar cliente | ⏳ Validar |
| Editar cliente | ⏳ Validar |
| Excluir cliente | ⏳ Validar |
| Busca/filtro | ⏳ Validar |

### Financeiro

| Item | Status |
|---|---|
| Listagem de transações | ⏳ Validar |
| Receita | ⏳ Validar |
| Despesa | ⏳ Validar |
| Totais/resumo | ⏳ Validar |
| Filtros por período | ⏳ Validar |

### Serviços

| Item | Status |
|---|---|
| Listagem de serviços | ⏳ Validar |
| Criar serviço | ⏳ Validar |
| Editar serviço | ⏳ Validar |
| Excluir serviço | ⏳ Validar |
| Preço/duração | ⏳ Validar |

### Equipe

| Item | Status |
|---|---|
| Listagem de profissionais | ⏳ Validar |
| Criar profissional | ⏳ Validar |
| Editar profissional | ⏳ Validar |
| Excluir profissional | ⏳ Validar |
| Vínculo com serviços | ⏳ Validar |

### Configurações

| Item | Status |
|---|---|
| Dados gerais | ⏳ Validar |
| Configurações do salão | ⏳ Validar |
| Preferências | ⏳ Validar |
| Salvamento | ⏳ Validar |

### WhatsApp

| Item | Status |
|---|---|
| Configurações WhatsApp | ⏳ Validar |
| Mensagens recebidas | ⏳ Validar |
| Mensagens enviadas | ⏳ Validar |
| Webhook público | ⏳ Validar |
| Integração com IA | ⏳ Validar |

---

## 🤖 IA E MENSAGENS

Tabela relacionada:

```txt
ai_messages
```

### Pendências

| Item | Status |
|---|---|
| Validar persistência de mensagens | ⏳ Pendente |
| Validar relação com cliente/lead | ⏳ Pendente |
| Validar fluxo com WhatsApp | ⏳ Pendente |
| Definir regras de histórico | ⏳ Pendente |
| Confirmar comportamento por salão/Supabase | ⏳ Pendente |

---

## 📲 WEBHOOK WHATSAPP

Rota pública:

```txt
/api/public/whatsapp-webhook
```

### Testes necessários

| Item | Status |
|---|---|
| Rota acessível em produção | ⏳ Pendente |
| Método correto configurado | ⏳ Pendente |
| Recebimento de payload | ⏳ Pendente |
| Gravação em `whatsapp_messages` | ⏳ Pendente |
| Tratamento de erro | ⏳ Pendente |
| Segurança/validação do webhook | ⏳ Pendente |
| Confirmar webhook por salão/Supabase | ⏳ Pendente |

---

## 🧹 ORGANIZAÇÃO TÉCNICA

### Melhorias recomendadas

| Item | Prioridade | Status |
|---|---|---|
| Criar `src/lib/site.config.ts` | Alta | ⏳ Pendente |
| Ajustar `src/routes/index.tsx` para usar configuração do salão | Alta | ⏳ Pendente |
| Remover dados fixos/falsos da landing | Alta | ⏳ Pendente |
| Padronizar variáveis por salão | Alta | ⏳ Pendente |
| Corrigir warnings de rotas TanStack | Média | ⏳ Pendente |
| Revisar estrutura de `src/routes` | Média | ⏳ Pendente |
| Confirmar imports globais de CSS | Alta | ✅ OK |
| Padronizar script de deploy | Alta | ✅ OK |
| Revisar variáveis de ambiente | Alta | ⏳ Pendente |
| Validar SSR em produção | Alta | ⏳ Pendente |
| Criar checklist de QA por release | Média | ⏳ Pendente |
| Criar processo oficial de implantação de novo salão | Alta | ⏳ Pendente |

---

## 🧾 COMANDOS ÚTEIS

### Desenvolvimento

```powershell
npm run dev
```

### Instalação limpa

```powershell
npm ci
```

### Build

```powershell
npm run build
```

### Preview local

```powershell
npm run preview
```

### Limpar caches principais

```powershell
Remove-Item -Recurse -Force dist, .vite, node_modules/.vite, .netlify/v1 -ErrorAction SilentlyContinue
```

### Login Netlify

```powershell
netlify login
```

### Linkar projeto Netlify

```powershell
netlify link
```

### Deploy preview

```powershell
netlify deploy --build
```

### Deploy produção

```powershell
netlify deploy --prod --build
```

---

## ✅ CHECKLIST ATUAL RESUMIDO

| Item | Status |
|---|---|
| Instalação limpa com `npm ci` | ✅ Concluído |
| Ambiente local com `npm run dev` | ✅ Concluído |
| CSS/Tailwind carregando corretamente | ✅ Concluído |
| Build de produção | ✅ Concluído |
| Deploy Netlify produção | ✅ Concluído |
| Arquitetura por salão isolado | ✅ Definida |
| Supabase individual por salão | ✅ Estratégia definida |
| Deploy individual por salão | ✅ Estratégia definida |
| Landing por salão | ⏳ Ajustar |
| Configuração por salão | ⏳ Criar |
| Revisão dos avisos de rotas TanStack | ⏳ Pendente |
| Validação completa das rotas protegidas `/admin/*` em produção | ⏳ Pendente |
| Validação de login/signup em produção | ⏳ Pendente |
| Validação Supabase em produção | ⏳ Pendente |
| Validação webhook WhatsApp | ⏳ Pendente |
| Validação dos módulos admin | ⏳ Pendente |
| Multi-tenant | 🔜 Futuro |

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

### Fase 1 — Padronizar arquitetura por salão

1. Definir estrutura oficial de configuração por salão.
2. Criar `site.config.ts` ou estrutura `src/config/salons`.
3. Remover dados fixos/falsos da landing.
4. Fazer a landing `/` consumir dados da configuração do salão.
5. Manter serviços e equipe vindos do Supabase do salão.
6. Trocar textos genéricos por textos configuráveis.
7. Ajustar rodapé para exibir nome do salão e opcionalmente "Tecnologia por FlowStudio AI".

---

### Fase 2 — Ajustar landing pública do salão

1. Atualizar `src/routes/index.tsx`.
2. Remover número fictício `+1.200 clientes felizes` ou tornar configurável.
3. Remover depoimentos fictícios ou tornar depoimentos configuráveis.
4. Trocar telefone/endereço/Instagram fixos por dados reais/config.
5. Ajustar CTA principal para WhatsApp ou formulário.
6. Validar formulário de leads.
7. Validar chat IA na landing.

---

### Fase 3 — Validar Supabase por salão

1. Confirmar variáveis de ambiente locais.
2. Confirmar variáveis de ambiente no Netlify.
3. Validar conexão com Supabase correto em produção.
4. Testar leitura de `services`.
5. Testar leitura de `staff`.
6. Testar gravação de `leads`.
7. Testar login/signup.
8. Testar permissões por role.
9. Testar módulos administrativos.

---

### Fase 4 — Preparar template de novo salão

1. Criar checklist oficial de implantação.
2. Criar modelo de configuração para novo salão.
3. Criar script ou documentação para replicar schema no Supabase.
4. Criar dados iniciais/seeds opcionais.
5. Documentar criação de site Netlify por salão.
6. Documentar variáveis de ambiente por salão.

---

### Fase 5 — Evolução futura para multi-tenant

1. Avaliar necessidade de unificar bancos.
2. Criar tabela `businesses` ou `tenants`.
3. Adicionar `tenant_id` nas tabelas.
4. Revisar RLS por empresa.
5. Criar onboarding automatizado.
6. Criar landing institucional do SaaS FlowStudio AI separada das landings dos salões.

---

## 🧭 STATUS FINAL DESTE CICLO

| Área | Status |
|---|---|
| Ambiente local | ✅ Funcionando |
| CSS/Tailwind | ✅ Corrigido |
| Build | ✅ Funcionando |
| Netlify | ✅ Publicado |
| Arquitetura por salão isolado | ✅ Definida |
| Landing por salão | ⏳ Ajustar |
| Configuração por salão | ⏳ Criar |
| Supabase individual por salão | ✅ Estratégia definida |
| Deploy individual por salão | ✅ Estratégia definida |
| Supabase | ⏳ Validar produção |
| Auth | ⏳ Validar produção |
| Admin | ⏳ Validar módulos |
| WhatsApp | ⏳ Validar integração |
| IA | ⏳ Validar fluxo |
| Multi-tenant | 🔜 Futuro |

---

## 📝 NOTAS

- O problema principal de CSS foi resolvido com limpeza de cache e novo build.
- O deploy no Netlify funcionou após usar `netlify deploy --prod --build`.
- Manter o script `.bat` atualizado para evitar problemas semelhantes.
- Próximo foco deve ser validação funcional em produção.
- A landing pública `/` deve representar o salão implantado no deploy atual.
- O FlowStudio AI deve funcionar como núcleo comum/base técnica.
- Cada salão terá, nesta fase, Supabase, Netlify e configuração própria.
- A evolução para multi-tenant será considerada somente após validação do MVP com clientes reais.
````_
