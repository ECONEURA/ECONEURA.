#!/usr/bin/env pwsh
# 🧪 PROBAR_AGENTES.ps1 - Test rápido de agentes NEURA con function calling

param(
    [string]$Mensaje = "Busca información sobre OpenAI en 2024 y crea una tarea para revisarla",
    [string]$Modo = "local"  # "local" o "backend"
)

# 🎨 Colores
function Write-Color {
    param([string]$Text, [string]$Color = "White")
    $colors = @{
        "Green" = "Green"; "Red" = "Red"; "Yellow" = "Yellow"
        "Cyan" = "Cyan"; "Gray" = "Gray"; "White" = "White"
    }
    Write-Host $Text -ForegroundColor $colors[$Color]
}

# 📦 Banner
Write-Host ""
Write-Color "╔═══════════════════════════════════════════════════════╗" "Cyan"
Write-Color "║      🧪 Test de Agentes NEURA con Function Calling  ║" "Cyan"
Write-Color "╚═══════════════════════════════════════════════════════╝" "Cyan"
Write-Host ""

# 🔍 Verificar Node.js
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Color "❌ Node.js no encontrado. Instala Node.js 18+" "Red"
    exit 1
}
Write-Color "✓ Node.js: $nodeVersion" "Green"

# 📂 Verificar directorio
$apiNodePath = "apps\api_node"
if (-not (Test-Path $apiNodePath)) {
    Write-Color "❌ Directorio $apiNodePath no encontrado" "Red"
    exit 1
}

# 🔑 Verificar .env
$envFile = "$apiNodePath\.env"
if (-not (Test-Path $envFile)) {
    Write-Color "⚠️  Archivo .env no encontrado. Copiando desde .env.example..." "Yellow"
    Copy-Item "$apiNodePath\.env.example" $envFile
    Write-Color "⚠️  IMPORTANTE: Configura tu OPENAI_API_KEY en $envFile" "Yellow"
    Write-Host ""
    Write-Color "Presiona ENTER para continuar (o Ctrl+C para cancelar)..." "Yellow"
    Read-Host
}

# 📦 Verificar dependencias
Write-Color "🔍 Verificando dependencias..." "Cyan"
Push-Location $apiNodePath

$packageExists = Test-Path "package.json"
$nodeModulesExists = Test-Path "node_modules"

if ($packageExists -and -not $nodeModulesExists) {
    Write-Color "📦 Instalando dependencias con npm..." "Yellow"
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Color "❌ Error al instalar dependencias" "Red"
        Pop-Location
        exit 1
    }
}

Write-Color "✓ Dependencias OK" "Green"

# 🎯 Ejecutar según modo
Write-Host ""
Write-Color "🎯 Ejecutando en modo: $Modo" "Cyan"
Write-Color "📝 Mensaje: $Mensaje" "Gray"
Write-Host ""

if ($Modo -eq "local") {
    # Modo LOCAL (orchestrator directo)
    Write-Color "🔧 Ejecutando orchestrator localmente..." "Cyan"
    node ejecutaAgente.js --local $Mensaje
    
} elseif ($Modo -eq "backend") {
    # Modo BACKEND (vía API)
    
    # Verificar si el backend está corriendo
    $healthUrl = "http://localhost:8080/api/health"
    try {
        $health = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 2 -ErrorAction Stop
        Write-Color "✓ Backend corriendo: $($health.service)" "Green"
    } catch {
        Write-Color "⚠️  Backend no disponible. Iniciando..." "Yellow"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; node server-simple.js"
        Write-Color "⏳ Esperando 3 segundos para que inicie..." "Gray"
        Start-Sleep -Seconds 3
    }
    
    Write-Color "🌐 Ejecutando vía backend API..." "Cyan"
    node ejecutaAgente.js $Mensaje
    
} else {
    Write-Color "❌ Modo no válido: $Modo (usa 'local' o 'backend')" "Red"
    Pop-Location
    exit 1
}

$exitCode = $LASTEXITCODE

Pop-Location

# 📊 Resultado
Write-Host ""
if ($exitCode -eq 0) {
    Write-Color "╔═══════════════════════════════════════════════════════╗" "Green"
    Write-Color "║                 ✅ TEST EXITOSO                       ║" "Green"
    Write-Color "╚═══════════════════════════════════════════════════════╝" "Green"
} else {
    Write-Color "╔═══════════════════════════════════════════════════════╗" "Red"
    Write-Color "║                 ❌ TEST FALLÓ                         ║" "Red"
    Write-Color "╚═══════════════════════════════════════════════════════╝" "Red"
}
Write-Host ""

# 📚 Ayuda
Write-Color "💡 Ejemplos de uso:" "Cyan"
Write-Color "   .\PROBAR_AGENTES.ps1 -Mensaje 'Busca noticias de IA' -Modo local" "Gray"
Write-Color "   .\PROBAR_AGENTES.ps1 -Mensaje 'Crea tarea urgente' -Modo backend" "Gray"
Write-Host ""

exit $exitCode
