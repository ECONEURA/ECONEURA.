# 🔄 CONSOLIDACIÓN AUTOMÁTICA MONOREPO ECONEURA
# Script PowerShell para merge inteligente de repositorios

param(
    [switch]$DryRun = $false,
    [switch]$SkipBackup = $false
)

$ErrorActionPreference = "Stop"
$BASE_DIR = "C:\Users\Usuario\OneDrive\Documents\GitHub"
$TARGET = "ECONEURA-PUNTO"
$SOURCE_PRIMARY = "ECONEURA-"
$SOURCE_CICD = "Econeura"

Write-Host "===========================================  " -ForegroundColor Cyan
Write-Host "  CONSOLIDACIÓN MONOREPO ECONEURA          " -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
Set-Location "$BASE_DIR\$TARGET"
Write-Host "✓ Directorio base: $TARGET" -ForegroundColor Green

# 1. BACKUP (si no se omite)
if (-not $SkipBackup -and -not $DryRun) {
    Write-Host "`n[1/10] Creando backup..." -ForegroundColor Cyan
    $backupPath = "$BASE_DIR\$TARGET-BACKUP-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item -Path "$BASE_DIR\$TARGET" -Destination $backupPath -Recurse -Force
    Write-Host "✓ Backup creado en: $backupPath" -ForegroundColor Green
} else {
    Write-Host "`n[1/10] Backup omitido (DryRun o SkipBackup)" -ForegroundColor Yellow
}

# 2. VERIFICAR CAMBIOS LOCALES
Write-Host "`n[2/10] Verificando cambios locales..." -ForegroundColor Cyan
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠  Hay cambios no commiteados:" -ForegroundColor Yellow
    git status --short | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    if (-not $DryRun) {
        $response = Read-Host "¿Continuar de todas formas? (s/N)"
        if ($response -ne 's') {
            Write-Host "❌ Operación cancelada" -ForegroundColor Red
            exit 1
        }
    }
} else {
    Write-Host "✓ Working tree limpio" -ForegroundColor Green
}

# 3. MERGE SERVICIOS FASTAPI
Write-Host "`n[3/10] Actualizando servicios FastAPI..." -ForegroundColor Cyan
$neuraServices = @('analytics', 'cdo', 'cfo', 'chro', 'ciso', 'cmo', 'cto', 'legal', 'reception', 'research', 'support')

foreach ($service in $neuraServices) {
    $sourcePath = "$BASE_DIR\$SOURCE_PRIMARY\services\neuras\$service"
    $targetPath = "$BASE_DIR\$TARGET\services\neuras\$service"
    
    if (Test-Path $sourcePath) {
        if (Test-Path $targetPath) {
            # Comparar fechas de modificación
            $sourceDate = (Get-ChildItem $sourcePath -Recurse -File | Sort-Object LastWriteTime -Descending | Select-Object -First 1).LastWriteTime
            $targetDate = (Get-ChildItem $targetPath -Recurse -File | Sort-Object LastWriteTime -Descending | Select-Object -First 1).LastWriteTime
            
            if ($sourceDate -gt $targetDate) {
                Write-Host "  → Actualizando $service (más reciente)" -ForegroundColor Yellow
                if (-not $DryRun) {
                    robocopy $sourcePath $targetPath /E /XO /XD __pycache__ .pytest_cache /NFL /NDL /NJH /NJS | Out-Null
                }
            } else {
                Write-Host "  ✓ $service ya está actualizado" -ForegroundColor Green
            }
        } else {
            Write-Host "  + Copiando $service (nuevo)" -ForegroundColor Cyan
            if (-not $DryRun) {
                Copy-Item -Path $sourcePath -Destination $targetPath -Recurse -Force
            }
        }
    }
}

# 4. MERGE DOCUMENTACIÓN
Write-Host "`n[4/10] Actualizando documentación..." -ForegroundColor Cyan
$docsToMerge = @('FASE5*.md', 'ARCHITECTURE*.md', 'EXPRESS*.md', 'PHASE*.md', 'PROJECT*.md')

foreach ($pattern in $docsToMerge) {
    $files = Get-ChildItem "$BASE_DIR\$SOURCE_PRIMARY\docs" -Filter $pattern -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        $targetFile = "$BASE_DIR\$TARGET\docs\$($file.Name)"
        if (-not (Test-Path $targetFile) -or $file.LastWriteTime -gt (Get-Item $targetFile -ErrorAction SilentlyContinue).LastWriteTime) {
            Write-Host "  → Copiando $($file.Name)" -ForegroundColor Yellow
            if (-not $DryRun) {
                Copy-Item $file.FullName $targetFile -Force
            }
        } else {
            Write-Host "  ✓ $($file.Name) actualizado" -ForegroundColor Green
        }
    }
}

# 5. MERGE CI/CD WORKFLOWS
Write-Host "`n[5/10] Actualizando workflows CI/CD..." -ForegroundColor Cyan
$workflowsPath = "$BASE_DIR\$SOURCE_CICD\.github\workflows"
if (Test-Path $workflowsPath) {
    $workflows = Get-ChildItem $workflowsPath -Filter "*.yml"
    foreach ($workflow in $workflows) {
        $targetWorkflow = "$BASE_DIR\$TARGET\.github\workflows\$($workflow.Name)"
        if (-not (Test-Path $targetWorkflow)) {
            Write-Host "  + Copiando workflow $($workflow.Name)" -ForegroundColor Cyan
            if (-not $DryRun) {
                Copy-Item $workflow.FullName $targetWorkflow -Force
            }
        } else {
            Write-Host "  ✓ Workflow $($workflow.Name) existe" -ForegroundColor Green
        }
    }
} else {
    Write-Host "  ⚠  Workflows source no encontrado" -ForegroundColor Yellow
}

