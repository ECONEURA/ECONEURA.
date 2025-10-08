#!/usr/bin/env pwsh
# ECONEURA Development Startup Script for Windows

Write-Host "🚀 Starting ECONEURA development environment..." -ForegroundColor Cyan

# Start Backend API
Write-Host "`n📡 Starting Backend API on port 8082..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-PUNTO"
    $env:PORT = "8082"
    node apps/api_node/server.js
}
Write-Host "   ✅ Backend started (Job ID: $($backendJob.Id))" -ForegroundColor Green

# Wait a moment for backend to start
Start-Sleep -Seconds 2

# Start Frontend Cockpit
Write-Host "`n🌐 Starting Frontend Cockpit on port 3000..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-PUNTO\apps\web"
    pnpm dev
}
Write-Host "   ✅ Frontend started (Job ID: $($frontendJob.Id))" -ForegroundColor Green

# Wait for services to initialize
Write-Host "`n⏳ Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "`n✅ ECONEURA is ready!" -ForegroundColor Green
Write-Host "`n📊 Services:" -ForegroundColor Cyan
Write-Host "   • Backend API: http://localhost:8082" -ForegroundColor White
Write-Host "   • Frontend Cockpit: http://localhost:3000" -ForegroundColor White
Write-Host "`n🔍 To view logs:" -ForegroundColor Cyan
Write-Host "   • Backend: Receive-Job -Id $($backendJob.Id) -Keep" -ForegroundColor Gray
Write-Host "   • Frontend: Receive-Job -Id $($frontendJob.Id) -Keep" -ForegroundColor Gray
Write-Host "`n🛑 To stop services:" -ForegroundColor Cyan
Write-Host "   • Stop-Job -Id $($backendJob.Id),$($frontendJob.Id)" -ForegroundColor Gray
Write-Host "   • Remove-Job -Id $($backendJob.Id),$($frontendJob.Id)" -ForegroundColor Gray

# Keep script running
Write-Host "`n⌨️  Press Ctrl+C to stop all services`n" -ForegroundColor Yellow

try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    Write-Host "`n🛑 Stopping services..." -ForegroundColor Red
    Stop-Job -Id $backendJob.Id, $frontendJob.Id -ErrorAction SilentlyContinue
    Remove-Job -Id $backendJob.Id, $frontendJob.Id -ErrorAction SilentlyContinue
    Write-Host "✅ All services stopped" -ForegroundColor Green
}
