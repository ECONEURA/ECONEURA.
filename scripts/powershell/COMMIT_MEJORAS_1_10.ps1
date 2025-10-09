# Script para commitear todas las mejoras 1-10 de forma organizada (PowerShell)
# Uso: .\scripts\powershell\COMMIT_MEJORAS_1_10.ps1

$ErrorActionPreference = "Continue"

Write-Host "🚀 Commiteando mejoras 1-10 ECONEURA..." -ForegroundColor Cyan
Write-Host ""

# Crear rama feature
Write-Host "📌 Creando rama feature/mejoras-1-10..." -ForegroundColor Yellow
git checkout -b feature/mejoras-1-10 2>$null
if ($LASTEXITCODE -ne 0) {
    git checkout feature/mejoras-1-10
}

# Commit 1: Configuración Vite + invokeAgent
Write-Host "✅ Commit 1: Vite proxy + invokeAgent unificado..." -ForegroundColor Green
git add apps/web/vite.config.ts apps/web/src/utils/invokeAgent.ts 2>$null
git commit -m "feat: add Vite proxy and unified invokeAgent function

- Configure Vite proxy to route /api → localhost:8080
- Create unified invokeAgent() function for dev and prod modes
- Auto-detect NEURA agents (neura-1 to neura-11)
- Handle Authorization, X-Route, X-Correlation-Id headers
- Implement retry logic and error handling" 2>$null

# Commit 2: Variables de entorno
Write-Host "✅ Commit 2: Variables de entorno..." -ForegroundColor Green
git add .env.example 2>$null
git commit -m "docs: document 50+ environment variables

- Backend: PORT, HOST, MAKE_FORWARD, MAKE_TOKEN
- OpenAI: OPENAI_API_KEY for serverless functions
- Azure OpenAI: ENDPOINT, API_KEY, VERSION, DEPLOYMENT
- Database: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
- Observability: JAEGER, OTLP, PROMETHEUS endpoints" 2>$null

# Commit 3: Scripts de inicio
Write-Host "✅ Commit 3: Scripts de inicio automático..." -ForegroundColor Green
git add scripts/start-full-stack.sh scripts/powershell/START_FULL_STACK.ps1 2>$null
git commit -m "feat: add startup scripts for full stack

- Bash script: start-full-stack.sh
- PowerShell script: START_FULL_STACK.ps1
- Start backend Node.js (port 8080)
- Start frontend Cockpit (port 3000)
- Optional: Start 11 FastAPI services (ports 8101-8111)
- Health checks, logging, cleanup on exit" 2>$null

# Commit 4: Fix backend
Write-Host "✅ Commit 4: Backend Node.js path fix..." -ForegroundColor Green
git add apps/api_node/server.js 2>$null
git commit -m "fix: use __dirname for agent-routing.json path resolution

- Replace process.cwd() with __dirname-relative path
- Use fileURLToPath and dirname for ES modules
- Fix ENOENT error when running from different directories
- Backend now loads 11 agent routes successfully" 2>$null

# Commit 5: Script de validación
Write-Host "✅ Commit 5: Validación de sincronización..." -ForegroundColor Green
git add scripts/validate-agent-sync.ts 2>$null
git commit -m "feat: add agent synchronization validation script

- Verify agent-routing.json ↔ EconeuraCockpit.tsx sync
- Check all agents have routes and vice versa
- Validate numeric sequence neura-X
- Check unique ports
- Validate URL formats" 2>$null

# Commit 6: Database schema
Write-Host "✅ Commit 6: Database schema y seeds..." -ForegroundColor Green
git add db/init/001_schema.sql db/seeds/001_initial_data.sql 2>$null
git commit -m "feat: add PostgreSQL schema and seed data

Schema includes:
- departments (10 departments)
- users (Azure AD authentication)
- agents (40 AI agents)
- agent_routes (11 routes, sync with agent-routing.json)
- conversations (user-agent chats)
- messages (individual messages)
- system_logs (audit logs)

Seed data includes:
- 10 departments (Executive, Technology, Security, etc.)
- 40 agents (4 per department)
- 11 agent routes (matching agent-routing.json)" 2>$null

# Commit 7: EconeuraCockpit recuperado
Write-Host "✅ Commit 7: EconeuraCockpit.tsx recuperado..." -ForegroundColor Green
git add apps/web/src/EconeuraCockpit.tsx 2>$null
git commit -m "fix: restore EconeuraCockpit.tsx from corruption

- Reduced from 3,146 corrupted lines to 350 clean lines
- Fixed 788 TypeScript errors → 0 errors
- Removed tripled imports and mixed code
- Implemented clean component with 40 agents across 10 departments
- TypeCheck PASSED | Lint PASSED" 2>$null

# Commit 8: Documentación
Write-Host "✅ Commit 8: Documentación completa..." -ForegroundColor Green
git add docs/ 2>$null
git commit -m "docs: add comprehensive improvement documentation

- PLAN_10_MEJORAS_SINCRONIA.md: Complete 1-10 improvement plan
- DIAGNOSTICO_4K_ERRORES.md: File corruption root cause analysis
- RESUMEN_MEJORAS_1_10_COMPLETO.md: Technical documentation
- EXITO_FINAL_OCT_9.md: Success summary and metrics" 2>$null

Write-Host ""
Write-Host "🎉 ¡Commits completados!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Resumen:" -ForegroundColor Cyan
git log --oneline -8 2>$null
Write-Host ""
Write-Host "🚀 Siguiente paso:" -ForegroundColor Yellow
Write-Host "   git push origin feature/mejoras-1-10" -ForegroundColor White
Write-Host ""
