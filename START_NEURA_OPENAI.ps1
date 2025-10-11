# 🚀 START_NEURA_OPENAI.ps1
# Configuración y arranque de chats NEURA con OpenAI

Write-Host "`n🎯 ECONEURA - Inicializando Agentes IA con OpenAI" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Verificar si existe OPENAI_API_KEY
$envFile = "apps\api_node\.env"

if (-not (Test-Path $envFile)) {
    Write-Host "⚠️  No se encontró archivo .env" -ForegroundColor Yellow
    Write-Host "`n📝 Creando $envFile..." -ForegroundColor Cyan

    $apiKey = Read-Host "`nIngresa tu OPENAI_API_KEY (desde https://platform.openai.com/api-keys)"

    if ([string]::IsNullOrWhiteSpace($apiKey)) {
        Write-Host "`n❌ API Key requerida. Saliendo..." -ForegroundColor Red
        exit 1
    }

    @"
# Puerto del servidor
PORT=8080

# ✨ OpenAI API Key
OPENAI_API_KEY=$apiKey

# Make.com webhooks (opcional)
MAKE_WEBHOOK_BASE_URL=https://hook.us1.make.com

# Configuración de agentes
AGENT_TIMEOUT_MS=30000
"@ | Out-File -FilePath $envFile -Encoding UTF8

    Write-Host "✅ Archivo .env creado" -ForegroundColor Green
} else {
    # Verificar que contiene OPENAI_API_KEY
    $content = Get-Content $envFile -Raw
    if ($content -notmatch "OPENAI_API_KEY=sk-") {
        Write-Host "`n⚠️  OPENAI_API_KEY no configurada correctamente" -ForegroundColor Yellow
        $apiKey = Read-Host "`nIngresa tu OPENAI_API_KEY"

        if ($content -match "OPENAI_API_KEY=") {
            $content = $content -replace "OPENAI_API_KEY=.*", "OPENAI_API_KEY=$apiKey"
        } else {
            $content += "`nOPENAI_API_KEY=$apiKey"
        }

        $content | Out-File -FilePath $envFile -Encoding UTF8
        Write-Host "✅ API Key actualizada" -ForegroundColor Green
    } else {
        Write-Host "✅ OPENAI_API_KEY configurada" -ForegroundColor Green
    }
}

Write-Host "`n🔍 Verificando dependencias..." -ForegroundColor Cyan

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Node.js no encontrado. Instala desde: https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Verificar npm packages
Set-Location apps\api_node

if (-not (Test-Path "node_modules")) {
    Write-Host "`n📦 Instalando dependencias..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n❌ Error instalando dependencias" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ✓ Dependencias instaladas" -ForegroundColor Green
}

# Verificar que openai está instalado
$hasOpenAI = Test-Path "node_modules\openai"
if (-not $hasOpenAI) {
    Write-Host "`n📦 Instalando OpenAI SDK..." -ForegroundColor Cyan
    npm install openai
}

Write-Host "`n🚀 Iniciando Backend con OpenAI..." -ForegroundColor Cyan
Write-Host "   Puerto: 8080" -ForegroundColor White
Write-Host "   Agentes: neura-1 a neura-10" -ForegroundColor White
Write-Host "   Capacidades: GPT-4o, Memoria, Streaming" -ForegroundColor White

Start-Sleep -Seconds 1

Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🎯 BACKEND ACTIVO - AGENTES IA LISTOS" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "📡 Endpoints disponibles:" -ForegroundColor Cyan
Write-Host "   Health:    http://localhost:8080/api/health" -ForegroundColor White
Write-Host "   Chat:      POST http://localhost:8080/api/invoke/:agentId" -ForegroundColor White
Write-Host "   Streaming: POST http://localhost:8080/api/stream/:agentId" -ForegroundColor White

Write-Host "`n🎭 Agentes disponibles:" -ForegroundColor Cyan
Write-Host "   neura-1  → Analytics Specialist" -ForegroundColor White
Write-Host "   neura-2  → Chief Data Officer" -ForegroundColor White
Write-Host "   neura-3  → Chief Financial Officer" -ForegroundColor White
Write-Host "   neura-4  → Chief Human Resources" -ForegroundColor White
Write-Host "   neura-5  → Chief Security Officer" -ForegroundColor White
Write-Host "   neura-6  → Chief Marketing Officer" -ForegroundColor White
Write-Host "   neura-7  → Chief Technology Officer" -ForegroundColor White
Write-Host "   neura-8  → Legal Counsel" -ForegroundColor White
Write-Host "   neura-9  → Reception Assistant" -ForegroundColor White
Write-Host "   neura-10 → Research Specialist" -ForegroundColor White

Write-Host "`n💡 Próximo paso:" -ForegroundColor Cyan
Write-Host "   1. Abre otro terminal" -ForegroundColor White
Write-Host "   2. Ejecuta: .\START_COCKPIT.ps1" -ForegroundColor White
Write-Host "   3. Visita: http://localhost:3000" -ForegroundColor White
Write-Host "   4. Click 'Abrir chat' y escribe cualquier pregunta" -ForegroundColor White

Write-Host "`n📚 Documentación:" -ForegroundColor Cyan
Write-Host "   docs\OPENAI_CHAT_INTEGRATION_GUIDE.md" -ForegroundColor White

Write-Host "`n🔥 Iniciando servidor...\n" -ForegroundColor Yellow

# Ejecutar servidor
node server-simple.js
