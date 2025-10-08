# ECONEURA Backend API Server (Node.js)

Backend proxy HTTP que enruta invocaciones de agentes IA a webhooks de Make.com.

## 🚀 Quick Start

```bash
# Desde la raíz del monorepo
node apps/api_node/server.js

# O con pnpm
pnpm -C apps/api_node start

# Modo development (auto-restart en cambios)
pnpm -C apps/api_node dev
```

## 📡 Endpoints

### `GET /api/health`
Health check del servidor.

**Response:**
```json
{
  "ok": true,
  "mode": "sim",
  "ts": "2025-10-08T22:00:00.000Z",
  "agents": 11
}
```

### `POST /api/invoke/:agentId`
Invoca un agente específico.

**Headers requeridos:**
- `Authorization: Bearer <token>`
- `X-Route: <route>` (ej: `azure`, `openai`)
- `X-Correlation-Id: <uuid>`

**Body:**
```json
{
  "input": "tu mensaje aquí",
  "context": {},
  "policy": {
    "pii": "mask"
  }
}
```

**Response (modo simulación):**
```json
{
  "id": "neura-1",
  "ok": true,
  "forward": false,
  "echo": { "input": "..." },
  "route": "azure",
  "correlationId": "...",
  "simulatedResponse": "Respuesta simulada del agente neura-1",
  "timestamp": "2025-10-08T22:00:00.000Z"
}
```

## ⚙️ Variables de Entorno

```bash
# Puerto del servidor (default: 8080)
PORT=8080

# Host (default: 127.0.0.1)
HOST=127.0.0.1

# Habilitar forwarding a Make.com (default: off)
MAKE_FORWARD=1

# Token de autenticación para Make.com
MAKE_TOKEN=your-secret-token

# Timeout en ms para requests a Make.com (default: 4000)
MAKE_TIMEOUT=4000
```

## 🔄 Modos de Operación

### Modo Simulación (default)
```bash
node server.js
# Devuelve respuestas simuladas sin llamar a Make.com
```

### Modo Forward
```bash
MAKE_FORWARD=1 MAKE_TOKEN=tu-token node server.js
# Enruta requests reales a Make.com webhooks
```

## 🧪 Testing

```bash
# Health check
curl http://localhost:8080/api/health

# Invoke (modo simulación)
curl -X POST http://localhost:8080/api/invoke/neura-1 \
  -H "Authorization: Bearer test-token" \
  -H "X-Route: azure" \
  -H "X-Correlation-Id: test-123" \
  -H "Content-Type: application/json" \
  -d '{"input":"Hola, agente de analytics"}'

# Response esperada:
{
  "id": "neura-1",
  "ok": true,
  "forward": false,
  "echo": {
    "input": "Hola, agente de analytics"
  },
  "route": "azure",
  "correlationId": "test-123",
  "simulatedResponse": "Respuesta simulada del agente neura-1",
  "timestamp": "2025-10-08T22:30:00.000Z"
}
```

## 📋 Agentes Disponibles

- `neura-1` - Analytics
- `neura-2` - CDO (Chief Data Officer)
- `neura-3` - CFO (Chief Financial Officer)
- `neura-4` - CHRO (Chief HR Officer)
- `neura-5` - CISO (Chief Information Security Officer)
- `neura-6` - CMO (Chief Marketing Officer)
- `neura-7` - CTO (Chief Technology Officer)
- `neura-8` - Legal
- `neura-9` - Reception
- `neura-10` - Research
- `neura-11` - Support

## 🔗 Integración con Frontend

El frontend en `apps/web` está configurado para conectarse a este backend:

```typescript
// apps/web/.env.local
VITE_API_BASE_URL=http://localhost:8080
```

## 📝 Arquitectura

```
Frontend (React)
    ↓ HTTP POST /api/invoke/:agentId
Backend Node.js (puerto 8080)
    ↓ (si MAKE_FORWARD=1)
Make.com Webhooks
    ↓
Agentes IA (GPT-4, Claude, etc.)
```

## 🛡️ Validaciones

El servidor valida:
- ✅ Authorization Bearer token presente
- ✅ X-Route header presente
- ✅ X-Correlation-Id header presente
- ✅ Agent ID válido (neura-1 a neura-11)
- ✅ Body JSON parseable

## 🐛 Troubleshooting

**Error 401: Missing Authorization Bearer**
- Asegúrate de enviar header `Authorization: Bearer <token>`

**Error 400: Missing X-Route or X-Correlation-Id**
- Incluye ambos headers en tu request

**Error 404: Unknown agent id**
- Verifica que el ID sea `neura-1` a `neura-11`

**Error 502: make_unreachable**
- Make.com no responde o URL incorrecta
- Verifica configuración en `packages/configs/agent-routing.json`

## 📦 Sin Dependencias

Este servidor usa solo Node.js stdlib:
- ✅ `node:http` para servidor HTTP
- ✅ `node:fs/promises` para leer config
- ✅ `node:path` para paths
- ✅ `fetch` API nativa (Node 18+)

**No requiere `npm install`** 🎉