# 6. MERGE DEVCONTAINER
Write-Host "`n[6/10] Actualizando devcontainer..." -ForegroundColor Cyan
$devcontainerSource = "$BASE_DIR\$SOURCE_CICD\.devcontainer"
if (Test-Path $devcontainerSource) {
    $devcontainerTarget = "$BASE_DIR\$TARGET\.devcontainer"
    if (-not (Test-Path $devcontainerTarget)) {
        Write-Host "  + Copiando .devcontainer completo" -ForegroundColor Cyan
        if (-not $DryRun) {
            Copy-Item $devcontainerSource $devcontainerTarget -Recurse -Force
        }
    } else {
        Write-Host "  ✓ .devcontainer existe" -ForegroundColor Green
    }
} else {
    Write-Host "  ⚠  Devcontainer source no encontrado" -ForegroundColor Yellow
}

# 7. ACTUALIZAR PACKAGE.JSON (merge dependencies)
Write-Host "`n[7/10] Analizando package.json..." -ForegroundColor Cyan
$targetPkg = Get-Content "$BASE_DIR\$TARGET\package.json" -Raw | ConvertFrom-Json
$sourcePkg = Get-Content "$BASE_DIR\$SOURCE_PRIMARY\package.json" -Raw -ErrorAction SilentlyContinue | ConvertFrom-Json

if ($sourcePkg) {
    Write-Host "  → Comparando dependencies..." -ForegroundColor Yellow
    # Aquí podrías implementar merge de dependencies si es necesario
    Write-Host "  ℹ  Verificación manual recomendada" -ForegroundColor Gray
} else {
    Write-Host "  ✓ Package.json base OK" -ForegroundColor Green
}

# 8. COPIAR ARCHIVOS ÚNICOS DE SOURCE
Write-Host "`n[8/10] Copiando archivos únicos..." -ForegroundColor Cyan

# Scripts útiles
$scriptsToCheck = @('express-velocity.sh', 'express-dev-start.sh', 'express-status.sh', 'start-dev.sh')
foreach ($script in $scriptsToCheck) {
    $sourcePath = "$BASE_DIR\$SOURCE_PRIMARY\scripts\$script"
    $targetPath = "$BASE_DIR\$TARGET\scripts\$script"
    
    if ((Test-Path $sourcePath) -and -not (Test-Path $targetPath)) {
        Write-Host "  + Copiando script $script" -ForegroundColor Cyan
        if (-not $DryRun) {
            Copy-Item $sourcePath $targetPath -Force
        }
    }
}

# Archivos root útiles
$rootFiles = @('renovate.json', '.lychee.toml', '.spectral.yml')
foreach ($file in $rootFiles) {
    $sourcePath = "$BASE_DIR\$SOURCE_PRIMARY\$file"
    $targetPath = "$BASE_DIR\$TARGET\$file"
    
    if ((Test-Path $sourcePath) -and -not (Test-Path $targetPath)) {
        Write-Host "  + Copiando $file" -ForegroundColor Cyan
        if (-not $DryRun) {
            Copy-Item $sourcePath $targetPath -Force
        }
    }
}

# 9. INSTALAR DEPENDENCIAS
Write-Host "`n[9/10] Instalando dependencias..." -ForegroundColor Cyan
if (-not $DryRun) {
    Write-Host "  → Ejecutando pnpm install..." -ForegroundColor Yellow
    pnpm install 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Dependencias instaladas" -ForegroundColor Green
    } else {
        Write-Host "  ⚠  Algunos warnings en instalación" -ForegroundColor Yellow
    }
} else {
    Write-Host "  (DryRun: pnpm install omitido)" -ForegroundColor Gray
}

# 10. RESUMEN Y SIGUIENTES PASOS
Write-Host "`n[10/10] Consolidación completada" -ForegroundColor Cyan
Write-Host ""
Write-Host "===========================================  " -ForegroundColor Green
Write-Host "  ✅ MERGE COMPLETADO                      " -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""

Write-Host "📋 SIGUIENTES PASOS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Validar compilación:" -ForegroundColor White
Write-Host "   pnpm -w lint" -ForegroundColor Gray
Write-Host "   pnpm -w typecheck" -ForegroundColor Gray
Write-Host "   pnpm -w test" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Probar servicios:" -ForegroundColor White
Write-Host "   .\START_COCKPIT.ps1" -ForegroundColor Gray
Write-Host "   .\START_BACKEND.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Revisar cambios:" -ForegroundColor White
Write-Host "   git status" -ForegroundColor Gray
Write-Host "   git diff" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Commit consolidación:" -ForegroundColor White
Write-Host "   git add -A" -ForegroundColor Gray
Write-Host "   git commit -m 'feat: consolidate monorepo'" -ForegroundColor Gray
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host ""

if ($DryRun) {
    Write-Host "ℹ️  Este fue un DRY RUN - ningún cambio aplicado" -ForegroundColor Yellow
    Write-Host "   Ejecuta sin -DryRun para aplicar cambios" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📖 Ver detalles en: CONSOLIDATION_PLAN.md" -ForegroundColor Cyan
Write-Host ""
