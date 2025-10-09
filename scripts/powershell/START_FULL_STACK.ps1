##############################################################################
# ECONEURA - Script de Inicio Completo (PowerShell)
# Arranca: Backend Node.js + Frontend Cockpit + Servicios FastAPI (opcional)
##############################################################################

$ErrorActionPreference = "Stop"

Write-Host "🚀 Iniciando ECONEURA Stack Completo..." -ForegroundColor Blue
Write-Host ""

# Verificar dependencias
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js no encontrado" -ForegroundColor Red
    exit 1
}

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ pnpm no encontrado" -ForegroundColor Red
    exit 1
}

# Navegar a raíz del proyecto
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

# Cargar variables de entorno
if (Test-Path ".env.local") {
    Write-Host "✅ Cargando .env.local" -ForegroundColor Green
    Get-Content ".env.local" | ForEach-Object {
        if ($_ -match "^([^#][^=]*)=(.*)$") {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
} else {
    Write-Host "⚠️  .env.local no encontrado, usando valores por defecto" -ForegroundColor Yellow
}

# Array para procesos
$Processes = @()

# Crear directorio de logs
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
}

# ============================================
# 1. BACKEND NODE.JS (puerto 8080)
# ============================================
Write-Host ""
Write-Host "📦 Iniciando Backend Node.js en puerto 8080..." -ForegroundColor Blue

if (-not (Test-Path "apps\api_node\server.js")) {
    Write-Host "❌ apps\api_node\server.js no encontrado" -ForegroundColor Red
    exit 1
}

$env:PORT = "8080"
$BackendProcess = Start-Process -FilePath "node" -ArgumentList "server.js" `
    -WorkingDirectory "apps\api_node" `
    -RedirectStandardOutput "..\..\logs\backend-node.log" `
    -RedirectStandardError "..\..\logs\backend-node-error.log" `
    -PassThru -WindowStyle Hidden

$Processes += $BackendProcess
Write-Host "  → Backend Node.js iniciado (PID: $($BackendProcess.Id))" -ForegroundColor Green

# Esperar a que backend esté listo
Write-Host "  → Esperando backend..." -ForegroundColor Yellow
$maxRetries = 10
$retries = 0
$backendReady = $false

while ($retries -lt $maxRetries) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/api/health" -TimeoutSec 1 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ Backend listo!" -ForegroundColor Green
            $backendReady = $true
            break
        }
    } catch {
        # Ignorar errores, seguir intentando
    }
    $retries++
    Start-Sleep -Seconds 1
}

if (-not $backendReady) {
    Write-Host "  ❌ Backend no responde después de $maxRetries intentos" -ForegroundColor Red
    $Processes | ForEach-Object { Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue }
    exit 1
}

# ============================================
# 2. FRONTEND COCKPIT (puerto 3000)
# ============================================
Write-Host ""
Write-Host "🌐 Iniciando Frontend Cockpit en puerto 3000..." -ForegroundColor Blue

if (-not (Test-Path "apps\web\vite.config.ts")) {
    Write-Host "❌ apps\web\vite.config.ts no encontrado" -ForegroundColor Red
    $Processes | ForEach-Object { Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue }
    exit 1
}

$FrontendProcess = Start-Process -FilePath "pnpm" -ArgumentList "dev" `
    -WorkingDirectory "apps\web" `
    -RedirectStandardOutput "..\..\logs\frontend.log" `
    -RedirectStandardError "..\..\logs\frontend-error.log" `
    -PassThru -WindowStyle Hidden

$Processes += $FrontendProcess
Write-Host "  → Frontend Cockpit iniciado (PID: $($FrontendProcess.Id))" -ForegroundColor Green

# Esperar a que frontend esté listo
Write-Host "  → Esperando frontend..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Write-Host "  ✅ Frontend iniciado (puede tardar ~10s en estar listo)" -ForegroundColor Green

# ============================================
# 3. SERVICIOS FASTAPI (OPCIONAL)
# ============================================
$StartFastAPI = $env:START_FASTAPI

