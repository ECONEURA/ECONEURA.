#!/usr/bin/env pwsh
# ECONEURA - Arranque completo del sistema
# Inicia backend y frontend en modo desarrollo

Write-Host "`n🚀 ECONEURA - Iniciando sistema completo..." -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Directorio raíz del proyecto
$ROOT = Split-Path -Parent $PSScriptRoot

# Verificar Node.js
Write-Host "✓ Verificando Node.js..." -ForegroundColor Green
try {
    $nodeVersion = node --version
    Write-Host "  Node.js: $nodeVersion" -ForegroundColor Gray
} catch {
    Write-Host "✗ Error: Node.js no encontrado. Instala Node.js 18+ desde nodejs.org" -ForegroundColor Red
    exit 1
}

# Verificar pnpm
Write-Host "✓ Verificando pnpm..." -ForegroundColor Green
try {
    $pnpmVersion = pnpm --version
    Write-Host "  pnpm: v$pnpmVersion" -ForegroundColor Gray
} catch {
    Write-Host "✗ Error: pnpm no encontrado. Instala con: npm install -g pnpm" -ForegroundColor Red
    exit 1
}

# Instalar dependencias si es necesario
if (-not (Test-Path "$ROOT/node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    Set-Location $ROOT
    pnpm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Error instalando dependencias" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n🎯 Iniciando servicios...`n" -ForegroundColor Cyan

# Función para matar proceso en puerto
function Stop-ProcessOnPort {
    param([int]$Port)
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($connection) {
            $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
            if ($process) {
                Stop-Process -Id $process.Id -Force
                Write-Host "  Liberado puerto $Port" -ForegroundColor Gray
            }
        }
    } catch {
        # Puerto ya libre
    }
}

# Liberar puertos si están ocupados
Stop-ProcessOnPort -Port 8081
Stop-ProcessOnPort -Port 3000

# Terminal 1: Backend Node.js
Write-Host "1️⃣  Backend API (puerto 8081)" -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    param($root)
    Set-Location $root
    $env:PORT = "8081"
    $env:NODE_ENV = "development"
    node apps/api_node/server.js
} -ArgumentList $ROOT

# Esperar a que el backend arranque
Write-Host "   Esperando backend..." -ForegroundColor Gray
Start-Sleep -Seconds 2

# Verificar que el backend responde
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8081/api/health" -UseBasicParsing -TimeoutSec 5
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   ✓ Backend OK - Modo: $($data.mode) - Agentes: $($data.agents)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Backend no responde" -ForegroundColor Red
    Stop-Job -Job $backendJob
    Remove-Job -Job $backendJob
    exit 1
}

# Terminal 2: Frontend React
Write-Host "`n2️⃣  Frontend Web (puerto 3000)" -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    param($root)
    Set-Location "$root/apps/web"
    pnpm dev
} -ArgumentList $ROOT

# Esperar a que el frontend arranque
Write-Host "   Esperando frontend..." -ForegroundColor Gray
Start-Sleep -Seconds 3

Write-Host "`n✅ Sistema iniciado correctamente`n" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📡 Backend:  http://127.0.0.1:8081" -ForegroundColor White
Write-Host "🎨 Frontend: http://127.0.0.1:3000" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "📋 Comandos útiles:" -ForegroundColor Yellow
Write-Host "  - Ver logs backend:  Get-Job -Id $($backendJob.Id) | Receive-Job" -ForegroundColor Gray
Write-Host "  - Ver logs frontend: Get-Job -Id $($frontendJob.Id) | Receive-Job" -ForegroundColor Gray
Write-Host "  - Detener todo:      Stop-Job -Id $($backendJob.Id),$($frontendJob.Id); Remove-Job -Id $($backendJob.Id),$($frontendJob.Id)`n" -ForegroundColor Gray

Write-Host "🔍 Test rápido:" -ForegroundColor Yellow
Write-Host "  curl http://127.0.0.1:8081/api/health`n" -ForegroundColor Gray

Write-Host "Presiona Ctrl+C para detener todos los servicios" -ForegroundColor Yellow

# Mantener script vivo y mostrar logs
try {
    while ($true) {
        Start-Sleep -Seconds 1
        
        # Verificar que los jobs siguen vivos
        if ($backendJob.State -ne 'Running') {
            Write-Host "`n✗ Backend detenido inesperadamente" -ForegroundColor Red
            break
        }
        if ($frontendJob.State -ne 'Running') {
            Write-Host "`n✗ Frontend detenido inesperadamente" -ForegroundColor Red
            break
        }
    }
} finally {
    Write-Host "`n👋 Deteniendo servicios..." -ForegroundColor Yellow
    Stop-Job -Job $backendJob,$frontendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $backendJob,$frontendJob -ErrorAction SilentlyContinue
    Write-Host "✅ Sistema detenido`n" -ForegroundColor Green
}
