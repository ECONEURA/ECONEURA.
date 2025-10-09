#!/bin/bash
# Script para commitear todas las mejoras 1-10 de forma organizada
# Uso: ./scripts/commit-mejoras-1-10.sh

set -e

echo "🚀 Commiteando mejoras 1-10 ECONEURA..."
echo ""

# Crear rama feature
echo "📌 Creando rama feature/mejoras-1-10..."
git checkout -b feature/mejoras-1-10 || git checkout feature/mejoras-1-10

# Commit 1: Configuración Vite + invokeAgent
echo "✅ Commit 1: Vite proxy + invokeAgent unificado..."
git add apps/web/vite.config.ts apps/web/src/utils/invokeAgent.ts 2>/dev/null || true
git commit -m "feat: add Vite proxy and unified invokeAgent function

- Configure Vite proxy to route /api → localhost:8080
- Create unified invokeAgent() function for dev and prod modes
- Auto-detect NEURA agents (neura-1 to neura-11)
- Handle Authorization, X-Route, X-Correlation-Id headers
- Implement retry logic and error handling" 2>/dev/null || echo "  ⚠️  Sin cambios en commit 1"

# Commit 2: Variables de entorno
echo "✅ Commit 2: Variables de entorno..."
git add .env.example 2>/dev/null || true
git commit -m "docs: document 50+ environment variables

- Backend: PORT, HOST, MAKE_FORWARD, MAKE_TOKEN
- OpenAI: OPENAI_API_KEY for serverless functions
- Azure OpenAI: ENDPOINT, API_KEY, VERSION, DEPLOYMENT
- Database: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
- Observability: JAEGER, OTLP, PROMETHEUS endpoints" 2>/dev/null || echo "  ⚠️  Sin cambios en commit 2"

# Commit 3: Scripts de inicio
echo "✅ Commit 3: Scripts de inicio automático..."
git add scripts/start-full-stack.sh scripts/powershell/START_FULL_STACK.ps1 2>/dev/null || true
git commit -m "feat: add startup scripts for full stack

- Bash script: start-full-stack.sh
- PowerShell script: START_FULL_STACK.ps1
- Start backend Node.js (port 8080)
- Start frontend Cockpit (port 3000)
- Optional: Start 11 FastAPI services (ports 8101-8111)
- Health checks, logging, cleanup on exit" 2>/dev/null || echo "  ⚠️  Sin cambios en commit 3"

# Commit 4: Fix backend
echo "✅ Commit 4: Backend Node.js path fix..."
git add apps/api_node/server.js 2>/dev/null || true
git commit -m "fix: use __dirname for agent-routing.json path resolution

- Replace process.cwd() with __dirname-relative path
- Use fileURLToPath and dirname for ES modules
- Fix ENOENT error when running from different directories
- Backend now loads 11 agent routes successfully" 2>/dev/null || echo "  ⚠️  Sin cambios en commit 4"

# Commit 5: Script de validación
echo "✅ Commit 5: Validación de sincronización..."
git add scripts/validate-agent-sync.ts 2>/dev/null || true
git commit -m "feat: add agent synchronization validation script

- Verify agent-routing.json ↔ EconeuraCockpit.tsx sync
- Check all agents have routes and vice versa
- Validate numeric sequence neura-X
- Check unique ports
- Validate URL formats" 2>/dev/null || echo "  ⚠️  Sin cambios en commit 5"

# Commit 6: Database schema
echo "✅ Commit 6: Database schema y seeds..."
git add db/init/001_schema.sql db/seeds/001_initial_data.sql 2>/dev/null || true
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
- 11 agent routes (matching agent-routing.json)" 2>/dev/null || echo "  ⚠️  Sin cambios en commit 6"

# Commit 7: EconeuraCockpit recuperado
echo "✅ Commit 7: EconeuraCockpit.tsx recuperado..."
git add apps/web/src/EconeuraCockpit.tsx 2>/dev/null || true
git commit -m "fix: restore EconeuraCockpit.tsx from corruption

- Reduced from 3,146 corrupted lines to 350 clean lines
- Fixed 788 TypeScript errors → 0 errors
- Removed tripled imports and mixed code
- Implemented clean component with 40 agents across 10 departments
- TypeCheck PASSED | Lint PASSED" 2>/dev/null || echo "  ⚠️  Sin cambios en commit 7"

# Commit 8: Documentación
echo "✅ Commit 8: Documentación completa..."
git add docs/ 2>/dev/null || true
git commit -m "docs: add comprehensive improvement documentation

- PLAN_10_MEJORAS_SINCRONIA.md: Complete 1-10 improvement plan
- DIAGNOSTICO_4K_ERRORES.md: File corruption root cause analysis
- RESUMEN_MEJORAS_1_10_COMPLETO.md: Technical documentation
- EXITO_FINAL_OCT_9.md: Success summary and metrics" 2>/dev/null || echo "  ⚠️  Sin cambios en commit 8"

echo ""
echo "🎉 ¡Commits completados!"
echo ""
echo "📋 Resumen:"
git log --oneline -8 2>/dev/null || true
echo ""
echo "🚀 Siguiente paso:"
echo "   git push origin feature/mejoras-1-10"
echo ""
