# 🚀 ECONEURA + MAKE.COM - CONFIGURACIÓN COMPLETA

```
╔═══════════════════════════════════════════════════════════╗
║       SISTEMA CONFIGURADO Y LISTO                         ║
╚═══════════════════════════════════════════════════════════╝
```

## ✅ **LO QUE SE CONFIGURÓ AUTOMÁTICAMENTE:**

### 1️⃣ **Backend API (puerto 3001)**

```
apps/api_node/
├── config/
│   └── agents.json          ← 40 agentes mapeados
├── routes/
│   ├── invoke.js            ← Ruta para chat GPT
│   └── agent.js             ← Ruta para ejecutar agentes Make
├── services/
│   └── openaiService.js     ← Servicio OpenAI
├── middleware/
│   └── auth.js              ← Autenticación Bearer DEV
└── server.js                ← Servidor Express
```

**Endpoints disponibles:**
- `POST /api/invoke/neura-chat` → Chat con GPT-4o-mini
- `POST /api/agent/execute` → Ejecutar agente en Make.com
- `GET /api/agent/list` → Listar todos los agentes
- `GET /health` → Health check

### 2️⃣ **Frontend Cockpit (puerto 3000)**

```
apps/web/
├── src/
│   └── App.tsx              ← Conectado a backend para agentes
└── .env                     ← Variables de entorno configuradas
```

**Variables configuradas:**
```env
VITE_NEURA_GW_URL=http://localhost:3001
VITE_NEURA_GW_KEY=DEV
VITE_OPENAI_MODEL=gpt-4o-mini
```

### 3️⃣ **Mapeo de Agentes**

```json
40 AGENTES MAPEADOS EN config/agents.json:

CEO:     a-ceo-01,  a-ceo-02,  a-ceo-03,  a-ceo-04
IA:      a-ia-01,   a-ia-02,   a-ia-03,   a-ia-04
CSO:     a-cso-01,  a-cso-02,  a-cso-03,  a-cso-04
CTO:     a-cto-01,  a-cto-02,  a-cto-03,  a-cto-04
CISO:    a-ciso-01, a-ciso-02, a-ciso-03, a-ciso-04
COO:     a-coo-01,  a-coo-02,  a-coo-03,  a-coo-04
CHRO:    a-chro-01, a-chro-02, a-chro-03, a-chro-04
MKT:     a-mkt-01,  a-mkt-02,  a-mkt-03,  a-mkt-04
CFO:     a-cfo-01,  a-cfo-02,  a-cfo-03,  a-cfo-04
CDO:     a-cdo-01,  a-cdo-02,  a-cdo-03,  a-cdo-04
```

---

## 🔧 **CONFIGURAR WEBHOOKS DE MAKE.COM**

### PASO 1: Crear Webhooks en Make.com

```
┌─────────────────────────────────────────┐
│  1. Ir a make.com/scenarios            │
│  2. Crear "New Scenario"                │
│  3. Agregar módulo "Webhooks"           │
│  4. Seleccionar "Custom webhook"        │
│  5. Crear nuevo webhook                 │
│  6. Copiar URL generada                 │
│     Ejemplo:                            │
│     https://hook.us1.make.com/abc123xyz │
└─────────────────────────────────────────┘
```

### PASO 2: Editar agents.json

Abre el archivo: `apps/api_node/config/agents.json`

Reemplaza cada URL `"https://hook.us1.make.com/REEMPLAZA_XXX_XX"` con tu webhook real:

**ANTES:**
```json
"a-ceo-01": {"webhookUrl":"https://hook.us1.make.com/REEMPLAZA_CEO_01"}
```

**DESPUÉS:**
```json
"a-ceo-01": {"webhookUrl":"https://hook.us1.make.com/tu-webhook-real-abc123"}
```

### PASO 3: Reiniciar Backend

```powershell
# Detener proceso en puerto 3001
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess -Force

# Reiniciar
cd apps/api_node
node server.js
```

---

## 🎯 **FLUJO COMPLETO**

