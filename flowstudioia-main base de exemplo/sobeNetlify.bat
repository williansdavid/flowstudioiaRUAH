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

echo [3/5] Verificando build local...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Build falhou! Corrija os erros acima antes de continuar.
    pause
    exit /b 1
)
echo [OK] Build local gerado com sucesso.
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
