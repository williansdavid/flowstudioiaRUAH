[CmdletBinding()]
param(
    [Parameter(Position=0)]
    [string[]]$Path,

    [Parameter()]
    [string]$Root = ".\src",

    [Parameter()]
    [string[]]$Include = @("*.ts","*.tsx","*.js","*.jsx","*.json","*.md","*.css")
)

function Test-FileBytes {
    param([string]$FilePath)

    $resolved = Resolve-Path -LiteralPath $FilePath -ErrorAction SilentlyContinue
    if (-not $resolved) {
        Write-Host "  [SKIP] Arquivo nao encontrado: $FilePath" -ForegroundColor DarkYellow
        return
    }

    $full = $resolved.Path
    Write-Host ""
    Write-Host "===== $full =====" -ForegroundColor Cyan

    try {
        $bytes = [System.IO.File]::ReadAllBytes($full)
    } catch {
        Write-Host "  [ERRO] $($_.Exception.Message)" -ForegroundColor Red
        return
    }

    $total      = $bytes.Length
    $utf8Seq    = 0
    $cp1252     = 0
    $mojibake   = 0
    $hasBom     = $false

    if ($total -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
        $hasBom = $true
    }

    for ($i = 0; $i -lt $total; $i++) {
        $b = $bytes[$i]

        # Mojibake classico: C3 83, C3 82, C2 (sequencias UTF-8 duplamente codificadas)
        if ($b -eq 0xC3 -and ($i + 1) -lt $total) {
            $next = $bytes[$i + 1]
            if ($next -eq 0x83 -or $next -eq 0x82 -or $next -eq 0xA2) {
                # C3 83 = A com til invertido (Ã), C3 82 = A circunflexo (Â)
                $mojibake++
            }
            $utf8Seq++
            $i++
            continue
        }

        if ($b -ge 0xC2 -and $b -le 0xDF -and ($i + 1) -lt $total) {
            $utf8Seq++
            $i++
            continue
        }

        if ($b -ge 0xE0 -and $b -le 0xEF -and ($i + 2) -lt $total) {
            $utf8Seq++
            $i += 2
            continue
        }

        if ($b -ge 0xF0 -and $b -le 0xF4 -and ($i + 3) -lt $total) {
            $utf8Seq++
            $i += 3
            continue
        }

        if ($b -ge 0x80 -and $b -le 0xFF) {
            $cp1252++
        }
    }

    Write-Host "  Total bytes        : $total"
    Write-Host "  BOM UTF-8          : $hasBom"
    Write-Host "  Sequencias UTF-8   : $utf8Seq"
    Write-Host "  Bytes CP1252 soltos: $cp1252"
    Write-Host "  Mojibake suspeito  : $mojibake"

    if ($mojibake -gt 0) {
        Write-Host "  VEREDICTO: MOJIBAKE detectado!" -ForegroundColor Red
    } elseif ($cp1252 -gt 0) {
        Write-Host "  VEREDICTO: Bytes CP1252 (Windows-1252) presentes" -ForegroundColor Yellow
    } elseif ($utf8Seq -gt 0) {
        Write-Host "  VEREDICTO: UTF-8 limpo - OK" -ForegroundColor Green
    } else {
        Write-Host "  VEREDICTO: ASCII puro - OK" -ForegroundColor Green
    }
}

# ---- Modo 1: arquivos especificos via -Path ----
if ($Path -and $Path.Count -gt 0) {
    foreach ($p in $Path) {
        Test-FileBytes -FilePath $p
    }
    return
}

# ---- Modo 2: scan recursivo ----
if (-not (Test-Path $Root)) {
    Write-Host "Diretorio raiz nao encontrado: $Root" -ForegroundColor Red
    return
}

Write-Host "Escaneando '$Root' recursivamente..." -ForegroundColor Cyan
$files = Get-ChildItem -Path $Root -Recurse -File -Include $Include
Write-Host "Total de arquivos: $($files.Count)" -ForegroundColor Gray

foreach ($f in $files) {
    Test-FileBytes -FilePath $f.FullName
}