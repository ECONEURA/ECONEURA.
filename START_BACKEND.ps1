#!/usr/bin/env pwsh
# START_BACKEND.ps1 - Arranca el backend Node.js del Gateway ECONEURA

Write-Host "🚀 ARRANCANDO BACKEND ECONEURA..." -ForegroundColor Cyan

# Verificar directorio
$backendDir = "C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-PUNTO\apps\api_node"
if (!(Test-Path $backendDir)) {
    Write-Host "❌ ERROR: Directorio no encontrado: $backendDir" -ForegroundColor Red
    exit 1
}

# Ir al directorio
Set-Location $backendDir

# Verificar que server-simple.js existe
if (!(Test-Path "server-simple.js")) {
    Write-Host "❌ ERROR: server-simple.js no encontrado" -ForegroundColor Red
    exit 1
}

# Verificar node_modules
if (!(Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules no encontrado, instalando..." -ForegroundColor Yellow
    npm install
}

# Verificar .env
if (!(Test-Path ".env")) {
    Write-Host "❌ ERROR: .env no encontrado" -ForegroundColor Red
    Write-Host "   Copia .env.example a .env y configura las variables" -ForegroundColor Yellow
    exit 1
}

# Verificar puerto 8080
$portTest = Test-NetConnection -ComputerName localhost -Port 8080 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($portTest) {
    Write-Host "⚠️  Puerto 8080 ya está en uso" -ForegroundColor Yellow
    $pid = (Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue).OwningProcess
    if ($pid) {
        Write-Host "   Proceso usando puerto 8080: PID $pid" -ForegroundColor Yellow
        $killIt = Read-Host "¿Detener proceso y continuar? (S/N)"
        if ($killIt -eq "S" -or $killIt -eq "s") {
            Stop-Process -Id $pid -Force
            Start-Sleep -Seconds 2
        } else {
            Write-Host "❌ Abortado por usuario" -ForegroundColor Red
            exit 1
        }
    }
}

# Arrancar backend
Write-Host "✅ Iniciando backend en http://localhost:8080..." -ForegroundColor Green
Write-Host "   Presiona Ctrl+C para detener" -ForegroundColor Gray
Write-Host ""

node server-simple.js