```
Usuario hace clic "Ejecutar" en agente
         │
         ▼
┌─────────────────────────────────────────┐
│  Frontend (App.tsx)                     │
│  executeAgent(a-ceo-01, "CEO", {...})   │
└────────┬────────────────────────────────┘
         │
         │ POST /api/agent/execute
         │
         ▼
┌─────────────────────────────────────────┐
│  Backend (routes/agent.js)              │
│  • Busca webhook en agents.json         │
│  • Valida que no sea "REEMPLAZA"        │
│  • Prepara payload con datos            │
└────────┬────────────────────────────────┘
         │
         │ POST al webhook de Make.com
         │
         ▼
┌─────────────────────────────────────────┐
│  MAKE.COM                               │
│  • Recibe:                              │
│    - agent_id: "a-ceo-01"               │
│    - department: "CEO"                  │
│    - action: "execute"                  │
│    - timestamp: ISO                     │
│    - parameters: {...}                  │
│  • Ejecuta escenario configurado        │
└────────┬────────────────────────────────┘
         │
         │ Procesa información
         │
         ▼
┌─────────────────────────────────────────┐
│  Resultado del Escenario                │
│  • Scraping web                         │
│  • Análisis de datos                    │
│  • Envío de emails                      │
│  • Actualización de DB                  │
│  • Generación de reportes               │
└─────────────────────────────────────────┘
```

---

## 📋 **PAYLOAD QUE RECIBE MAKE.COM**

Cuando haces clic en "Ejecutar" en el cockpit, Make.com recibe:

```json
{
  "agent_id": "a-ceo-01",
  "department": "CEO",
  "action": "execute",
  "timestamp": "2025-10-11T13:45:00.123Z",
  "correlation_id": "exec-1697028300123",
  "parameters": {
    "agent_title": "Análisis Estratégico Competitivo",
    "agent_description": "Análisis FODA de competidores principales",
    "department": "CEO"
  }
}
```

---

## 🧪 **PROBAR LA INTEGRACIÓN**

### 1. Verificar que el backend esté corriendo:

```powershell
curl http://localhost:3001/health
```

**Respuesta esperada:**
```json
{"status":"ok","model":"gpt-4o-mini","timestamp":"2025-10-11T..."}
```

### 2. Listar agentes configurados:

```powershell
curl -H "Authorization: Bearer DEV" http://localhost:3001/api/agent/list
```

**Respuesta:**
```json
{
  "total": 40,
  "configured": 0,
  "agents": [
    {
      "id": "a-ceo-01",
      "configured": false,
      "webhookUrl": "https://hook.us1.make.com/REEMPLAZA_CEO_01"
    },
    ...
  ]
}
```

### 3. Probar ejecución (después de configurar un webhook):

```powershell
$body = @{
  agent_id = "a-ceo-01"
  department = "CEO"
  action = "execute"
  parameters = @{
    test = "true"
  }
} | ConvertTo-Json

curl -X POST `
  -H "Authorization: Bearer DEV" `
  -H "Content-Type: application/json" `
  -d $body `
  http://localhost:3001/api/agent/execute
```

---

## ⚠️ **ERRORES COMUNES**

### Error 503: "Webhook no configurado"
```json
{
  "error": "Webhook del agente a-ceo-01 no configurado. Edita config/agents.json"
}
```
**Solución:** Reemplaza "REEMPLAZA" con tu webhook real en `agents.json`

### Error 404: "Agente no encontrado"
```json
{
  "error": "Agente xyz-123 no encontrado o sin webhook configurado"
}
```
**Solución:** Verifica que el `agent_id` exista en `agents.json`

### Error 500: "Make.com respondió con status 404"
```json
{
  "error": "Make.com respondió con status 404"
}
```
**Solución:** Verifica que el webhook en Make.com esté activo y sea correcto

---

## 📊 **ESTADO ACTUAL**

```
✅ Backend corriendo en localhost:3001
✅ 40 agentes mapeados en config/agents.json
✅ Ruta /api/agent/execute creada
✅ Frontend conectado al backend
✅ Función executeAgent() implementada

⚠️  PENDIENTE:
❌ Configurar webhooks reales en agents.json
❌ Crear escenarios en Make.com
❌ Probar flujo end-to-end
```

---

## 🚀 **SIGUIENTE PASO**

**¿Tienes webhooks de Make.com listos?**

- **SÍ** → Edita `apps/api_node/config/agents.json` y reemplaza las URLs
- **NO** → Crea tus primeros webhooks en make.com/scenarios

Una vez configurados los webhooks, los botones "Ejecutar" del cockpit funcionarán automáticamente.

---

## 📞 **SOPORTE**

Si necesitas ayuda configurando Make.com, dime qué tipo de automatización quieres crear y te guío paso a paso.
