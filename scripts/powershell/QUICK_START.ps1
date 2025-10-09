# ECONEURA Quick Start Script
# Este script arranca el stack completo para desarrollo

Write-Host "🚀 ECONEURA Quick Start" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Verificar dependencias básicas
Write-Host "`n📋 Verificando dependencias..." -ForegroundColor Yellow

# Verificar pnpm
try {
    $pnpmVersion = pnpm --version
    Write-Host "✅ pnpm v$pnpmVersion instalado" -ForegroundColor Green
}
catch {
    Write-Host "❌ pnpm no encontrado. Instala con: npm install -g pnpm" -ForegroundColor Red
    exit 1
}

# Verificar Python
try {
    $pythonVersion = python --version
    Write-Host "✅ $pythonVersion instalado" -ForegroundColor Green
}
catch {
    Write-Host "❌ Python no encontrado. Instala Python 3.11+" -ForegroundColor Red
    exit 1
}

# Verificar Node
try {
    $nodeVersion = node --version
    Write-Host "✅ Node $nodeVersion instalado" -ForegroundColor Green
}
catch {
    Write-Host "❌ Node.js no encontrado" -ForegroundColor Red
    exit 1
}

# Instalar dependencias si es necesario
if (-not (Test-Path "node_modules")) {
    Write-Host "`n📦 Instalando dependencias npm..." -ForegroundColor Yellow
    pnpm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error instalando dependencias npm" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencias npm instaladas" -ForegroundColor Green
}

# Instalar dependencias Python para auth service
if (-not (Test-Path "services/auth/venv")) {
    Write-Host "`n📦 Creando venv para auth service..." -ForegroundColor Yellow
    python -m venv services/auth/venv
    & services/auth/venv/Scripts/Activate.ps1
    pip install -r services/auth/requirements.txt
    deactivate
    Write-Host "✅ Auth service venv creado" -ForegroundColor Green
}

# Instalar dependencias Python para analytics
if (-not (Test-Path "services/neuras/analytics/venv")) {
    Write-Host "`n📦 Creando venv para analytics agent..." -ForegroundColor Yellow
    python -m venv services/neuras/analytics/venv
    & services/neuras/analytics/venv/Scripts/Activate.ps1
    pip install -r services/neuras/analytics/requirements.txt
    deactivate
    Write-Host "✅ Analytics agent venv creado" -ForegroundColor Green
}

# Verificar Docker
$dockerRunning = $false
try {
    docker info 2>&1 | Out-Null
    $dockerRunning = $true
    Write-Host "✅ Docker está corriendo" -ForegroundColor Green
}
catch {
    Write-Host "⚠️ Docker no disponible - BD no se iniciará" -ForegroundColor Yellow
    Write-Host "   Instala Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Gray
}

# Iniciar servicios
Write-Host "`n🎯 Iniciando servicios..." -ForegroundColor Cyan

# Iniciar Base de Datos (si Docker está disponible)
if ($dockerRunning) {
    Write-Host "`n🐘 Iniciando PostgreSQL..." -ForegroundColor Yellow
    docker compose -f docker-compose.dev.enhanced.yml up -d postgres
    
    # Esperar a que Postgres esté listo
    Write-Host "⏳ Esperando a que PostgreSQL esté listo..." -ForegroundColor Yellow
    $retries = 0
    $maxRetries = 30
    while ($retries -lt $maxRetries) {
        try {
            docker exec econeura-postgres pg_isready -U econeura 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ PostgreSQL listo" -ForegroundColor Green
                break
            }
        }
        catch {}
        
        $retries++
        Start-Sleep -Seconds 1
        Write-Host "." -NoNewline
    }
    
    if ($retries -ge $maxRetries) {
        Write-Host "`n⚠️ PostgreSQL tardó demasiado en iniciar" -ForegroundColor Yellow
    }
    
    # Verificar tablas
    Write-Host "`n📊 Verificando esquema de base de datos..." -ForegroundColor Yellow
    $tables = docker exec econeura-postgres psql -U econeura -d econeura_dev -t -c "\dt" 2>&1
    if ($tables -match "users") {
        Write-Host "✅ Esquema de BD inicializado correctamente" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️ Tablas no encontradas - puede necesitar inicialización manual" -ForegroundColor Yellow
    }
}

# Iniciar Auth Service
Write-Host "`n🔐 Iniciando Auth Service (puerto 8081)..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "& services/auth/venv/Scripts/Activate.ps1; cd services/auth; python app.py" -WindowStyle Minimized

# Iniciar Analytics Agent
Write-Host "🧠 Iniciando Analytics Agent (puerto 8101)..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "& services/neuras/analytics/venv/Scripts/Activate.ps1; cd services/neuras/analytics; python app.py" -WindowStyle Minimized

# Iniciar Python Proxy
Write-Host "🔄 Iniciando Python Proxy (puerto 8080)..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd apps/api_py; python server.py" -WindowStyle Minimized

# Esperar a que los servicios estén listos
Start-Sleep -Seconds 3

# Iniciar Frontend Web
Write-Host "🌐 Iniciando Frontend Web (puerto 3000)..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "pnpm -C apps/web dev" -WindowStyle Minimized

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "✅ ECONEURA iniciado exitosamente!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 Servicios disponibles:" -ForegroundColor White
Write-Host "   🌐 Frontend:        http://localhost:3000" -ForegroundColor Gray
Write-Host "   🔄 Python Proxy:    http://localhost:8080" -ForegroundColor Gray
Write-Host "   🔐 Auth Service:    http://localhost:8081" -ForegroundColor Gray
Write-Host "   🧠 Analytics Agent: http://localhost:8101" -ForegroundColor Gray
if ($dockerRunning) {
    Write-Host "   🐘 PostgreSQL:      localhost:5432" -ForegroundColor Gray
}
Write-Host ""
Write-Host "🔑 Credenciales de prueba:" -ForegroundColor White
Write-Host "   Email:    admin@econeura.com" -ForegroundColor Gray
Write-Host "   Password: econeura2025" -ForegroundColor Gray
Write-Host ""
Write-Host "📊 Health checks:" -ForegroundColor White
Write-Host "   curl http://localhost:8080/api/health" -ForegroundColor Gray
Write-Host "   curl http://localhost:8081/health" -ForegroundColor Gray
Write-Host "   curl http://localhost:8101/health" -ForegroundColor Gray
Write-Host ""
Write-Host "🛑 Para detener: Cierra las ventanas de PowerShell" -ForegroundColor Yellow
