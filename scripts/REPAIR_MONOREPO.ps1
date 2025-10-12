#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Script de reparación automática del monorepo ECONEURA
    
.DESCRIPTION
    Ejecuta todos los pasos de remediación identificados en AUTOCRITICA_BRUTAL.md
    - Restaura App.tsx
    - Arranca todos los servicios
    - Valida health checks
    - Ejecuta tests completos
    - Genera reportes de estado
    
.PARAMETER DryRun
    Ejecuta sin hacer cambios reales (solo validación)
    
.PARAMETER SkipSecurity
    Omite pasos de seguridad (revocar API keys)
    
.EXAMPLE
    .\scripts\REPAIR_MONOREPO.ps1
    
.EXAMPLE
    .\scripts\REPAIR_MONOREPO.ps1 -DryRun
#>

param(
    [switch]$DryRun,
    [switch]$SkipSecurity
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Colores para output
function Write-Success { param($msg) Write-Host "✅ $msg" -ForegroundColor Green }
function Write-Error-Custom { param($msg) Write-Host "❌ $msg" -ForegroundColor Red }
function Write-Warning-Custom { param($msg) Write-Host "⚠️  $msg" -ForegroundColor Yellow }
function Write-Info { param($msg) Write-Host "ℹ️  $msg" -ForegroundColor Cyan }
function Write-Step { param($msg) Write-Host "`n🔧 $msg" -ForegroundColor Magenta }

# Directorios
$ROOT = Split-Path -Parent $PSScriptRoot
$WEB_DIR = Join-Path $ROOT "apps\web"
$API_NODE_DIR = Join-Path $ROOT "apps\api_node"
$API_PY_DIR = Join-Path $ROOT "apps\api_py"
$RECEPTION_DIR = Join-Path $ROOT "services\neuras\reception"

Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║        🔧 ECONEURA MONOREPO REPAIR AUTOMATION 🔧            ║
║                                                              ║
║  Este script ejecutará los pasos de remediación             ║
║  identificados en AUTOCRITICA_BRUTAL.md                     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

if ($DryRun) {
    Write-Warning-Custom "MODO DRY RUN: No se harán cambios reales"
    Start-Sleep -Seconds 2
}

# ============================================================================
# FASE 1: DIAGNÓSTICO INICIAL
# ============================================================================

Write-Step "FASE 1: DIAGNÓSTICO INICIAL"

Write-Info "Verificando estructura del monorepo..."
$criticalPaths = @(
    "apps\web\src",
    "apps\api_node",
    "apps\api_py",
    "services\neuras\reception",
    "packages\shared"
)

foreach ($path in $criticalPaths) {
    $fullPath = Join-Path $ROOT $path
    if (Test-Path $fullPath) {
        Write-Success "Encontrado: $path"
    } else {
        Write-Error-Custom "FALTANTE: $path"
        throw "Estructura de monorepo incompleta"
    }
}

Write-Info "Verificando puertos ocupados..."
$ports = @{
    "3000" = "Frontend (Vite)"
    "3001" = "Backend Node.js"
    "3101" = "FastAPI Reception"
    "8080" = "Python Proxy"
}

$activeServices = @{}
foreach ($port in $ports.Keys) {
    try {
        $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($conn) {
            $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
            $activeServices[$port] = @{
                "State" = $conn.State
                "Process" = $process.ProcessName
                "PID" = $conn.OwningProcess
            }
            Write-Warning-Custom "Puerto $port ($($ports[$port])) ocupado: $($conn.State) - PID $($conn.OwningProcess) ($($process.ProcessName))"
        } else {
            Write-Info "Puerto $port ($($ports[$port])) libre"
        }
    } catch {
        Write-Info "Puerto $port ($($ports[$port])) libre"
    }
}

# ============================================================================
# FASE 2: LIMPIEZA DE PROCESOS
# ============================================================================

Write-Step "FASE 2: LIMPIEZA DE PROCESOS HUÉRFANOS"

if ($activeServices.Count -gt 0) {
    Write-Warning-Custom "Se encontraron $($activeServices.Count) servicios activos"
    
    if (-not $DryRun) {
        Write-Info "¿Desea detener estos procesos? (S/N)"
        $response = Read-Host
        
        if ($response -eq "S" -or $response -eq "s") {
            foreach ($port in $activeServices.Keys) {
                $pid = $activeServices[$port].PID
                try {
                    Stop-Process -Id $pid -Force
                    Write-Success "Proceso detenido: PID $pid (Puerto $port)"
                } catch {
                    $errorMsg = $_.Exception.Message
                    Write-Error-Custom "No se pudo detener proceso ${pid}: $errorMsg"
                }
            }
            Start-Sleep -Seconds 2
        }
    } else {
        Write-Info "[DRY RUN] Se detendrían los procesos en puertos: $($activeServices.Keys -join ', ')"
    }
} else {
    Write-Success "No hay procesos huérfanos que limpiar"
}

# ============================================================================
# FASE 3: RESTAURACIÓN DE ARCHIVOS CRÍTICOS
# ============================================================================

Write-Step "FASE 3: RESTAURACIÓN DE ARCHIVOS CRÍTICOS"

Write-Info "Verificando App.tsx..."
$appTsxPath = Join-Path $WEB_DIR "src\App.tsx"

if (-not (Test-Path $appTsxPath)) {
    Write-Warning-Custom "App.tsx NO EXISTE - Intentando restaurar de git..."
    
    if (-not $DryRun) {
        Push-Location $ROOT
        try {
            # Buscar último commit que contenía App.tsx
            $lastCommit = git log --all --full-history --format="%H" -- "apps/web/src/App.tsx" | Select-Object -First 1
            
            if ($lastCommit) {
                Write-Info "Encontrado en commit: $lastCommit"
                git checkout $lastCommit -- apps/web/src/App.tsx
                Write-Success "App.tsx restaurado exitosamente"
            } else {
                Write-Error-Custom "No se encontró App.tsx en historial git"
                Write-Info "Creando App.tsx básico..."
                
                # Crear App.tsx mínimo
                $basicApp = @"
import React from 'react';
import EconeuraCockpit from './EconeuraCockpit';

export default function App() {
  return <EconeuraCockpit />;
}
"@
                Set-Content -Path $appTsxPath -Value $basicApp
                Write-Success "App.tsx básico creado"
            }
        } catch {
            $errorMsg = $_.Exception.Message
            Write-Error-Custom "Error restaurando App.tsx: $errorMsg"
        } finally {
            Pop-Location
        }
    } else {
        Write-Info "[DRY RUN] Se restauraría App.tsx de git history"
    }
} else {
    Write-Success "App.tsx existe"
}

# ============================================================================
# FASE 4: INSTALACIÓN DE DEPENDENCIAS
# ============================================================================

Write-Step "FASE 4: INSTALACIÓN DE DEPENDENCIAS"

Write-Info "Verificando node_modules..."

if (-not $DryRun) {
    Push-Location $ROOT
    try {
        Write-Info "Ejecutando pnpm install..."
        pnpm install --silent
        Write-Success "Dependencias instaladas"
    } catch {
        $errorMsg = $_.Exception.Message
        Write-Warning-Custom "Error instalando dependencias: $errorMsg"
    } finally {
        Pop-Location
    }
} else {
    Write-Info "[DRY RUN] Se ejecutaría: pnpm install"
}

# ============================================================================
# FASE 5: VALIDACIÓN ESTÁTICA
# ============================================================================

Write-Step "FASE 5: VALIDACIÓN ESTÁTICA (Lint + TypeCheck)"

if (-not $DryRun) {
    Push-Location $ROOT
    
    Write-Info "Ejecutando lint..."
    try {
        $lintOutput = pnpm -w lint 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Lint pasado"
        } else {
            Write-Warning-Custom "Lint con warnings/errores"
        }
    } catch {
        $errorMsg = $_.Exception.Message
        Write-Warning-Custom "Error en lint: $errorMsg"
    }
    
    Write-Info "Ejecutando typecheck..."
    try {
        $typeOutput = pnpm -w typecheck 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "TypeCheck pasado"
        } else {
            Write-Warning-Custom "TypeCheck con errores"
        }
    } catch {
        $errorMsg = $_.Exception.Message
        Write-Warning-Custom "Error en typecheck: $errorMsg"
    }
    
    Pop-Location
} else {
    Write-Info "[DRY RUN] Se ejecutarían: pnpm -w lint && pnpm -w typecheck"
}

