# 🔍 PRE-FLIGHT CHECK - ECONEURA MONOREPO
**Fecha:** 8 de Octubre 2025  
**Propósito:** Análisis exhaustivo antes del arranque completo del sistema

---

## 📊 RESUMEN EJECUTIVO

| Componente | Estado | Bloqueante | Acción Requerida |
|------------|--------|------------|------------------|
| **Node.js** | ✅ v24.8.0 | NO | Ninguna |
| **pnpm** | ✅ 8.15.5 | NO | Ninguna |
| **Python** | ❌ NO INSTALADO | **SÍ** | Instalar Python 3.11+ |
| **Docker** | ❌ NO INSTALADO | NO | Opcional (DB local) |
| **Frontend (apps/web)** | ✅ LISTO | NO | Puede arrancar |
| **Backend (apps/api_py)** | ❌ BLOQUEADO | **SÍ** | Requiere Python |
| **Base de Datos** | ✅ SCHEMA LISTO | NO | Docker o Postgres local |
| **11 Microservicios** | ⚠️ CÓDIGO LISTO | NO | Requieren Python + Postgres |

---

## 🎯 ARQUITECTURA REAL (VERIFICADA)

### 1. **Frontend Apps**
```
apps/web/                    ✅ FUNCIONAL
├── src/EconeuraCockpit.tsx  ✅ Completo con voz
├── package.json             ✅ Dependencies OK
├── vite.config.ts           ✅ Puerto 3000
└── .env.local               ✅ Creado recientemente

apps/cockpit/                ⚠️ SIN DOCUMENTAR
└── (propósito duplicado?)
```

**Verificación:**
- ✅ React 18.2.0 instalado
- ✅ Vite 5.0.0 configurado
- ✅ TypeScript config OK
- ✅ Lucide icons 0.441.0
- ✅ Tailwind CSS configurado

**Comando de arranque:**
```bash
cd apps/web
pnpm dev
# → http://localhost:3000
```

---

### 2. **Backend Python Proxy**
```
apps/api_py/
├── server.py                ✅ 69 líneas, HTTP proxy
└── requirements.txt         ❓ NO VERIFICADO
```

**Verificación:**
- ✅ Código Python limpio (stdlib only)
- ✅ Enruta 11 agentes: neura-1 a neura-11
- ✅ Lee `packages/configs/agent-routing.json`
- ❌ **Python NO instalado en el sistema**

**Dependencias detectadas:**
```python
# Imports en server.py:
import json, re, sys, os, datetime
import urllib.request, urllib.error
from http.server import BaseHTTPRequestHandler, HTTPServer
```
**Todas son stdlib** → No requiere `pip install`

**BLOQUEANTE:** Python no está en PATH

---

### 3. **Configuración de Agentes**
```
packages/configs/
└── agent-routing.json       ✅ EXISTE (126 líneas)
```

**Verificación:**
```json
{
  "routes": [
    { "id": "neura-1", "dept": "analytics", "port": 8101, "url": "https://hook.us2.make.com/analytics" },
    { "id": "neura-2", "dept": "cdo", "port": 8102, "url": "https://hook.us2.make.com/cdo" },
    ...
    { "id": "neura-11", "dept": "support", "port": 8111, "url": "https://hook.us2.make.com/support" }
  ]
}
```

✅ **11 agentes configurados correctamente**

---

### 4. **Microservicios FastAPI (11 servicios)**
```
services/neuras/
├── analytics/    ✅ 250 líneas, completo
├── cdo/          ✅ Completo
├── cfo/          ✅ Completo
├── chro/         ✅ Completo
├── ciso/         ✅ Completo
├── cmo/          ✅ Completo
├── cto/          ✅ Completo
├── legal/        ✅ Completo
├── reception/    ✅ Completo
├── research/     ✅ Completo
└── support/      ✅ Completo
```

**Verificación en `services/neuras/analytics/app.py`:**
```python
from fastapi import FastAPI, Request, Header
from fastapi.responses import JSONResponse
import psycopg2  # ← Requiere instalación
import httpx     # ← Requiere instalación
from opentelemetry import trace  # ← Requiere instalación
```

**Dependencias por servicio:**
- FastAPI
- psycopg2 (conexión Postgres)
- httpx (HTTP client)
- opentelemetry (observabilidad)
- pydantic

**BLOQUEANTE:** Python + dependencias no instaladas

---

### 5. **Base de Datos**
```
db/
├── init/
│   ├── 01-schema.sql        ✅ 216 líneas, schema completo
│   └── 02-rls.sql           ✅ RLS configurado
├── seeds/                   ⚠️ (no verificado)
└── migrations/              ⚠️ (no verificado)

docker-compose.dev.enhanced.yml  ✅ Postgres 16 configurado
```

