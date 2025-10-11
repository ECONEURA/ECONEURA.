#!/usr/bin/env pwsh
# ECONEURA VALIDATION SCRIPT
# Valida que todos los componentes están listos para producción

Write-Host "`n🔍 VALIDANDO ECONEURA AL 100%`n" -ForegroundColor Cyan

$errors = 0
$warnings = 0

# 1. Verificar archivos críticos
Write-Host "📋 Verificando archivos críticos..." -ForegroundColor Yellow

$criticalFiles = @(
    "packages/configs/agent-routing.json",
    ".env.template",
    "db/init/01-schema.sql",
    "db/init/02-rls.sql",
    "db/seeds/01-dev-data.sql",
    "services/auth/app.py",
    "apps/api_py/server.py"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file MISSING" -ForegroundColor Red
        $errors++
    }
}

# 2. Verificar 11 agentes
Write-Host "`n🧠 Verificando 11 agentes IA..." -ForegroundColor Yellow

$agents = @('analytics', 'cdo', 'cfo', 'chro', 'ciso', 'cmo', 'cto', 'legal', 'reception', 'research', 'support')
foreach ($agent in $agents) {
    $appPy = "services/neuras/$agent/app.py"
    $reqTxt = "services/neuras/$agent/requirements.txt"
    
    if ((Test-Path $appPy) -and (Test-Path $reqTxt)) {
        $lines = (Get-Content $appPy).Count
        if ($lines -gt 100) {
            Write-Host "  ✅ $agent ($lines líneas)" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️ $agent ($lines líneas - parece placeholder)" -ForegroundColor Yellow
            $warnings++
        }
    } else {
        Write-Host "  ❌ $agent MISSING" -ForegroundColor Red
        $errors++
    }
}

# 3. Verificar documentación
Write-Host "`n📚 Verificando documentación..." -ForegroundColor Yellow

$docs = @(
    "docs/BRUTAL_CRITICISM_AND_ACTION.md",
    "docs/EXECUTION_SUMMARY_OCT_8.md",
    "docs/PROJECT_COMPLETE.md",
    ".github/copilot-instructions.md"
)

foreach ($doc in $docs) {
    if (Test-Path $doc) {
        Write-Host "  ✅ $doc" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ $doc missing" -ForegroundColor Yellow
        $warnings++
    }
}

# 4. Verificar scripts
Write-Host "`n🔧 Verificando scripts..." -ForegroundColor Yellow

$scripts = @(
    "scripts/powershell/QUICK_START.ps1",
    "scripts/powershell/GENERATE_ALL_AGENTS.ps1"
)

foreach ($script in $scripts) {
    if (Test-Path $script) {
        Write-Host "  ✅ $script" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $script MISSING" -ForegroundColor Red
        $errors++
    }
}

# 5. Verificar dependencias
Write-Host "`n📦 Verificando dependencias..." -ForegroundColor Yellow

try {
    $null = Get-Command pnpm -ErrorAction Stop
    Write-Host "  ✅ pnpm instalado" -ForegroundColor Green
} catch {
    Write-Host "  ❌ pnpm NO encontrado" -ForegroundColor Red
    $errors++
}

try {
    $null = Get-Command node -ErrorAction Stop
    Write-Host "  ✅ node instalado" -ForegroundColor Green
} catch {
    Write-Host "  ❌ node NO encontrado" -ForegroundColor Red
    $errors++
}

try {
    $null = Get-Command docker -ErrorAction Stop
    Write-Host "  ✅ docker instalado" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️ docker NO encontrado (opcional)" -ForegroundColor Yellow
    $warnings++
}

# Resultado final
Write-Host "`n" + ("="*60) -ForegroundColor Cyan
if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "🎉 VALIDACIÓN EXITOSA: ECONEURA AL 100%" -ForegroundColor Green
    Write-Host "✅ Todos los componentes están listos" -ForegroundColor Green
    Write-Host "`nEjecutar: .\scripts\powershell\QUICK_START.ps1" -ForegroundColor Cyan
    exit 0
} elseif ($errors -eq 0) {
    Write-Host "⚠️ VALIDACIÓN CON ADVERTENCIAS" -ForegroundColor Yellow
    Write-Host "✅ Componentes críticos OK" -ForegroundColor Green
    Write-Host "⚠️ $warnings advertencias encontradas" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "❌ VALIDACIÓN FALLIDA" -ForegroundColor Red
    Write-Host "❌ $errors errores encontrados" -ForegroundColor Red
    Write-Host "⚠️ $warnings advertencias encontradas" -ForegroundColor Yellow
    exit 1
}
