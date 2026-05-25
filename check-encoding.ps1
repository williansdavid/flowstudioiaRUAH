function Get-FileEncoding {
    param([string]$Path)
    $bytes = [System.IO.File]::ReadAllBytes($Path)
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) { return "UTF-8 with BOM" }
    if ($bytes.Length -ge 2 -and $bytes[0] -eq 0xFF -and $bytes[1] -eq 0xFE) { return "UTF-16 LE" }
    $content = [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
    if ($content -match "A-tilde|Atilde|A-circ") { return "test" }
    # Detecta sequencias tipicas de UTF-8 mal interpretado (mojibake)
    $mojibakePattern = [char]0x00C3  # caractere A-til, primeiro byte de mojibake comum
    $eurosignPattern = [char]0x00E2  # primeiro byte de travessao corrompido
    $copyrightPattern = [char]0x00C2 # primeiro byte de copyright corrompido
    if ($content.Contains($mojibakePattern) -or $content.Contains($eurosignPattern) -or $content.Contains($copyrightPattern)) {
        return "UTF-8 CORROMPIDO (mojibake CP1252)"
    }
    return "UTF-8 OK ou ASCII"
}
$arquivos = @(
    ".\src\config\studio.config.ts",
    ".\src\config\studio.types.ts",
    ".\src\config\studio.helpers.ts",
    ".\src\config\studio.sections.ts",
    ".\src\config\index.ts",
    ".\src\routes\__root.tsx"
)
foreach ($a in $arquivos) {
    $enc = Get-FileEncoding -Path $a
    Write-Host ("{0,-45} -> {1}" -f $a, $enc) -ForegroundColor Yellow
}