**Verificación en `01-schema.sql`:**
```sql
-- Tablas verificadas:
✅ users (id UUID, email, role, password_hash)
✅ agents (id VARCHAR, area, status, config JSONB)
✅ invocations (registro de llamadas)
✅ sessions (sesiones de chat)
✅ feedback (calidad de respuestas)
```

**Docker Compose:**
```yaml
postgres:
  image: postgres:16-alpine
  ports: ["5432:5432"]
  environment:
    POSTGRES_DB: econeura_dev
    POSTGRES_USER: econeura
    POSTGRES_PASSWORD: dev_password
```

**BLOQUEANTE:** Docker no instalado (alternativa: Postgres local)

---

## ❌ PROBLEMAS CRÍTICOS DETECTADOS

### 1. **Python NO Instalado**
```powershell
PS> python --version
Python was not found; run without arguments to install from the Microsoft Store
```

**Impacto:**
- ❌ No se puede arrancar `apps/api_py/server.py`
- ❌ No se pueden ejecutar microservicios FastAPI
- ❌ No hay backend funcional

**Solución:**
```powershell
# Opción 1: Microsoft Store (más fácil)
# Buscar "Python 3.11" en Microsoft Store

# Opción 2: python.org
# https://www.python.org/downloads/
# Descargar Python 3.11+ Windows installer
# ✅ Marcar "Add Python to PATH"
```

---

### 2. **Docker NO Instalado**
```powershell
PS> docker --version
docker: The term 'docker' is not recognized
```

**Impacto:**
- ⚠️ No se puede usar `docker-compose.dev.enhanced.yml`
- ⚠️ Postgres debe instalarse localmente
- ⚠️ Jaeger, Prometheus, Grafana no disponibles

**Solución (OPCIONAL):**
```powershell
# Opción 1: Docker Desktop
# https://www.docker.com/products/docker-desktop/

# Opción 2: Postgres local
# https://www.postgresql.org/download/windows/
# Instalar Postgres 16
# Puerto: 5432
# Usuario: econeura
# Password: dev_password
# Database: econeura_dev
```

---

### 3. **Errores TypeScript/ESLint (NO BLOQUEANTES)**

**EconeuraCockpit.tsx:**
```typescript
// Línea 791, 852: CSS inline styles
style={{ color: pal.textHex }}  // ← ESLint warning
```

**apps/web/tsconfig.json:**
```json
{
  "compilerOptions": {
    // ← Falta "forceConsistentCasingInFileNames": true
  }
}
```

**Solución:** Arreglar después del arranque (no crítico)

---

## ✅ COMPONENTES LISTOS PARA ARRANCAR

### 1. **Frontend Web (SIN BACKEND)**
```bash
# Terminal 1
cd apps/web
pnpm install  # Si es necesario
pnpm dev
# → http://localhost:3000

# Estado: MODO SIMULACIÓN
# - UI completa funcional ✅
# - Voice system funcional ✅
# - API calls → 404 (sin backend) ❌
```

---

### 2. **HTML Preview (STANDALONE)**
```bash
# Ya está corriendo en:
http://localhost:55712/apps/web/cockpit-preview.html

# Estado: FUNCIONAL
# - 100% standalone ✅
# - No requiere backend ✅
# - Modo simulación ✅
```

---

## 🚀 PLAN DE ARRANQUE COMPLETO

### **FASE 1: Instalar Python** (CRÍTICO)
```powershell
# 1. Descargar Python 3.11+
# https://www.python.org/downloads/

# 2. Instalar con opciones:
# ✅ Add Python to PATH
# ✅ Install pip
# ✅ Install for all users (opcional)

# 3. Verificar instalación
python --version
pip --version
```

---

### **FASE 2: Instalar Dependencias Python**
```bash
# Backend proxy (apps/api_py)
cd apps/api_py
# NO requiere pip install (solo stdlib)

# Microservicios (services/neuras)
cd services/neuras/analytics
pip install -r requirements.txt
# Repetir para cada servicio
```

---

### **FASE 3: Arrancar Base de Datos**

**Opción A: Docker (recomendado)**
```bash
# Instalar Docker Desktop primero
docker-compose -f docker-compose.dev.enhanced.yml up -d postgres
```