# ============================================================================
# FASE 6: BUILD FRONTEND
# ============================================================================

Write-Step "FASE 6: BUILD FRONTEND"

$distPath = Join-Path $WEB_DIR "dist\index.html"

if (-not (Test-Path $distPath)) {
    Write-Warning-Custom "Build de frontend NO existe"
    
    if (-not $DryRun) {
        Push-Location $WEB_DIR
        try {
            Write-Info "Ejecutando pnpm build..."
            pnpm build
            
            if (Test-Path $distPath) {
                Write-Success "Build generado exitosamente"
            } else {
                Write-Error-Custom "Build falló - dist/index.html no creado"
            }
        } catch {
            $errorMsg = $_.Exception.Message
            Write-Error-Custom "Error en build: $errorMsg"
        } finally {
            Pop-Location
        }
    } else {
        Write-Info "[DRY RUN] Se ejecutaría: pnpm build en apps/web"
    }
} else {
    Write-Success "Build de frontend existe"
}

# ============================================================================
# FASE 7: ARRANQUE DE SERVICIOS
# ============================================================================

Write-Step "FASE 7: ARRANQUE DE SERVICIOS"

if (-not $DryRun) {
    Write-Info "Arrancando servicios en background..."
    
    # Backend Node.js
    Write-Info "Arrancando Backend Node.js (puerto 3001)..."
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$API_NODE_DIR'; node server.js" -WindowStyle Minimized
    Start-Sleep -Seconds 3
    
    # Python Proxy
    Write-Info "Arrancando Python Proxy (puerto 8080)..."
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$API_PY_DIR'; python server.py" -WindowStyle Minimized
    Start-Sleep -Seconds 2
    
    # FastAPI Reception
    Write-Info "Arrancando FastAPI Reception (puerto 3101)..."
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$RECEPTION_DIR'; python -m uvicorn app:app --host 0.0.0.0 --port 3101" -WindowStyle Minimized
    Start-Sleep -Seconds 3
    
    # Frontend Vite
    Write-Info "Arrancando Frontend Vite (puerto 3000)..."
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$WEB_DIR'; pnpm dev" -WindowStyle Minimized
    Start-Sleep -Seconds 5
    
    Write-Success "Servicios iniciados (ventanas minimizadas)"
} else {
    Write-Info "[DRY RUN] Se arrancarían 4 servicios en background"
}

