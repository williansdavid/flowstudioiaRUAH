@echo off
setlocal EnableDelayedExpansion
title FlowStudio AI - Deploy Pipeline
cd /d "C:\FlowStudio AI"
color 0B
echo.
echo ============================================================
echo    FLOWSTUDIO AI - PIPELINE DE DEPLOY
echo    Projeto: RUAH Barber Lounge
echo    Deploy:  Netlify (auto-deploy via push)
echo ============================================================
echo.
if not exist "package.json" (
    color 0C
    echo [ERRO] package.json nao encontrado!
    pause
    exit /b 1
)

REM --- Detecta a branch atual automaticamente ---
for /f %%i in ('git branch --show-current') do set BRANCH=%%i
echo [INFO] Branch atual: !BRANCH!
echo.

REM --- PASSO 1: Git status ---
echo [1/6] STATUS DO GIT
echo ------------------------------------------------------------
git status --short
echo.

for /f %%i in ('git status --porcelain ^| find /c /v ""') do set CHANGES=%%i

REM Verifica commits locais nao publicados
for /f %%i in ('git log origin/!BRANCH!..HEAD --oneline 2^>nul ^| find /c /v ""') do set UNPUSHED=%%i
if "!UNPUSHED!"=="" set UNPUSHED=0

if "!CHANGES!"=="0" (
    if "!UNPUSHED!"=="0" (
        color 0E
        echo [AVISO] Nenhuma mudanca detectada e nenhum commit pendente.
        echo Nada para deployar.
        pause
        exit /b 0
    )
    echo [INFO] !UNPUSHED! commits locais aguardando push.
    set /p FORCE_PUSH="Enviar para o GitHub? [S/N]: "
    if /i not "!FORCE_PUSH!"=="S" (
        echo Operacao cancelada.
        pause
        exit /b 0
    )
    goto :PUSH_ONLY
)
echo Total de arquivos modificados: !CHANGES!
echo.
set /p CONFIRM="Continuar com o deploy? [S/N]: "
if /i not "!CONFIRM!"=="S" (
    echo Operacao cancelada.
    pause
    exit /b 0
)
echo.

REM --- PASSO 2: TypeScript ---
echo [2/6] VALIDANDO TYPESCRIPT
echo ------------------------------------------------------------
call npm run typecheck
if errorlevel 1 (
    color 0C
    echo.
    echo [ERRO] TypeScript falhou! Corrija antes de deployar.
    pause
    exit /b 1
)
echo.
echo [OK] TypeScript validado.
echo.

REM --- PASSO 3: Build ---
echo [3/6] BUILD LOCAL
echo ------------------------------------------------------------
call npm run build
if errorlevel 1 (
    color 0C
    echo.
    echo [ERRO] Build falhou! Netlify tambem falharia.
    pause
    exit /b 1
)
echo.
echo [OK] Build concluido.
echo.

REM --- PASSO 4: Mensagem de commit ---
echo [4/6] MENSAGEM DE COMMIT
echo ------------------------------------------------------------
echo.
echo Exemplos:
echo   feat: footer com icones sociais oficiais
echo   fix: corrige hover dos cards de servico
echo   style: ajusta espacamento do hero mobile
echo.
set /p COMMIT_MSG="Mensagem do commit: "
if "!COMMIT_MSG!"=="" (
    color 0C
    echo [ERRO] Mensagem nao pode estar vazia.
    pause
    exit /b 1
)
echo.

REM --- PASSO 5: Add + Commit ---
echo [5/6] COMMITANDO ALTERACOES
echo ------------------------------------------------------------
git add .
if errorlevel 1 (
    color 0C
    echo [ERRO] git add falhou.
    pause
    exit /b 1
)
git commit -m "!COMMIT_MSG!"
if errorlevel 1 (
    color 0C
    echo [ERRO] git commit falhou.
    pause
    exit /b 1
)
echo.
echo [OK] Commit criado.
echo.

:PUSH_ONLY
REM --- PASSO 6: Push ---
echo [6/6] ENVIANDO PARA O GITHUB
echo ------------------------------------------------------------
echo [INFO] Enviando branch !BRANCH! para origin/!BRANCH!...
git push origin !BRANCH!
if errorlevel 1 (
    color 0C
    echo.
    echo [ERRO] Push falhou! Verifique conexao ou conflitos.
    echo Dica: git pull origin !BRANCH! --rebase
    pause
    exit /b 1
)
color 0A
echo.
echo ============================================================
echo    [SUCESSO] DEPLOY ENVIADO!
echo ============================================================
echo.
echo    Branch:  !BRANCH!
echo    GitHub:  https://github.com/williansdavid/flowstudioiaRUAH
echo    Netlify: https://app.netlify.com/
echo.
echo    Aguarde 1-2 minutos para o Netlify processar o build.
echo ============================================================
echo.
set /p OPEN_NETLIFY="Abrir painel do Netlify? [S/N]: "
if /i "!OPEN_NETLIFY!"=="S" (
    start https://app.netlify.com/
)
echo.
pause
endlocal
exit /b 0