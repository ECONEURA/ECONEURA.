#!/usr/bin/env pwsh
# START_COCKPIT.ps1 - Arranca Vite y abre Cockpit (navegador + VS Code Simple Browser)
# Uso: .\START_COCKPIT.ps1

Write-Host "🚀 ARRANCANDO COCKPIT ECONEURA..." -ForegroundColor Cyan

# 1. Verificar si Vite ya está corriendo
$viteRunning = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($viteRunning) {
    Write-Host "✅ Vite ya está corriendo en puerto 3000" -ForegroundColor Green
} else {
    Write-Host "⚡ Arrancando Vite dev server..." -ForegroundColor Yellow
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\apps\web'; pnpm dev" -WindowStyle Minimized
    Write-Host "⏳ Esperando 3 segundos para que Vite arranque..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
}

# 2. Verificar que Vite responde
$maxRetries = 5
$retry = 0
while ($retry -lt $maxRetries) {
    $viteCheck = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -WarningAction SilentlyContinue
    if ($viteCheck) {
        Write-Host "✅ Vite server respondiendo en http://localhost:3000" -ForegroundColor Green
        break
    }
    $retry++
    Write-Host "⏳ Reintento $retry/$maxRetries..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
}

if ($retry -eq $maxRetries) {
    Write-Host "❌ ERROR: Vite no responde después de $maxRetries intentos" -ForegroundColor Red
    Write-Host "   Intenta manualmente: cd apps/web && pnpm dev" -ForegroundColor Yellow
    exit 1
}

# 3. Abrir navegador externo
Write-Host "🌐 Abriendo navegador externo..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

# 4. Instrucciones para Simple Browser en VS Code
Write-Host ""
Write-Host "📋 PARA VER EN VS CODE SIMPLE BROWSER:" -ForegroundColor Magenta
Write-Host "   1) Presiona Ctrl+Shift+P" -ForegroundColor White
Write-Host "   2) Escribe: Simple Browser: Show" -ForegroundColor White
Write-Host "   3) URL: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "✅ COCKPIT LISTO EN: http://localhost:3000" -ForegroundColor Green
Write-Host "   - Logo ECONEURA arriba" -ForegroundColor Gray
Write-Host "   - 10 departamentos en sidebar" -ForegroundColor Gray
Write-Host "   - Tarjeta 'NEW AGENTE' (primera, borde discontinuo)" -ForegroundColor Gray
Write-Host "   - 4 AgentCards después" -ForegroundColor Gray
Write-Host ""
