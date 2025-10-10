#!/usr/bin/env pwsh
# 🧠 DEMO_MODELO_ADAPTATIVO.ps1
# Demuestra cómo el sistema elige automáticamente entre GPT-4o y o1-preview

param(
    [switch]$Verbose = $false
)

# 🎨 Colores
function Write-Color {
    param([string]$Text, [string]$Color = "White")
    $colors = @{
        "Green" = "Green"; "Red" = "Red"; "Yellow" = "Yellow"
        "Cyan" = "Cyan"; "Gray" = "Gray"; "White" = "White"; "Magenta" = "Magenta"
    }
    Write-Host $Text -ForegroundColor $colors[$Color]
}

# Banner
Write-Host ""
Write-Color "╔═══════════════════════════════════════════════════════════════╗" "Cyan"
Write-Color "║   🧠 DEMO: Sistema Adaptativo de Modelos OpenAI            ║" "Cyan"
Write-Color "║   GPT-4o (rápido) ↔ o1-preview (razonamiento profundo)     ║" "Cyan"
Write-Color "╚═══════════════════════════════════════════════════════════════╝" "Cyan"
Write-Host ""

# 🧪 Casos de prueba
$testCases = @(
    @{
        Title = "Pregunta Simple"
        Agent = "neura-9"  # Reception
        Query = "¿Cuál es el horario de atención?"
        ExpectedModel = "gpt-4o"
        Reason = "Tarea simple, respuesta rápida"
    },
    @{
        Title = "Análisis Financiero Complejo"
        Agent = "neura-3"  # CFO
        Query = "Necesito un análisis financiero profundo de valoración de empresa considerando DCF, múltiplos comparables y proyecciones a 5 años con sensibilidad de variables macro"
        ExpectedModel = "o1-preview"
        Reason = "Análisis estratégico complejo con múltiples variables"
    },
    @{
        Title = "Auditoría de Seguridad"
        Agent = "neura-5"  # CISO
        Query = "Realiza una auditoría exhaustiva de vulnerabilidades considerando OWASP Top 10, análisis de superficie de ataque y threat modeling"
        ExpectedModel = "o1-preview"
        Reason = "Análisis técnico profundo con compliance"
    },
    @{
        Title = "Consulta HR Simple"
        Agent = "neura-4"  # CHRO
        Query = "¿Cuántos días de vacaciones corresponden?"
        ExpectedModel = "gpt-4o"
        Reason = "Pregunta directa sin complejidad"
    },
    @{
        Title = "Arquitectura de Sistema"
        Agent = "neura-7"  # CTO
        Query = "Diseña una arquitectura escalable para microservicios considerando alta disponibilidad, disaster recovery, observabilidad y optimización de costos"
        ExpectedModel = "o1-preview"
        Reason = "Diseño arquitectónico con múltiples restricciones"
    },
    @{
        Title = "Marketing Básico"
        Agent = "neura-6"  # CMO
        Query = "Dame ideas para un post en LinkedIn"
        ExpectedModel = "gpt-4o"
        Reason = "Tarea creativa simple"
    },
    @{
        Title = "Análisis Legal Complejo"
        Agent = "neura-8"  # Legal
        Query = "Analiza este contrato de M&A considerando compliance regulatorio, cláusulas de indemnización y riesgos fiscales internacionales"
        ExpectedModel = "o1-preview"
        Reason = "Análisis jurídico exhaustivo"
    }
)

Write-Color "📋 Se probarán $($testCases.Count) casos de uso diferentes" "Gray"
Write-Host ""

