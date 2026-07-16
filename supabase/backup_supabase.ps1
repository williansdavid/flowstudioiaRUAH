$ErrorActionPreference = "Stop"
[Environment]::CurrentDirectory = (Get-Location).Path
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding   = [System.Text.Encoding]::UTF8
$OutputEncoding            = [System.Text.Encoding]::UTF8
chcp 65001 > $null

# ╔══════════════════════════════════════════════════════════════╗
# ║  FLOWSTUDIO AI — BACKUP COMPLETO DO SUPABASE (pg_dump)     ║
# ║  Versão: 1.1                                               ║
# ║  Uso:   Backup completo de UM projeto Supabase (1 studio)  ║
# ║         Gera pasta com timestamp e separa por esquemas      ║
# ╚══════════════════════════════════════════════════════════════╝

# ──────────────────────────────────────────────────
# CONFIGURAÇÃO — PREENCHER AQUI
# ──────────────────────────────────────────────────
$STUDIO_SLUG          = "ruah"
$SUPABASE_PROJECT_REF = "oizhhijrswsiowbybqvj"
$SUPABASE_HOST        = "db.$SUPABASE_PROJECT_REF.supabase.co"   # ← SEM https://
$SUPABASE_PORT        = 5432
$SUPABASE_DB          = "postgres"
$SUPABASE_USER        = "postgres"
$SUPABASE_PASSWORD    = "Suporte.n@n0"     # ← a senha real do banco

# ──────────────────────────────────────────────────
# VALIDAÇÃO INICIAL
# ──────────────────────────────────────────────────
# Verifica se pg_dump existe
if (-not (Get-Command "pg_dump" -ErrorAction SilentlyContinue)) {
    Write-Host "[FATAL] pg_dump não encontrado no PATH." -ForegroundColor Red
    Write-Host "Instale o PostgreSQL (client tools) ou adicione ao PATH:" -ForegroundColor Yellow
    Write-Host "  https://www.postgresql.org/download/" -ForegroundColor Yellow
    exit 1
}

# ──────────────────────────────────────────────────
# DIRETÓRIO DE SAÍDA
# ──────────────────────────────────────────────────
$DATAHORA   = Get-Date -Format "yyyy-MM-dd_HHmmss"
$OUTPUT_DIR = Join-Path (Get-Location) "backup-supabase_${STUDIO_SLUG}_${DATAHORA}"
New-Item -ItemType Directory -Path $OUTPUT_DIR -Force | Out-Null

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Backup Supabase - FlowStudio AI"              -ForegroundColor Cyan
Write-Host "  Studio: $STUDIO_SLUG"                         -ForegroundColor Cyan
Write-Host "  Destino: $OUTPUT_DIR"                         -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# ──────────────────────────────────────────────────
# FUNÇÃO AUXILIAR — executa pg_dump e trata erro
# ──────────────────────────────────────────────────
function Invoke-PgDump {
    param([string]$Label, [string]$File, [string]$ExtraArgs)
    Write-Host "  → $Label" -ForegroundColor Gray
    $env:PGPASSWORD = $SUPABASE_PASSWORD
    $output = pg_dump `
        -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER -d $SUPABASE_DB `
        --no-owner --no-acl --no-comments `
        --format=plain --file=$File `
        $ExtraArgs `
        --verbose 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✓ $Label" -ForegroundColor Green
        return $true
    } else {
        Write-Host "    [ERRO] $Label — código $LASTEXITCODE" -ForegroundColor Red
        return $false
    }
}

# ──────────────────────────────────────────────────
# 1) DUMP COMPLETO (custom formatado)
# ──────────────────────────────────────────────────
Write-Host "[1/3] Dump completo do banco..." -ForegroundColor Yellow
$DUMP_FILE = Join-Path $OUTPUT_DIR "_full_dump_${STUDIO_SLUG}.sql"
Invoke-PgDump -Label "Full dump" -File $DUMP_FILE -ExtraArgs ""

# ──────────────────────────────────────────────────
# 2) ESQUEMAS INDIVIDUAIS (camadas separadas)
# ──────────────────────────────────────────────────
Write-Host "[2/3] Extraindo esquemas individuais..." -ForegroundColor Yellow
$SCHEMAS = @("public")
$SCHEMA_DIR = Join-Path $OUTPUT_DIR "camadas"
New-Item -ItemType Directory -Path $SCHEMA_DIR -Force | Out-Null
foreach ($schema in $SCHEMAS) {
    $SCHEMA_FILE = Join-Path $SCHEMA_DIR "schema_${schema}.sql"
    Invoke-PgDump -Label "Esquema $schema" -File $SCHEMA_FILE -ExtraArgs "--schema=$schema"
}

# ──────────────────────────────────────────────────
# 3) TABELAS ESPECÍFICAS (dados críticos separados)
# ──────────────────────────────────────────────────
Write-Host "[3/3] Extraindo tabelas críticas separadas..." -ForegroundColor Yellow
$TABLES_DIR = Join-Path $OUTPUT_DIR "tabelas_criticas"
New-Item -ItemType Directory -Path $TABLES_DIR -Force | Out-Null

$TABLES = @(
    "profiles"
    "clients"
    "staff"
    "services"
    "appointments"
    "finance_transactions"
    "leads"
    "staff_time_off"
    "products"
    "sales"
    "sale_items"
    "sale_payments"
    "client_events"
    "crm_logs"
)

foreach ($table in $TABLES) {
    $TABLE_FILE = Join-Path $TABLES_DIR "dados_${table}.sql"
    Invoke-PgDump -Label "Tabela $table" -File $TABLE_FILE -ExtraArgs "--table=""public.$table"" --data-only --column-inserts"
}

# ──────────────────────────────────────────────────
# LOG DE RESUMO
# ──────────────────────────────────────────────────
$LOG_FILE = Join-Path $OUTPUT_DIR "_resumo_backup.txt"
@"
RESUMO DO BACKUP
━━━━━━━━━━━━━━━━
Studio:       $STUDIO_SLUG
Data/Hora:    $DATAHORA
Supabase Ref: $SUPABASE_PROJECT_REF
Host:         $SUPABASE_HOST
Banco:        $SUPABASE_DB

Arquivos gerados:
  Full dump:   _full_dump_${STUDIO_SLUG}.sql
  Camadas:     camadas/schema_*.sql
  Tabelas:     tabelas_criticas/dados_*.sql

Comandos de restore (exemplos):
  psql -h SEU_HOST -U postgres -d postgres -f _full_dump_${STUDIO_SLUG}.sql
  psql -h SEU_HOST -U postgres -d postgres -f camadas/schema_public.sql
  psql -h SEU_HOST -U postgres -d postgres -f tabelas_criticas/dados_profiles.sql
"@ | Out-File -FilePath $LOG_FILE -Encoding UTF8

# ──────────────────────────────────────────────────
# LIMPEZA E FINALIZAÇÃO
# ──────────────────────────────────────────────────
Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  BACKUP CONCLUÍDO!" -ForegroundColor Green
Write-Host "  Pasta: $OUTPUT_DIR" -ForegroundColor Green
Write-Host "  Resumo: $LOG_FILE" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan