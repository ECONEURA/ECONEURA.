#!/usr/bin/env pwsh
# RUN_CREATE_ASSISTANTS.ps1 - Ejecuta el script de creación de Assistants

Write-Host "🚀 Creando 10 OpenAI Assistants..." -ForegroundColor Cyan

# Cambiar al directorio api_node para tener acceso a node_modules
cd apps/api_node

# Ejecutar el script con node
node ../../scripts/create-openai-assistants.js

# Volver al directorio raíz
cd ../..

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Assistants creados exitosamente" -ForegroundColor Green
    Write-Host "📄 Verifica: apps/api_node/config/agents.json" -ForegroundColor Yellow
} else {
    Write-Host "`n❌ Error al crear Assistants" -ForegroundColor Red
    exit 1
}
