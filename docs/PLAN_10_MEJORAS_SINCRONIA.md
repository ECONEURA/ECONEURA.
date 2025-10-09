# 🎯 PLAN DE 10 MEJORAS CRÍTICAS - SINCRONÍA COMPLETA MONOREPO

**Fecha:** 9 de octubre de 2025  
**Objetivo:** Sincronizar frontend (Cockpit), backend (Node/Python), servicios FastAPI y configuración completa

---

## 📊 ESTADO ACTUAL DETECTADO

### ✅ **LO QUE FUNCIONA**
1. Cockpit visible en Vercel: https://econeura-cockpit.vercel.app ✅
2. OpenAI endpoint `/api/chat.js` creado y funcional ✅
3. 11 servicios FastAPI en `services/neuras/` (analytics, cdo, cfo, chro, ciso, cmo, cto, legal, reception, research, support) ✅
4. Backend Node.js en `apps/api_node/server.js` (puerto 8080) ✅
5. Backend Python en `apps/api_py/server.py` (puerto 8080, legacy) ✅
6. Configuración de rutas en `packages/configs/agent-routing.json` ✅

### ❌ **LO QUE FALLA**
1. **Chat no conecta a OpenAI correctamente** - invokeAgent() en Cockpit no llama al backend real
2. **Backend Node.js NO integrado con Vite dev server** - no hay proxy configurado
3. **Servicios FastAPI en `services/neuras/` NO arrancados** - no hay script de inicio
4. **Sin variables de entorno unificadas** - `.env` inconsistente entre apps/web, api_node, api_py
5. **agent-routing.json NO sincronizado con Cockpit** - 11 servicios vs 10 departamentos
6. **Sin base de datos inicializada** - `db/init/`, `db/seeds/`, `db/migrations/` vacíos
7. **invokeAgent() en producción llama a `/api/chat`** pero NO al backend Node/Python
8. **Sin observabilidad funcional** - OTLP stub sin implementar
9. **Scripts de inicio fragmentados** - `start-dev.sh` no arranca todo el stack
10. **Sin tests de integración** - frontend y backend no verifican conexión

---

## 🔧 MEJORA #1: Proxy Vite → Backend Node.js (CRÍTICO)

**Problema:** Cockpit en dev (localhost:3000) no puede llamar a backend Node.js (localhost:8080)

**Solución:**
```typescript
// apps/web/vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 3000,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/dev-mock-ai': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/dev-mock-ai/, '/'),
      },
    },
  },
  preview: { host: '127.0.0.1', port: 3000 },
});
```

**Resultado:** Cockpit → `/api/invoke/neura-1` → `http://localhost:8080/api/invoke/neura-1` → Backend Node.js

---

## 🔧 MEJORA #2: invokeAgent() Unificado en Cockpit

**Problema:** invokeAgent() en producción llama a `/api/chat` (serverless), pero en local debe llamar a `/api/invoke/:agentId`

