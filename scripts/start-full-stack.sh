#!/usr/bin/env bash
##############################################################################
# ECONEURA - Script de Inicio Completo
# Arranca: Backend Node.js + Frontend Cockpit + Servicios FastAPI (opcional)
##############################################################################

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Iniciando ECONEURA Stack Completo...${NC}"
echo ""

# Verificar dependencias
command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js no encontrado${NC}"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo -e "${RED}❌ pnpm no encontrado${NC}"; exit 1; }

# Variables
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Cargar variables de entorno
if [ -f ".env.local" ]; then
  echo -e "${GREEN}✅ Cargando .env.local${NC}"
  export $(cat .env.local | grep -v '^#' | xargs)
else
  echo -e "${YELLOW}⚠️  .env.local no encontrado, usando valores por defecto${NC}"
fi

# Array para PIDs
declare -a PIDS

# Función para limpiar procesos al salir
cleanup() {
  echo ""
  echo -e "${YELLOW}🛑 Deteniendo todos los servicios...${NC}"
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  # Matar procesos uvicorn
  pkill -f "uvicorn app:app" 2>/dev/null || true
  echo -e "${GREEN}✅ Servicios detenidos${NC}"
  exit 0
}

trap cleanup INT TERM EXIT

# ============================================
# 1. BACKEND NODE.JS (puerto 8080)
# ============================================
echo -e "${BLUE}📦 Iniciando Backend Node.js en puerto 8080...${NC}"
cd apps/api_node
if [ ! -f "server.js" ]; then
  echo -e "${RED}❌ apps/api_node/server.js no encontrado${NC}"
  exit 1
fi

PORT=8080 node server.js > ../../logs/backend-node.log 2>&1 &
BACKEND_PID=$!
PIDS+=($BACKEND_PID)
echo -e "${GREEN}  → Backend Node.js iniciado (PID: $BACKEND_PID)${NC}"
cd ../..

# Esperar a que backend esté listo
echo -e "${YELLOW}  → Esperando backend...${NC}"
for i in {1..10}; do
  if curl -s http://localhost:8080/api/health >/dev/null 2>&1; then
    echo -e "${GREEN}  ✅ Backend listo!${NC}"
    break
  fi
  if [ $i -eq 10 ]; then
    echo -e "${RED}  ❌ Backend no responde después de 10 intentos${NC}"
    exit 1
  fi
  sleep 1
done

# ============================================
# 2. FRONTEND COCKPIT (puerto 3000)
# ============================================
echo ""
echo -e "${BLUE}🌐 Iniciando Frontend Cockpit en puerto 3000...${NC}"
cd apps/web

# Verificar que existe vite.config.ts
if [ ! -f "vite.config.ts" ]; then
  echo -e "${RED}❌ apps/web/vite.config.ts no encontrado${NC}"
  exit 1
fi

pnpm dev > ../../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
PIDS+=($FRONTEND_PID)
echo -e "${GREEN}  → Frontend Cockpit iniciado (PID: $FRONTEND_PID)${NC}"
cd ../..

# Esperar a que frontend esté listo
echo -e "${YELLOW}  → Esperando frontend...${NC}"
for i in {1..15}; do
  if curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo -e "${GREEN}  ✅ Frontend listo!${NC}"
    break
  fi
  if [ $i -eq 15 ]; then
    echo -e "${YELLOW}  ⚠️  Frontend no responde (puede tardar más en iniciar)${NC}"
  fi
  sleep 1
done

# ============================================
# 3. SERVICIOS FASTAPI (OPCIONAL)
# ============================================
START_FASTAPI="${START_FASTAPI:-0}"

if [ "$START_FASTAPI" = "1" ]; then
  echo ""
  echo -e "${BLUE}🤖 Iniciando servicios FastAPI...${NC}"
  
  # Verificar Python y uvicorn
  command -v python >/dev/null 2>&1 || { echo -e "${RED}❌ Python no encontrado${NC}"; exit 1; }
  command -v uvicorn >/dev/null 2>&1 || { echo -e "${YELLOW}⚠️  uvicorn no encontrado, instalando...${NC}"; pip install uvicorn fastapi; }
  
  # Puertos base
  BASE_PORT=8101
  SERVICES=("analytics" "cdo" "cfo" "chro" "ciso" "cmo" "cto" "legal" "reception" "research" "support")
  
  for i in "${!SERVICES[@]}"; do
    service="${SERVICES[$i]}"
    port=$((BASE_PORT + i))
    
    if [ -d "services/neuras/$service" ]; then
      echo -e "${YELLOW}  → Iniciando $service en puerto $port...${NC}"
      cd "services/neuras/$service"
      PORT=$port uvicorn app:app --host 127.0.0.1 --port $port --reload > "../../../logs/fastapi-$service.log" 2>&1 &
      SERVICE_PID=$!
      PIDS+=($SERVICE_PID)
      echo -e "${GREEN}    ✅ $service (PID: $SERVICE_PID)${NC}"
      cd ../../..
    else
      echo -e "${RED}    ❌ $service no encontrado${NC}"
    fi
  done
  
  echo -e "${GREEN}✅ Servicios FastAPI iniciados${NC}"
else
  echo ""
  echo -e "${YELLOW}ℹ️  Servicios FastAPI NO iniciados (set START_FASTAPI=1 para arrancarlos)${NC}"
fi

# ============================================
# RESUMEN Y HEALTH CHECKS
# ============================================
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ ECONEURA Stack iniciado correctamente${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📍 URLs de acceso:${NC}"
echo -e "  ${YELLOW}→${NC} Frontend Cockpit:  ${GREEN}http://localhost:3000${NC}"
echo -e "  ${YELLOW}→${NC} Backend Node.js:   ${GREEN}http://localhost:8080${NC}"
if [ "$START_FASTAPI" = "1" ]; then
  echo -e "  ${YELLOW}→${NC} Servicios FastAPI: ${GREEN}http://localhost:8101-8111${NC}"
fi
echo ""
echo -e "${BLUE}🔍 Health Checks:${NC}"
curl -s http://localhost:8080/api/health | jq '.' 2>/dev/null || echo "  ⚠️  Backend health check falló (jq no instalado?)"
echo ""
echo -e "${BLUE}📊 Observabilidad (si está corriendo Docker):${NC}"
echo -e "  ${YELLOW}→${NC} Jaeger UI:    ${GREEN}http://localhost:16686${NC}"
echo -e "  ${YELLOW}→${NC} Prometheus:   ${GREEN}http://localhost:9090${NC}"
echo -e "  ${YELLOW}→${NC} Grafana:      ${GREEN}http://localhost:3001${NC}"
echo ""
echo -e "${BLUE}📝 Logs:${NC}"
echo -e "  ${YELLOW}→${NC} Backend:  tail -f logs/backend-node.log"
echo -e "  ${YELLOW}→${NC} Frontend: tail -f logs/frontend.log"
if [ "$START_FASTAPI" = "1" ]; then
  echo -e "  ${YELLOW}→${NC} FastAPI:  tail -f logs/fastapi-*.log"
fi
echo ""
echo -e "${YELLOW}Presiona Ctrl+C para detener todos los servicios${NC}"
echo ""

# Mantener script corriendo
wait
