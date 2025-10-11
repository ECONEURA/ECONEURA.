#!/usr/bin/env pwsh
# START GATEWAY - ECONEURA Gateway on port 8080

Write-Host "🚀 Starting ECONEURA Gateway..." -ForegroundColor Cyan
Write-Host "   Port: 8080" -ForegroundColor Gray
Write-Host "   Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Usar Python 3.12.10 instalado
$python = "C:\Users\Usuario\AppData\Local\Programs\Python\Python312\python.exe"

# Verificar Python
if (!(Test-Path $python)) {
    Write-Host "❌ Python not found at: $python" -ForegroundColor Red
    exit 1
}

# Ir al directorio gateway
Set-Location "C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-PUNTO\services\gateway"

# Arrancar con uvicorn
& $python -m uvicorn app:app --host 0.0.0.0 --port 8080 --reload
