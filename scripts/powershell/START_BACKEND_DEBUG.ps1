#!/usr/bin/env pwsh
# Start ECONEURA Backend Gateway (Foreground for debugging)

$ErrorActionPreference = "Continue"

$BACKEND_DIR = "C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-PUNTO\apps\api_node"

Write-Host "🚀 Starting ECONEURA Backend Gateway..." -ForegroundColor Cyan
Write-Host "📂 Directory: $BACKEND_DIR" -ForegroundColor Gray
Write-Host "🔌 Port: 8080" -ForegroundColor Gray
Write-Host "🐛 Debug Mode: Showing all output" -ForegroundColor Yellow
Write-Host ""

Push-Location $BACKEND_DIR
try {
    node server.js 2>&1 | Tee-Object -FilePath "backend-debug.log"
}
catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}
finally {
    Pop-Location
}