# ============================================================================
# FASE 8: HEALTH CHECKS
# ============================================================================

Write-Step "FASE 8: HEALTH CHECKS"

$healthChecks = @(
    @{ URL = "http://localhost:3000"; Name = "Frontend Vite" },
    @{ URL = "http://localhost:3001/health"; Name = "Backend Node.js" },
    @{ URL = "http://localhost:8080/api/health"; Name = "Python Proxy" },
    @{ URL = "http://localhost:3101/v1/health"; Name = "FastAPI Reception" }
)

$healthResults = @{}

foreach ($check in $healthChecks) {
    Write-Info "Verificando: $($check.Name)..."
    
    try {
        $response = Invoke-WebRequest -Uri $check.URL -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Success "$($check.Name) ✓ (200 OK)"
            $healthResults[$check.Name] = $true
        } else {
            Write-Warning-Custom "$($check.Name) ⚠ (Status: $($response.StatusCode))"
            $healthResults[$check.Name] = $false
        }
    } catch {
        Write-Error-Custom "$($check.Name) ✗ (No responde)"
        $healthResults[$check.Name] = $false
    }
}

# ============================================================================
# FASE 9: TESTS
# ============================================================================

Write-Step "FASE 9: EJECUCIÓN DE TESTS"

if (-not $DryRun) {
    Push-Location $ROOT
    
    Write-Info "Ejecutando test suite completo..."
    try {
        $testOutput = pnpm -w test 2>&1 | Tee-Object -Variable testResults
        
        # Parse resultados
        $passingMatch = $testResults | Select-String "(\d+) passed"
        $failingMatch = $testResults | Select-String "(\d+) failed"
        
        $passing = if ($passingMatch) { [int]$passingMatch.Matches[0].Groups[1].Value } else { 0 }
        $failing = if ($failingMatch) { [int]$failingMatch.Matches[0].Groups[1].Value } else { 0 }
        $total = $passing + $failing
        $percentage = if ($total -gt 0) { [math]::Round(($passing / $total) * 100, 2) } else { 0 }
        
        Write-Host "`n📊 RESULTADOS DE TESTS:"
        Write-Host "   ✅ Passing: $passing"
        Write-Host "   ❌ Failing: $failing"
        Write-Host "   📈 Total: $total"
        Write-Host "   📊 Porcentaje: $percentage%"
        
        if ($failing -eq 0) {
            Write-Success "TODOS LOS TESTS PASARON! 🎉"
        } elseif ($percentage -ge 95) {
            Write-Warning-Custom "Tests mayormente OK ($percentage%) - $failing fallos menores"
        } else {
            Write-Error-Custom "Tests con problemas significativos - $failing fallos"
        }
    } catch {
        $errorMsg = $_.Exception.Message
        Write-Error-Custom "Error ejecutando tests: $errorMsg"
    } finally {
        Pop-Location
    }
} else {
    Write-Info "[DRY RUN] Se ejecutarían: pnpm -w test"
}

# ============================================================================
# FASE 10: SEGURIDAD (Opcional)
# ============================================================================