if ($StartFastAPI -eq "1") {
    Write-Host ""
    Write-Host "🤖 Iniciando servicios FastAPI..." -ForegroundColor Blue
    
    # Verificar Python y uvicorn
    if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Python no encontrado" -ForegroundColor Red
        $Processes | ForEach-Object { Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue }
        exit 1
    }
    
    if (-not (Get-Command uvicorn -ErrorAction SilentlyContinue)) {
        Write-Host "⚠️  uvicorn no encontrado, instalando..." -ForegroundColor Yellow
        pip install uvicorn fastapi
    }
    
    $Services = @("analytics", "cdo", "cfo", "chro", "ciso", "cmo", "cto", "legal", "reception", "research", "support")
    $BasePort = 8101
    
    for ($i = 0; $i -lt $Services.Length; $i++) {
        $service = $Services[$i]
        $port = $BasePort + $i
        
        if (Test-Path "services\neuras\$service") {
            Write-Host "  → Iniciando $service en puerto $port..." -ForegroundColor Yellow
            
            $env:PORT = $port
            $ServiceProcess = Start-Process -FilePath "uvicorn" `
                -ArgumentList "app:app", "--host", "127.0.0.1", "--port", "$port", "--reload" `
                -WorkingDirectory "services\neuras\$service" `
                -RedirectStandardOutput "..\..\..\logs\fastapi-$service.log" `
                -RedirectStandardError "..\..\..\logs\fastapi-$service-error.log" `
                -PassThru -WindowStyle Hidden
            
            $Processes += $ServiceProcess
            Write-Host "    ✅ $service (PID: $($ServiceProcess.Id))" -ForegroundColor Green
        } else {
            Write-Host "    ❌ $service no encontrado" -ForegroundColor Red
        }
    }
    
    Write-Host "✅ Servicios FastAPI iniciados" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "ℹ️  Servicios FastAPI NO iniciados (set `$env:START_FASTAPI=`"1`" para arrancarlos)" -ForegroundColor Yellow
}

# ============================================
# RESUMEN Y HEALTH CHECKS
# ============================================
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✅ ECONEURA Stack iniciado correctamente" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs de acceso:" -ForegroundColor Blue
Write-Host "  → Frontend Cockpit:  http://localhost:3000" -ForegroundColor Green
Write-Host "  → Backend Node.js:   http://localhost:8080" -ForegroundColor Green
if ($StartFastAPI -eq "1") {
    Write-Host "  → Servicios FastAPI: http://localhost:8101-8111" -ForegroundColor Green
}
Write-Host ""
Write-Host "🔍 Health Check Backend:" -ForegroundColor Blue
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8080/api/health"
    Write-Host "  ✅ $($health | ConvertTo-Json -Compress)" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Backend health check falló" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "📊 Observabilidad (si está corriendo Docker):" -ForegroundColor Blue
Write-Host "  → Jaeger UI:    http://localhost:16686" -ForegroundColor Green
Write-Host "  → Prometheus:   http://localhost:9090" -ForegroundColor Green
Write-Host "  → Grafana:      http://localhost:3001" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Logs:" -ForegroundColor Blue
Write-Host "  → Backend:  Get-Content logs\backend-node.log -Wait" -ForegroundColor Yellow
Write-Host "  → Frontend: Get-Content logs\frontend.log -Wait" -ForegroundColor Yellow
if ($StartFastAPI -eq "1") {
    Write-Host "  → FastAPI:  Get-Content logs\fastapi-*.log -Wait" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "Presiona Ctrl+C para detener todos los servicios" -ForegroundColor Yellow
Write-Host ""

# Registrar cleanup al salir
$null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action {
    Write-Host ""
    Write-Host "🛑 Deteniendo todos los servicios..." -ForegroundColor Yellow
    $Processes | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        } catch {
            # Ignorar errores
        }
    }
    Write-Host "✅ Servicios detenidos" -ForegroundColor Green
}

# Mantener script corriendo
try {
    while ($true) {
        Start-Sleep -Seconds 1
        
        # Verificar que procesos sigan vivos
        $deadProcesses = $Processes | Where-Object { $_.HasExited }
        if ($deadProcesses) {
            Write-Host "⚠️  Algunos procesos han terminado inesperadamente" -ForegroundColor Yellow
            $deadProcesses | ForEach-Object {
                Write-Host "  → PID $($_.Id) terminó con código $($_.ExitCode)" -ForegroundColor Red
            }
            throw "Procesos terminados"
        }
    }
} catch {
    Write-Host ""
    Write-Host "🛑 Deteniendo todos los servicios..." -ForegroundColor Yellow
    $Processes | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        } catch {
            # Ignorar errores
        }
    }
    Write-Host "✅ Servicios detenidos" -ForegroundColor Green
    exit 1
}