**Opción B: Postgres Local**
```bash
# Instalar Postgres 16
# Crear database:
psql -U postgres
CREATE DATABASE econeura_dev;
CREATE USER econeura WITH PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE econeura_dev TO econeura;

# Ejecutar schema:
psql -U econeura -d econeura_dev -f db/init/01-schema.sql
psql -U econeura -d econeura_dev -f db/init/02-rls.sql
```

---

### **FASE 4: Arrancar Servicios**

**Terminal 1: Backend Python Proxy**
```bash
cd apps/api_py
python server.py
# → http://localhost:8080/api/health
```

**Terminal 2: Frontend Web**
```bash
cd apps/web
pnpm dev
# → http://localhost:3000
```

**Terminal 3-13: Microservicios (opcional)**
```bash
# Ejemplo: Analytics
cd services/neuras/analytics
uvicorn app:app --host 0.0.0.0 --port 8101
```

---

## 🧪 TESTS DE VERIFICACIÓN

### **Test 1: Frontend Solo**
```bash
curl http://localhost:3000
# Esperado: HTML del Cockpit
```

### **Test 2: Backend Health**
```bash
curl http://localhost:8080/api/health
# Esperado: {"ok":true,"mode":"sim","ts":"..."}
```

### **Test 3: Backend con Make.com**
```bash
# Configurar variables
export MAKE_FORWARD=1
export MAKE_TOKEN=tu-token-aqui

# Reiniciar backend
python apps/api_py/server.py

# Test invoke
curl -X POST http://localhost:8080/api/invoke/neura-1 \
  -H "Authorization: Bearer test" \
  -H "X-Route: azure" \
  -H "X-Correlation-Id: test-123" \
  -H "Content-Type: application/json" \
  -d '{"input":"test"}'

# Esperado: respuesta de Make.com
```

### **Test 4: Microservicio Analytics**
```bash
curl http://localhost:8101/health
# Esperado: {"status":"healthy"}
```

### **Test 5: Base de Datos**
```bash
psql -U econeura -d econeura_dev -c "SELECT COUNT(*) FROM agents;"
# Esperado: número de agentes
```

---

## 📋 CHECKLIST PRE-ARRANQUE

- [ ] Python 3.11+ instalado
- [ ] `python --version` funciona
- [ ] `pip --version` funciona
- [ ] Postgres 16 instalado (Docker o local)
- [ ] Schema de BD ejecutado (`01-schema.sql`)
- [ ] RLS configurado (`02-rls.sql`)
- [ ] Dependencias Python instaladas (FastAPI, psycopg2, etc.)
- [ ] Variables de entorno configuradas (`.env.local`)
- [ ] `pnpm install` ejecutado en workspace
- [ ] Puerto 3000 libre (frontend)
- [ ] Puerto 8080 libre (backend)
- [ ] Puertos 8101-8111 libres (microservicios)
- [ ] Puerto 5432 libre (Postgres)

---

## 🎯 DECISIÓN: ¿QUÉ ARRANCAR AHORA?

### **Opción 1: FRONTEND SOLO (INMEDIATO)**
```bash
cd apps/web && pnpm dev
# ✅ Funciona SIN Python
# ✅ Funciona SIN Postgres
# ⚠️ API calls fallan (esperado)
```

### **Opción 2: SISTEMA COMPLETO (REQUIERE SETUP)**
```bash
# 1. Instalar Python ← BLOQUEANTE
# 2. Instalar Postgres
# 3. Ejecutar schema.sql
# 4. Arrancar backend
# 5. Arrancar frontend
# ✅ Todo funcional
```

### **Opción 3: PREVIEW HTML (YA CORRIENDO)**
```
http://localhost:55712/apps/web/cockpit-preview.html
# ✅ Funcional
# ✅ Standalone
# ⚠️ Modo simulación
```

---

## 💡 RECOMENDACIÓN

**Para DESARROLLO RÁPIDO:**
1. ✅ Instalar Python 3.11+ (5 minutos)
2. ✅ Arrancar backend proxy (1 minuto)
3. ✅ Arrancar frontend (1 minuto)
4. ⏳ Postgres + microservicios (después)

**Para DEMO INMEDIATA:**
- Usar HTML preview (ya funcional)
- Mostrar UI completa sin backend

---

## 📞 PRÓXIMOS PASOS

**¿Qué quieres hacer?**

1. **"INSTALAR PYTHON Y ARRANCAR"** → Te guío paso a paso
2. **"ARRANCAR SOLO FRONTEND"** → `cd apps/web && pnpm dev`
3. **"USAR HTML PREVIEW"** → Ya está en `localhost:55712`
4. **"SETUP COMPLETO CON DOCKER"** → Instalar Docker primero

**Dime tu elección y ejecuto inmediatamente.** 🚀
