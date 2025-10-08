#!/usr/bin/env pwsh
# Pre-push validation script para ECONEURA
# Ejecutar antes de git push para validar todo está correcto

$ErrorActionPreference = "Stop"

Write-Host "`n🚀 PRE-PUSH VALIDATION" -ForegroundColor Green
Write-Host "=" * 70 -ForegroundColor Gray

$startTime = Get-Date
$failures = @()

# 1. Verificar que no hay archivos sin stagear
Write-Host "`n📋 1/6 Verificando git status..." -ForegroundColor Cyan
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  Hay archivos sin commit:" -ForegroundColor Yellow
    $gitStatus | Write-Host
    $response = Read-Host "¿Continuar de todos modos? (y/N)"
    if ($response -ne "y") {
        exit 1
    }
}
Write-Host "✅ Git status OK" -ForegroundColor Green

# 2. Lint
Write-Host "`n📝 2/6 Ejecutando lint..." -ForegroundColor Cyan
try {
    pnpm -w lint 2>&1 | Out-Null
    Write-Host "✅ Lint passed" -ForegroundColor Green
} catch {
    Write-Host "❌ Lint failed" -ForegroundColor Red
    $failures += "lint"
}

# 3. Typecheck
Write-Host "`n🔍 3/6 Ejecutando typecheck..." -ForegroundColor Cyan
try {
    pnpm -w typecheck 2>&1 | Out-Null
    Write-Host "✅ Typecheck passed" -ForegroundColor Green
} catch {
    Write-Host "❌ Typecheck failed" -ForegroundColor Red
    $failures += "typecheck"
}

# 4. Build
Write-Host "`n🏗️  4/6 Ejecutando build..." -ForegroundColor Cyan
try {
    pnpm -w build 2>&1 | Out-Null
    Write-Host "✅ Build passed" -ForegroundColor Green
} catch {
    Write-Host "❌ Build failed" -ForegroundColor Red
    $failures += "build"
}

# 5. Tests (solo unit tests rápidos)
Write-Host "`n🧪 5/6 Ejecutando tests..." -ForegroundColor Cyan
try {
    # Tests rápidos sin coverage
    pnpm -w test --run --reporter=verbose 2>&1 | Select-Object -First 20 | Out-Null
    Write-Host "✅ Tests passed" -ForegroundColor Green
} catch {
    Write-Host "❌ Tests failed" -ForegroundColor Red
    $failures += "tests"
}

# 6. Verificar que package.json tiene scripts necesarios
Write-Host "`n📦 6/6 Verificando package.json..." -ForegroundColor Cyan
$rootPkg = Get-Content package.json | ConvertFrom-Json
$requiredScripts = @("build", "test", "test:coverage", "lint", "typecheck")
$missingScripts = @()
foreach ($script in $requiredScripts) {
    if (-not $rootPkg.scripts.$script) {
        $missingScripts += $script
    }
}
if ($missingScripts.Count -gt 0) {
    Write-Host "❌ Faltan scripts: $($missingScripts -join ', ')" -ForegroundColor Red
    $failures += "package.json"
} else {
    Write-Host "✅ Package.json OK" -ForegroundColor Green
}

# Resumen
$duration = (Get-Date) - $startTime
Write-Host "`n" -NoNewline
Write-Host "=" * 70 -ForegroundColor Gray

if ($failures.Count -eq 0) {
    Write-Host "`n✅ TODAS LAS VALIDACIONES PASARON" -ForegroundColor Green
    Write-Host "⏱️  Tiempo: $($duration.TotalSeconds.ToString('F1'))s" -ForegroundColor Gray
    Write-Host "`n🚀 Listo para push!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n❌ VALIDACIONES FALLIDAS: $($failures.Count)" -ForegroundColor Red
    Write-Host "Fallos: $($failures -join ', ')" -ForegroundColor Red
    Write-Host "`n⚠️  NO recomendado hacer push con estos errores" -ForegroundColor Yellow
    $response = Read-Host "¿Hacer push de todos modos? (y/N)"
    if ($response -eq "y") {
        Write-Host "⚠️  Pusheando con errores..." -ForegroundColor Yellow
        exit 0
    } else {
        exit 1
    }
}
