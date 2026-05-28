@echo off
setlocal enabledelayedexpansion

REM ============================================
REM FlowStudio AI - Conversor JPG/JPEG -> WebP
REM Pasta: public\ruah\images\gallery
REM ============================================

set "TARGET_DIR=C:\FlowStudio AI\public\ruah\images\gallery"
set "QUALITY=80"

echo.
echo ============================================
echo  Convertendo imagens para WebP
echo  Pasta: %TARGET_DIR%
echo  Qualidade: %QUALITY%
echo ============================================
echo.

if not exist "%TARGET_DIR%" (
    echo [ERRO] Pasta nao encontrada: %TARGET_DIR%
    pause
    exit /b 1
)

cd /d "%TARGET_DIR%"

set /a COUNT=0
set /a FAIL=0

for %%F in (*.jpg *.jpeg) do (
    echo Convertendo: %%~nxF
    cwebp -q %QUALITY% "%%F" -o "%%~nF.webp" >nul 2>&1
    if !errorlevel! equ 0 (
        set /a COUNT+=1
        echo   [OK] %%~nF.webp
    ) else (
        set /a FAIL+=1
        echo   [FALHOU] %%~nxF
    )
)

echo.
echo ============================================
echo  Convertidos: !COUNT!
echo  Falhas:      !FAIL!
echo ============================================
echo.
pause