**Solución:**
```typescript
// apps/web/src/utils/invokeAgent.ts (NUEVO)
async function invokeAgent(agentId: string, route: 'local' | 'azure' = 'azure', payload: any = {}) {
  const isDev = import.meta.env.DEV;
  const isProd = import.meta.env.PROD;
  
  // En producción (Vercel): usar /api/chat serverless
  if (isProd) {
    const neuraAgents = ['ceo', 'cfo', 'cto', 'cmo', 'chro', 'ciso', 'cdo', 'legal', 'research', 'reception', 'support'];
    const isNeuraAgent = neuraAgents.some(dept => agentId.toLowerCase().includes(dept));
    
    if (isNeuraAgent) {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agentId.toLowerCase().replace(/[^a-z]/g, ''),
          message: payload?.input ?? 'Hola',
          context: payload?.context ?? {}
        }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        return { ok: false, output: `Error OpenAI: ${error.error || 'No disponible'}` };
      }
      const data = await res.json();
      return { ok: true, output: data.message || 'Sin respuesta' };
    }
  }
  
  // En desarrollo (local): usar backend Node.js en /api/invoke
  if (isDev) {
    const res = await fetch(`/api/invoke/${agentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer dev-token-123',
        'X-Route': route,
        'X-Correlation-Id': `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const error = await res.text();
      return { ok: false, output: `Error backend: ${error}` };
    }
    const data = await res.json();
    return { ok: true, output: data.resp?.output || data.echo?.input || 'Sin respuesta' };
  }
  
  return { ok: false, output: 'Modo no reconocido' };
}

export default invokeAgent;
```

**Resultado:** Cockpit funciona en dev (backend Node.js) y prod (serverless)

---

## 🔧 MEJORA #3: Variables de Entorno Unificadas

**Problema:** `.env` inconsistente entre `apps/web`, `apps/api_node`, `apps/api_py`

**Solución:**
```bash
# .env.local (raíz del monorepo)
# Compartido entre todos los servicios

# Backend
PORT=8080
HOST=127.0.0.1
MAKE_FORWARD=0
MAKE_TOKEN=
MAKE_TIMEOUT=4000

# OpenAI (para /api/chat serverless en Vercel)
OPENAI_API_KEY=sk-proj-...

# Azure OpenAI (para servicios FastAPI)
AZURE_OPENAI_API_ENDPOINT=https://econeura.openai.azure.com
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_API_VERSION=2024-02-01
AZURE_OPENAI_DEPLOYMENT=gpt-4

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=econeura_dev
DB_USER=postgres
DB_PASSWORD=postgres

# Observabilidad
JAEGER_ENDPOINT=http://localhost:14268/api/traces
OTLP_ENDPOINT=http://localhost:4318
```

**Instrucciones:**
1. Copiar `.env.local` a `apps/web/.env.local`
2. Copiar `.env.local` a `apps/api_node/.env.local`
3. Copiar `.env.local` a `apps/api_py/.env.local`
4. Agregar `dotenv` a scripts de inicio

**Resultado:** Variables consistentes en todo el monorepo

---

## 🔧 MEJORA #4: Script de Inicio Unificado

**Problema:** `start-dev.sh` no arranca todo el stack (servicios FastAPI faltantes)

**Solución:**
```bash
#!/usr/bin/env bash
# scripts/start-full-stack.sh

set -e

echo "🚀 Iniciando ECONEURA Stack Completo..."

# 1. Backend Node.js (puerto 8080)
echo "📦 Iniciando Backend Node.js en puerto 8080..."
cd apps/api_node
PORT=8080 node server.js &
BACKEND_PID=$!
cd ../..

# 2. Servicios FastAPI (puertos 8101-8111)
echo "🤖 Iniciando 11 servicios FastAPI..."
for service in analytics cdo cfo chro ciso cmo cto legal reception research support; do
  echo "  → Iniciando $service..."
  cd services/neuras/$service
  PORT=$(grep -oP '"port":\s*\K\d+' ../../../packages/configs/agent-routing.json | head -1)
  uvicorn app:app --host 127.0.0.1 --port $PORT --reload &
  cd ../../..
done

# 3. Frontend Cockpit (puerto 3000)
echo "🌐 Iniciando Frontend Cockpit en puerto 3000..."
cd apps/web
pnpm dev &
FRONTEND_PID=$!
cd ../..

# 4. Health checks
echo "🔍 Esperando servicios..."
sleep 5

echo "✅ Health checks:"
curl -s http://localhost:8080/api/health | jq
curl -s http://localhost:8101/health | jq

echo ""
echo "✅ Stack completo iniciado:"
echo "  - Backend Node.js: http://localhost:8080"
echo "  - Servicios FastAPI: http://localhost:8101-8111"
echo "  - Frontend Cockpit: http://localhost:3000"
echo ""
echo "Presiona Ctrl+C para detener todos los servicios"

# Trap para matar procesos al salir
trap "kill $BACKEND_PID $FRONTEND_PID; killall uvicorn" EXIT
wait
```

**Resultado:** Un solo comando arranca todo el stack

---

## 🔧 MEJORA #5: Sincronización agent-routing.json ↔ Cockpit

**Problema:** agent-routing.json tiene 11 servicios pero Cockpit muestra 10 departamentos

**Solución:**
```typescript
// apps/web/src/config/departments.ts (NUEVO)
import agentRouting from '../../../packages/configs/agent-routing.json';

export interface Department {
  id: string;
  name: string;
  icon: string;
  color: string;
  agentId: string; // Mapea a agent-routing.json
  port: number;
  model: string;
}

// Mapeo automático desde agent-routing.json
export const DEPARTMENTS: Department[] = agentRouting.routes.map(route => ({
  id: route.dept.toUpperCase(),
  name: getDepartmentName(route.dept),
  icon: getDepartmentIcon(route.dept),
  color: getDepartmentColor(route.dept),
  agentId: route.id,
  port: route.port,
  model: route.model,
}));

function getDepartmentName(dept: string): string {
  const names: Record<string, string> = {
    analytics: 'Analytics',
    cdo: 'Chief Data Officer',
    cfo: 'Chief Financial Officer',
    chro: 'Chief HR Officer',
    ciso: 'Chief Security Officer',
    cmo: 'Chief Marketing Officer',
    cto: 'Chief Technology Officer',
    legal: 'Legal',
    reception: 'Recepción',
    research: 'Investigación',
    support: 'Soporte',
  };
  return names[dept] || dept;
}

// ... similar para getDepartmentIcon, getDepartmentColor
```

**Resultado:** Cockpit siempre muestra los departamentos correctos desde configuración

---

## 🔧 MEJORA #6: Base de Datos Inicializada

**Problema:** `db/init/`, `db/seeds/`, `db/migrations/` vacíos

**Solución:**
```sql
-- db/init/001_schema.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  agent_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id),
  role VARCHAR(20) CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
```

```sql
-- db/seeds/001_demo_data.sql
INSERT INTO users (id, email, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'demo@econeura.com', 'Usuario Demo');

INSERT INTO conversations (id, user_id, agent_id) VALUES
  ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000001', 'neura-1');

INSERT INTO messages (conversation_id, role, content) VALUES
  ('00000000-0000-0000-0000-000000000100', 'user', 'Hola'),
  ('00000000-0000-0000-0000-000000000100', 'assistant', 'Hola, soy el agente Analytics');
```

```bash
# scripts/init-db.sh
#!/usr/bin/env bash
set -e

echo "🗄️  Inicializando base de datos..."

# Ejecutar migraciones
for sql in db/init/*.sql; do
  echo "  → Ejecutando $sql..."
  psql -h localhost -U postgres -d econeura_dev -f "$sql"
done

# Ejecutar seeds
for sql in db/seeds/*.sql; do
  echo "  → Ejecutando $sql..."
  psql -h localhost -U postgres -d econeura_dev -f "$sql"
done

echo "✅ Base de datos inicializada"
```

**Resultado:** Base de datos funcional para persistir conversaciones

---

## 🔧 MEJORA #7: Observabilidad OTLP Completa

**Problema:** OTLP stub en `packages/shared`, no completamente integrado

**Solución:**
```typescript
// packages/shared/src/observability/tracer.ts
import { trace, context, SpanStatusCode } from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';

const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'econeura-cockpit',
  }),
});

const exporter = new OTLPTraceExporter({
  url: process.env.OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
});

provider.addSpanProcessor(new BatchSpanProcessor(exporter));
provider.register();

export const tracer = trace.getTracer('econeura-cockpit');

export function traceInvokeAgent(agentId: string, fn: () => Promise<any>) {
  const span = tracer.startSpan(`invoke-agent-${agentId}`);
  return context.with(trace.setSpan(context.active(), span), async () => {
    try {
      const result = await fn();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error: any) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      throw error;
    } finally {
      span.end();
    }
  });
}
```

**Usar en invokeAgent:**
```typescript
import { traceInvokeAgent } from '@shared/observability/tracer';

async function invokeAgent(agentId: string, route: string, payload: any) {
  return traceInvokeAgent(agentId, async () => {
    // ... lógica de invoke
  });
}
```

**Resultado:** Traces visibles en Jaeger UI (http://localhost:16686)

---

## 🔧 MEJORA #8: Tests de Integración Frontend ↔ Backend

**Problema:** Sin tests que verifiquen conexión Cockpit → Backend

**Solución:**
```typescript
// apps/web/src/__tests__/integration/backend.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn, ChildProcess } from 'child_process';

describe('Integración Frontend → Backend', () => {
  let backendProcess: ChildProcess;

  beforeAll(async () => {
    // Arrancar backend Node.js
    backendProcess = spawn('node', ['apps/api_node/server.js'], {
      env: { ...process.env, PORT: '8080' },
    });
    await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar inicio
  });

  afterAll(() => {
    backendProcess.kill();
  });

  it('Backend responde a /api/health', async () => {
    const res = await fetch('http://localhost:8080/api/health');
    expect(res.ok).toBe(true);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it('Backend responde a /api/invoke/neura-1', async () => {
    const res = await fetch('http://localhost:8080/api/invoke/neura-1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
        'X-Route': 'azure',
        'X-Correlation-Id': 'test-123',
      },
      body: JSON.stringify({ input: 'test' }),
    });
    expect(res.ok).toBe(true);
    const data = await res.json();
    expect(data.id).toBe('neura-1');
  });

  it('invokeAgent() conecta correctamente', async () => {
    const { default: invokeAgent } = await import('../../utils/invokeAgent');
    const result = await invokeAgent('neura-1', 'azure', { input: 'test' });
    expect(result.ok).toBe(true);
    expect(result.output).toBeDefined();
  });
});
```

**Ejecutar:**
```bash
pnpm -w test:integration
```

**Resultado:** Tests verifican conexión real entre capas

---

## 🔧 MEJORA #9: Limpieza y Organización de Código

**Problema:** Código duplicado, archivos huérfanos, importaciones inconsistentes

**Solución:**
```bash
# scripts/cleanup-codebase.sh
#!/usr/bin/env bash

echo "🧹 Limpiando codebase..."

# 1. Eliminar archivos duplicados
echo "  → Eliminando duplicados..."
rm -f apps/api_server.py  # Usar apps/api_py/server.py o apps/api_node/server.js

# 2. Consolidar configuraciones
echo "  → Consolidando configs..."
# Mover todas las configs a packages/configs/

# 3. Eliminar imports sin usar
echo "  → Eliminando imports sin usar..."
pnpm -w exec eslint --fix "**/*.{ts,tsx,js,jsx}"

# 4. Formatear código
echo "  → Formateando código..."
pnpm -w exec prettier --write "**/*.{ts,tsx,js,jsx,json,md}"

# 5. Verificar dependencias
echo "  → Verificando dependencias..."
pnpm -w exec depcheck

echo "✅ Codebase limpio"
```

**Estructura limpia resultante:**
```
ECONEURA-PUNTO/
├── apps/
│   ├── web/                 # Frontend Cockpit (React + Vite)
│   │   ├── src/
│   │   │   ├── config/      # Configuraciones (departments.ts)
│   │   │   ├── utils/       # Utilidades (invokeAgent.ts)
│   │   │   └── __tests__/   # Tests
│   │   ├── api/             # Serverless functions (Vercel)
│   │   │   └── chat.js      # OpenAI endpoint
│   │   └── vite.config.ts
│   ├── api_node/            # Backend Node.js (puerto 8080)
│   │   └── server.js
│   └── api_py/              # Backend Python (legacy, puerto 8080)
│       └── server.py
├── packages/
│   ├── shared/              # Código compartido
│   │   └── src/
│   │       └── observability/  # OTLP tracer
│   └── configs/             # Configuraciones
│       └── agent-routing.json
├── services/
│   └── neuras/              # 11 servicios FastAPI
│       ├── analytics/
│       ├── cdo/
│       └── ...
├── db/
│   ├── init/                # Schemas SQL
│   ├── seeds/               # Datos de prueba
│   └── migrations/          # Migraciones
└── scripts/
    ├── start-full-stack.sh  # Arrancar todo
    ├── init-db.sh           # Inicializar DB
    └── cleanup-codebase.sh  # Limpiar código
```

**Resultado:** Estructura clara y mantenible

---

## 🔧 MEJORA #10: Documentación Actualizada

**Problema:** Documentación desactualizada, ejemplos incorrectos

**Solución:**
```markdown
<!-- docs/QUICK_START.md -->
# 🚀 Quick Start - ECONEURA

## 1️⃣ Prerequisitos

- Node.js 20+
- Python 3.11+
- PostgreSQL 15+
- pnpm 8+

## 2️⃣ Instalación

```bash
# Clonar repo
git clone https://github.com/ECONEURA/ECONEURA-PUNTO.git
cd ECONEURA-PUNTO

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales
```

## 3️⃣ Iniciar Base de Datos

```bash
# Crear base de datos
createdb econeura_dev

# Ejecutar migraciones
./scripts/init-db.sh
```

## 4️⃣ Iniciar Stack Completo

```bash
# Opción 1: Script automático (recomendado)
./scripts/start-full-stack.sh

# Opción 2: Manual (para debug)
# Terminal 1: Backend Node.js
cd apps/api_node && node server.js

# Terminal 2: Frontend Cockpit
cd apps/web && pnpm dev

# Terminal 3-13: Servicios FastAPI
cd services/neuras/analytics && uvicorn app:app --port 8101
# ... (repetir para cada servicio)
```

## 5️⃣ Verificar

- Frontend: http://localhost:3000
- Backend: http://localhost:8080/api/health
- Servicios: http://localhost:8101/health (analytics), etc.
- Jaeger: http://localhost:16686

## 6️⃣ Usar Cockpit

1. Abrir http://localhost:3000
2. Seleccionar departamento (CEO, CTO, etc.)
3. Hacer clic en "Abrir chat"
4. Escribir mensaje y enviar
5. Ver respuesta de OpenAI/Azure

## 7️⃣ Tests

```bash
# Tests unitarios
pnpm -w test

# Tests de integración
pnpm -w test:integration

# Coverage
pnpm -w test:coverage
```

## 8️⃣ Deploy a Producción (Vercel)

```bash
cd apps/web
npx vercel --prod

# Configurar en Vercel:
# - OPENAI_API_KEY
# - AZURE_OPENAI_API_KEY
# - AZURE_OPENAI_API_ENDPOINT
```

---

# 🔧 Troubleshooting

## Chat no funciona

1. Verificar backend: `curl http://localhost:8080/api/health`
2. Verificar proxy Vite: revisar `apps/web/vite.config.ts`
3. Verificar variables: revisar `.env.local`

## Servicios FastAPI no arrancan

1. Verificar puertos: `agent-routing.json` vs procesos
2. Verificar dependencias Python: `pip install -r requirements.txt`

## Build falla en Vercel

1. Verificar `package.json`: vite debe estar en `dependencies`
2. Verificar `vercel.json`: buildCommand correcto
```

**Resultado:** Documentación completa y actualizada

---

## 📋 RESUMEN EJECUTIVO - 10 MEJORAS

| # | Mejora | Impacto | Prioridad |
|---|--------|---------|-----------|
| 1 | Proxy Vite → Backend | Chat funcional en dev | 🔴 CRÍTICO |
| 2 | invokeAgent() unificado | Dev/Prod consistentes | 🔴 CRÍTICO |
| 3 | Variables de entorno | Configuración consistente | 🟡 ALTO |
| 4 | Script inicio unificado | Stack completo 1 comando | 🟡 ALTO |
| 5 | Sincronización routing | Frontend = Backend | 🟡 ALTO |
| 6 | Base de datos init | Persistencia funcional | 🟢 MEDIO |
| 7 | Observabilidad OTLP | Debugging mejorado | 🟢 MEDIO |
| 8 | Tests integración | Confiabilidad | 🟢 MEDIO |
| 9 | Limpieza código | Mantenibilidad | 🔵 BAJO |
| 10 | Documentación | Onboarding rápido | 🔵 BAJO |

---

## 🎯 ORDEN DE EJECUCIÓN RECOMENDADO

### Fase 1: CRÍTICO (hoy mismo)
1. ✅ Proxy Vite → Backend (Mejora #1)
2. ✅ invokeAgent() unificado (Mejora #2)
3. ✅ Variables de entorno (Mejora #3)

### Fase 2: ALTO (esta semana)
4. ✅ Script inicio unificado (Mejora #4)
5. ✅ Sincronización routing (Mejora #5)

### Fase 3: MEDIO (próxima semana)
6. ✅ Base de datos init (Mejora #6)
7. ✅ Observabilidad OTLP (Mejora #7)
8. ✅ Tests integración (Mejora #8)

### Fase 4: BAJO (cuando haya tiempo)
9. ✅ Limpieza código (Mejora #9)
10. ✅ Documentación (Mejora #10)

---

## ✅ CHECKLIST DE VALIDACIÓN

Después de aplicar las 10 mejoras, verificar:

- [ ] `curl http://localhost:8080/api/health` responde OK
- [ ] Frontend en http://localhost:3000 carga correctamente
- [ ] Chat en Cockpit envía mensaje y recibe respuesta
- [ ] `/api/invoke/neura-1` llama a backend Node.js
- [ ] Servicios FastAPI responden en puertos 8101-8111
- [ ] Base de datos tiene tablas creadas
- [ ] Jaeger muestra traces en http://localhost:16686
- [ ] Tests de integración pasan: `pnpm -w test:integration`
- [ ] Build prod exitoso: `pnpm -w build`
- [ ] Deploy a Vercel funcional

---

**🎉 RESULTADO FINAL:** Monorepo completamente sincronizado, Cockpit funcional en dev y prod, backend integrado, base de datos operativa, observabilidad completa.
