# 🚀 GUÍA DE INTEGRACIÓN OPENAI EN CHATS NEURA

## ✅ LO QUE ACABAS DE CONSEGUIR

**TODOS los chats NEURA existentes ahora tienen:**
- ✨ Capacidades completas de GPT-4o (igual que ChatGPT)
- 🧠 Memoria conversacional automática (contexto de conversaciones previas)
- 🎭 10 personalidades especializadas por rol (CFO, CTO, CMO, etc.)
- 🌊 Streaming de respuestas token por token (opcional)
- 🎯 CERO cambios necesarios en el frontend - funciona YA

---

## 🔧 CONFIGURACIÓN (1 MINUTO)

### 1. Obtener API Key de OpenAI

```bash
# Visita: https://platform.openai.com/api-keys
# Crea una nueva key y cópiala
```

### 2. Configurar en el proyecto

**Opción A - Variable de entorno (PowerShell):**
```powershell
$env:OPENAI_API_KEY="sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

**Opción B - Archivo .env (recomendado):**
```bash
# apps/api_node/.env
OPENAI_API_KEY=sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
PORT=8080
```

### 3. Reiniciar backend

```powershell
cd apps\api_node
node server-simple.js
```

---

## 📡 ENDPOINTS DISPONIBLES

### 1️⃣ Chat Normal (ya funciona sin cambios)

**Endpoint actual:**
```
POST http://localhost:8080/api/invoke/neura-3
```

**Request:**
```json
{
  "input": "Analiza el ROI de nuestro proyecto X",
  "userId": "user-123",
  "correlationId": "conv-456"
}
```

**Response:**
```json
{
  "output": "Como CFO, analizo el ROI considerando...",
  "agent": "Chief Financial Officer",
  "role": "Financial Strategy Expert",
  "contextMessages": 5,
  "usage": {
    "totalTokens": 850
  }
}
```

### 2️⃣ Chat con Streaming (nuevo - tipo ChatGPT)

**Endpoint nuevo:**
```
POST http://localhost:8080/api/stream/neura-3
```

**Response (Server-Sent Events):**
```
data: {"type":"start","agent":"Chief Financial Officer"}

data: {"type":"token","content":"Como"}
data: {"type":"token","content":" CFO,"}
data: {"type":"token","content":" analizo"}
...
data: {"type":"done"}
```

---

## 🎭 AGENTES DISPONIBLES

| ID | Nombre | Especialidad |
|----|--------|--------------|
| `neura-1` | Analytics Specialist | Análisis de datos y métricas |
| `neura-2` | Chief Data Officer | Estrategia de datos |
| `neura-3` | Chief Financial Officer | Finanzas y presupuestos |
| `neura-4` | Chief Human Resources | Talento y cultura |
| `neura-5` | Chief Security Officer | Ciberseguridad |
| `neura-6` | Chief Marketing Officer | Marketing y growth |
| `neura-7` | Chief Technology Officer | Arquitectura técnica |
| `neura-8` | Legal Counsel | Asesoría legal |
| `neura-9` | Reception Assistant | Atención general |
| `neura-10` | Research Specialist | Investigación R&D |

---

## 🧠 MEMORIA CONVERSACIONAL

**Automática. Sin configuración.**

```javascript
// Primera pregunta
POST /api/invoke/neura-3
{ "input": "¿Cuál es nuestro revenue?", "userId": "john" }
// → "Nuestro revenue actual es..."