if (-not $SkipSecurity) {
    Write-Step "FASE 10: REVISIÓN DE SEGURIDAD"
    
    Write-Warning-Custom "Verificando archivos .env en git..."
    
    Push-Location $ROOT
    $envFiles = git ls-files | Select-String "\.env$"
    
    if ($envFiles) {
        Write-Error-Custom "ARCHIVOS .ENV DETECTADOS EN GIT:"
        $envFiles | ForEach-Object { Write-Host "   ⚠️  $_" -ForegroundColor Red }
        
        if (-not $DryRun) {
            Write-Info "¿Desea removerlos del tracking? (S/N)"
            $response = Read-Host
            
            if ($response -eq "S" -or $response -eq "s") {
                foreach ($file in $envFiles) {
                    git rm --cached $file
                    Write-Success "Removido de git: $file"
                }
                
                # Actualizar .gitignore
                Add-Content -Path ".gitignore" -Value "`n# Environment files`n**/.env`n**/.env.*`n!**/.env.example"
                Write-Success ".gitignore actualizado"
            }
        }
    } else {
        Write-Success "No se encontraron archivos .env en git"
    }
    
    Pop-Location
}

# ============================================================================
# FASE 11: REPORTE FINAL
# ============================================================================

Write-Step "FASE 11: REPORTE FINAL"

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$reportPath = Join-Path $ROOT "REPAIR_REPORT_$((Get-Date).ToString('yyyyMMdd_HHmmss')).md"

$report = @"
# Reporte de Reparación del Monorepo ECONEURA

**Fecha:** $timestamp  
**Modo:** $(if ($DryRun) { "DRY RUN" } else { "EJECUCIÓN REAL" })

## Resumen Ejecutivo

### Health Checks

$(foreach ($check in $healthChecks) {
    $status = if ($healthResults[$check.Name]) { "✅ OK" } else { "❌ FAIL" }
    "- **$($check.Name):** $status - $($check.URL)"
})

### Archivos Críticos

- **App.tsx:** $(if (Test-Path $appTsxPath) { "✅ Existe" } else { "❌ Faltante" })
- **Build Frontend:** $(if (Test-Path $distPath) { "✅ Generado" } else { "❌ No generado" })

### Servicios Activos

$(foreach ($port in $ports.Keys) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conn) {
        $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
        "- **Puerto $port ($($ports[$port])):** ✅ Activo ($($proc.ProcessName) - PID $($conn.OwningProcess))"
    } else {
        "- **Puerto $port ($($ports[$port])):** ❌ Inactivo"
    }
})

## Próximos Pasos

$(if ($healthResults.Values -contains $false) {
    "⚠️ **ACCIÓN REQUERIDA:** Algunos servicios no respondieron a health checks."
    ""
    "### Servicios con problemas:"
    $(foreach ($key in $healthResults.Keys) {
        if (-not $healthResults[$key]) {
            "- $key"
        }
    })
    ""
    "### Debugging recomendado:"
    "1. Revisar logs de servicios fallidos"
    "2. Verificar variables de entorno (.env files)"
    "3. Comprobar dependencias instaladas"
    "4. Ejecutar servicios manualmente para ver errores"
} else {
    "✅ **TODOS LOS SERVICIOS FUNCIONANDO**"
    ""
    "El monorepo está operacional. Próximos pasos:"
    "1. Ejecutar tests end-to-end manuales"
    "2. Configurar webhooks Make.com"
    "3. Validar flujos completos"
    "4. Preparar para deploy"
})

---

*Generado automáticamente por REPAIR_MONOREPO.ps1*
"@

if (-not $DryRun) {
    Set-Content -Path $reportPath -Value $report
    Write-Success "Reporte guardado: $reportPath"
} else {
    Write-Info "[DRY RUN] Reporte NO guardado"
}

# ============================================================================
# CONCLUSIÓN
# ============================================================================

Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║              🎉 REPARACIÓN COMPLETADA 🎉                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Green

$successCount = ($healthResults.Values | Where-Object { $_ -eq $true }).Count
$totalChecks = $healthResults.Count
$successRate = [math]::Round(($successCount / $totalChecks) * 100, 0)

Write-Host "📊 Health Checks: $successCount/$totalChecks ($successRate%)" -ForegroundColor Cyan

if ($successRate -eq 100) {
    Write-Success "¡MONOREPO COMPLETAMENTE FUNCIONAL!"
} elseif ($successRate -ge 75) {
    Write-Warning-Custom "Monorepo mayormente funcional - revisar servicios fallidos"
} else {
    Write-Error-Custom "Monorepo con problemas críticos - investigación requerida"
}

Write-Host "`nPróximos comandos útiles:" -ForegroundColor Yellow
Write-Host "  - Abrir frontend: " -NoNewline; Write-Host "http://localhost:3000" -ForegroundColor Cyan
Write-Host "  - Ver logs: " -NoNewline; Write-Host "Get-Process | Where-Object ProcessName -in @('node','python')" -ForegroundColor Cyan
Write-Host "  - Tests: " -NoNewline; Write-Host "pnpm -w test" -ForegroundColor Cyan
Write-Host "  - Reporte: " -NoNewline; Write-Host "$reportPath" -ForegroundColor Cyan

Write-Host ""