# 🔧 Verificar si el backend está corriendo
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
    Write-Color "✓ Backend detectado: $($health.service)" "Green"
} catch {
    Write-Color "⚠️  Backend no disponible en puerto 8080" "Yellow"
    Write-Color "   Ejecuta primero: .\START_NEURA_OPENAI.ps1" "Gray"
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Color "═" * 70 "Gray"
Write-Host ""

# 🧪 Ejecutar tests
$results = @()

foreach ($test in $testCases) {
    Write-Color "🧪 TEST: $($test.Title)" "Cyan"
    Write-Color "   Agente: $($test.Agent)" "Gray"
    Write-Color "   Query: $($test.Query.Substring(0, [Math]::Min(80, $test.Query.Length)))..." "Gray"
    
    # Simular selección de modelo (sin llamar a OpenAI)
    $modelSelection = node -e @"
        const { selectOptimalModel } = require('./services/modelSelector');
        const selection = selectOptimalModel('$($test.Agent)', `$($test.Query | ConvertTo-Json)`);
        console.log(JSON.stringify(selection));
"@
    
    if ($LASTEXITCODE -eq 0 -and $modelSelection) {
        $selection = $modelSelection | ConvertFrom-Json
        
        $match = $selection.model -eq $test.ExpectedModel
        
        if ($match) {
            Write-Color "   ✅ Modelo seleccionado: $($selection.model)" "Green"
        } else {
            Write-Color "   ⚠️  Modelo seleccionado: $($selection.model) (esperado: $($test.ExpectedModel))" "Yellow"
        }
        
        Write-Color "   📊 Complejidad: $([Math]::Round($selection.complexity, 2))" "Gray"
        Write-Color "   🔍 Razón: $($selection.reason)" "Gray"
        
        $results += @{
            Test = $test.Title
            Agent = $test.Agent
            ModelSelected = $selection.model
            Expected = $test.ExpectedModel
            Match = $match
            Complexity = $selection.complexity
            Reason = $selection.reason
        }
        
        if ($Verbose) {
            Write-Color "   Detalles:" "Gray"
            $selection | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor DarkGray
        }
    } else {
        Write-Color "   ❌ Error ejecutando selector" "Red"
    }
    
    Write-Host ""
}

# 📊 Resumen
Write-Color "═" * 70 "Gray"
Write-Host ""
Write-Color "📊 RESUMEN DE RESULTADOS" "Cyan"
Write-Host ""

$correctPredictions = ($results | Where-Object { $_.Match }).Count
$totalTests = $results.Count
$accuracy = if ($totalTests -gt 0) { [Math]::Round(($correctPredictions / $totalTests) * 100, 1) } else { 0 }

Write-Color "Total de tests: $totalTests" "White"
Write-Color "Predicciones correctas: $correctPredictions" "Green"
Write-Color "Precisión: $accuracy%" $(if ($accuracy -ge 80) { "Green" } else { "Yellow" })
Write-Host ""

# Desglose por modelo
$gpt4oCount = ($results | Where-Object { $_.ModelSelected -eq 'gpt-4o' }).Count
$o1Count = ($results | Where-Object { $_.ModelSelected -eq 'o1-preview' }).Count

Write-Color "Distribución de modelos:" "Cyan"
Write-Color "  • GPT-4o: $gpt4oCount tareas (rápidas/generales)" "White"
Write-Color "  • o1-preview: $o1Count tareas (complejas/profundas)" "Magenta"
Write-Host ""

# 💡 Recomendaciones
Write-Color "💡 CONCLUSIONES" "Yellow"
Write-Host ""

if ($o1Count -eq 0) {
    Write-Color "⚠️  Ninguna tarea activó o1-preview" "Yellow"
    Write-Color "   • Reduce COMPLEXITY_THRESHOLD en .env para activarlo más seguido" "Gray"
    Write-Color "   • Actual: 0.6 → Prueba: 0.4" "Gray"
} elseif ($o1Count -eq $totalTests) {
    Write-Color "⚠️  Todas las tareas usan o1-preview (costoso)" "Yellow"
    Write-Color "   • Aumenta COMPLEXITY_THRESHOLD en .env" "Gray"
    Write-Color "   • Actual: 0.6 → Prueba: 0.8" "Gray"
} else {
    Write-Color "✅ Balance correcto entre modelos" "Green"
    Write-Color "   • Tareas simples → GPT-4o (rápido, económico)" "Gray"
    Write-Color "   • Tareas complejas → o1-preview (profundo, premium)" "Gray"
}

Write-Host ""
Write-Color "═" * 70 "Gray"
Write-Host ""

# 🔧 Configuración actual
Write-Color "🔧 CONFIGURACIÓN ACTUAL" "Cyan"
Write-Host ""

try {
    $statsResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/stats/models" -Method Get -ErrorAction Stop
    
    Write-Color "Configuración del sistema:" "White"
    Write-Color "  • Permitir o1-preview: $($statsResponse.config.allowO1)" "Gray"
    Write-Color "  • Preferir velocidad: $($statsResponse.config.preferSpeed)" "Gray"
    Write-Color "  • Umbral de complejidad: $($statsResponse.config.complexityThreshold)" "Gray"
    Write-Host ""
    
    if ($statsResponse.stats.total.count -gt 0) {
        Write-Color "Estadísticas de uso:" "White"
        Write-Color "  • Total de llamadas: $($statsResponse.stats.total.count)" "Gray"
        Write-Color "  • Tokens procesados: $($statsResponse.stats.total.tokens)" "Gray"
        Write-Color "  • Costo total: `$$([Math]::Round($statsResponse.stats.total.cost, 4))" "Gray"
    }
} catch {
    Write-Color "⚠️  No se pudieron obtener estadísticas" "Yellow"
}

Write-Host ""

# 📚 Ayuda
Write-Color "📚 PRÓXIMOS PASOS" "Cyan"
Write-Host ""
Write-Color "1. Ajustar configuración:" "White"
Write-Color "   • Edita apps/api_node/.env" "Gray"
Write-Color "   • Cambia COMPLEXITY_THRESHOLD, ALLOW_O1_PREVIEW, etc." "Gray"
Write-Host ""
Write-Color "2. Probar en producción:" "White"
Write-Color "   • .\START_NEURA_OPENAI.ps1" "Gray"
Write-Color "   • Envía queries reales y observa qué modelo se usa" "Gray"
Write-Host ""
Write-Color "3. Ver estadísticas:" "White"
Write-Color "   • GET http://localhost:8080/api/stats/models" "Gray"
Write-Color "   • Monitorea costos y distribución de modelos" "Gray"
Write-Host ""

Write-Color "✨ Para más información: .\docs\MODELO_PREMIUM_OPTIONS.md" "Cyan"
Write-Host ""