// Segunda pregunta (contexto automático)
POST /api/invoke/neura-3
{ "input": "¿Y cómo se compara con el año pasado?", "userId": "john" }
// → "Comparado con el revenue que mencioné (X), este año..."
//     ↑ Recuerda la conversación anterior
```

**El sistema mantiene automáticamente:**
- ✅ Últimos 10 intercambios por usuario + agente
- ✅ Contexto separado por combinación userId + neuraId
- ✅ Se incluye en cada llamada sin código extra

---

## 💻 INTEGRACIÓN FRONTEND (OPCIONAL)

### Tu código actual YA FUNCIONA

```typescript
// apps/web/src/lib/neuraClient.ts
export async function invokeAgent(agentId: string, input: string) {
  const response = await fetch(`${API_URL}/api/invoke/${agentId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input })
  });
  return response.json();
}
```

**✅ No requiere cambios. Funciona automáticamente con OpenAI.**

### Si quieres streaming (opcional)

```typescript
// Nueva función para streaming
export async function streamAgent(agentId: string, input: string, 
                                   onToken: (token: string) => void) {
  const response = await fetch(`${API_URL}/api/stream/${agentId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        if (data.type === 'token') {
          onToken(data.content);
        }
      }
    }
  }
}
```

---

## 🧪 PRUEBAS RÁPIDAS

### PowerShell

```powershell
# 1. Probar chat normal
$body = @{
    input = "Hola, ¿cómo puedes ayudarme con finanzas?"
    userId = "test-user"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/invoke/neura-3" `
  -Method Post -Body $body -ContentType "application/json"

# 2. Probar memoria conversacional
$body2 = @{
    input = "¿Recuerdas de qué hablamos?"
    userId = "test-user"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/invoke/neura-3" `
  -Method Post -Body $body2 -ContentType "application/json"
```

### Desde el Cockpit

1. **Abrir Cockpit:** http://localhost:3000
2. **Click "Abrir chat"**
3. **Escribir:** "Hola CFO, analiza nuestro último trimestre"
4. **Ver respuesta GPT-4o en tiempo real**

---

## 🎯 CARACTERÍSTICAS DESTACADAS

### 1. Personalidades Especializadas

Cada agente tiene un `systemPrompt` profesional:

```javascript
// neura-3 (CFO)
"Eres el CFO de ECONEURA. Dominas análisis financiero, 
planificación presupuestaria, forecasting..."

// neura-7 (CTO)
"Eres el CTO de ECONEURA. Tu expertise es arquitectura 
de software, infraestructura cloud, DevOps..."
```

### 2. Temperatura por Rol

- **CFO (0.4):** Respuestas precisas y conservadoras
- **CMO (0.8):** Respuestas creativas e innovadoras
- **CTO (0.6):** Balance entre innovación y estabilidad

### 3. Contexto Automático

```javascript
// Interno: el sistema hace esto automáticamente
messages = [
  { role: 'system', content: personality.systemPrompt },
  { role: 'user', content: 'Pregunta 1' },      // ← Historial
  { role: 'assistant', content: 'Respuesta 1' }, // ← Historial
  { role: 'user', content: 'Pregunta 2' }       // ← Actual
]
```

---

## 🔍 TROUBLESHOOTING

### Error: "OPENAI_API_KEY not configured"

**Solución:**
```powershell
# Verifica que existe
Get-Content apps\api_node\.env

# Si no existe, créalo
echo "OPENAI_API_KEY=sk-proj-XXX" > apps\api_node\.env

# Reinicia el servidor
cd apps\api_node
node server-simple.js
```

### Error: "Invalid OPENAI_API_KEY"

**Causas:**
- Key incorrecta o expirada
- Falta de créditos en cuenta OpenAI
- Key no tiene permisos para GPT-4

**Solución:**
1. Verifica en: https://platform.openai.com/api-keys
2. Genera una nueva key
3. Actualiza `.env` y reinicia

### El agente no recuerda conversaciones previas

**Verifica:**
```javascript
// Estás enviando el mismo userId en cada request?
{ 
  "input": "...",
  "userId": "user-123" // ← Debe ser consistente
}
```

---

## 📊 MONITOREO

### Logs del servidor

```
💬 Chief Financial Officer processing message from user-123
📚 Conversation context: 8 previous messages
✅ Chief Financial Officer responded (1,234 tokens)
```

### Health check

```powershell
Invoke-RestMethod http://localhost:8080/api/health
```

---

## 🚀 PRÓXIMOS PASOS (OPCIONAL)

### 1. Persistencia en DB

Actualmente la memoria está en RAM. Para producción:

```javascript
// Migrar conversationHistory de Map a PostgreSQL
// Ver: packages/shared/src/ai/agents/memory.ts
```

### 2. Function Calling

Añadir herramientas a los agentes:

```javascript
tools: [
  {
    type: 'function',
    function: {
      name: 'get_financial_data',
      description: 'Obtiene datos financieros reales'
    }
  }
]
```

### 3. Streaming en Frontend

Implementar UI con respuestas token por token:

```tsx
// Ver ejemplo en: apps/web/src/components/ChatStream.tsx
```

---

## 📚 REFERENCIAS

- **OpenAI Chat API:** https://platform.openai.com/docs/api-reference/chat
- **Streaming SSE:** https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
- **ECONEURA Docs:** `docs/OPENAI_INTEGRATION.md`

---

## ✅ CHECKLIST

- [ ] OPENAI_API_KEY configurada en `.env`
- [ ] Backend reiniciado: `node server-simple.js`
- [ ] Health check OK: `curl http://localhost:8080/api/health`
- [ ] Primer chat: `POST /api/invoke/neura-3`
- [ ] Verifica memoria: Segunda pregunta con mismo `userId`
- [ ] (Opcional) Prueba streaming: `POST /api/stream/neura-3`

---

**🎉 ¡Listo! Todos tus chats NEURA ahora tienen capacidades ChatGPT completas.**

**Preguntas:** Ver `docs/OPENAI_INTEGRATION.md` o revisar logs del servidor.
