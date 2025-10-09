# 🤖 Plan de Integración: Chat NEURA ↔ OpenAI API

**Fecha:** 9 Octubre 2025  
**Objetivo:** Conectar el chat del Cockpit con OpenAI para respuestas reales de IA

---

## 📊 Análisis del Estado Actual

### ✅ Lo que YA existe:

1. **Frontend (`EconeuraCockpit.tsx`)**
   - ✅ UI de chat completa y funcional
   - ✅ 40 agentes en 10 departamentos
   - ✅ Sistema de mensajes (user/assistant)
   - ⚠️ **PROBLEMA:** `handleSendMessage()` está usando respuestas simuladas (setTimeout con mensaje estático)

2. **Función `invokeAgent()` (`apps/web/src/utils/invokeAgent.ts`)**
   - ✅ Lógica para detectar agentes NEURA
   - ✅ Llamada a `/api/chat` en producción
   - ✅ Llamada a `/api/invoke/:agentId` en desarrollo
   - ✅ Manejo de errores y respuestas

3. **API OpenAI (`apps/web/api/chat.js`)**
   - ✅ Endpoint `/api/chat` funcional
   - ✅ Integración con OpenAI GPT-4
   - ✅ System prompts personalizados por agente
   - ✅ Configurado en Vercel

4. **Backend Node.js (`apps/api_node/server.js`)**
   - ✅ Servidor en puerto 8080
   - ✅ Rutas `/api/invoke/:agentId`
   - ✅ Proxy a Make.com (opcional)
   - ✅ 11 rutas configuradas

5. **Servicios FastAPI (`services/neuras/*/app.py`)**
   - ✅ 11 microservicios Python
   - ✅ Integración con Azure OpenAI
   - ✅ Endpoints `/v1/task`
   - ⚠️ Actualmente no usados por el frontend

---

## 🔴 Problema Principal

**El chat del Cockpit NO está llamando a `invokeAgent()`**

```typescript
// ❌ CÓDIGO ACTUAL (EconeuraCockpit.tsx línea 201-214)
const handleSendMessage = useCallback(async () => {
  if (!inputValue.trim() || !selectedAgent) return;
  
  const userMessage: Message = { 
    id: `msg-${Date.now()}`, 
    role: "user", 
    content: inputValue.trim(), 
    timestamp: new Date() 
  };
  
  setMessages((prev) => [...prev, userMessage]);
  setInputValue("");
  
  // ❌ SIMULACIÓN: Respuesta falsa después de 1 segundo
  setTimeout(() => {
    const assistantMessage: Message = { 
      id: `msg-${Date.now()}-response`, 
      role: "assistant", 
      content: `[${selectedAgent.name}] Procesando tu solicitud: "${userMessage.content}"...`, 
      timestamp: new Date(), 
      agentId: selectedAgent.id, 
      agentName: selectedAgent.name 
    };
    setMessages((prev) => [...prev, assistantMessage]);
  }, 1000);
}, [inputValue, selectedAgent]);
```

**Resultado:** El chat muestra respuestas simuladas, NO usa OpenAI.

---

## 🎯 Solución: Conectar Chat con OpenAI

### Paso 1: Importar `invokeAgent()` en el Cockpit

```typescript
// En EconeuraCockpit.tsx, línea 26 (después de los imports de lucide-react)
import invokeAgent from "./utils/invokeAgent";
```

### Paso 2: Reemplazar `handleSendMessage()` con llamada real

```typescript
// ✅ NUEVO CÓDIGO (llamada real a OpenAI)
const handleSendMessage = useCallback(async () => {
  if (!inputValue.trim() || !selectedAgent) return;
  
  // 1. Agregar mensaje del usuario
  const userMessage: Message = { 
    id: `msg-${Date.now()}`, 
    role: "user", 
    content: inputValue.trim(), 
    timestamp: new Date() 
  };
  
  setMessages((prev) => [...prev, userMessage]);
  const userInput = inputValue.trim();
  setInputValue(""); // Limpiar input inmediatamente
  
  // 2. Agregar mensaje "pensando..." temporal
  const thinkingId = `msg-${Date.now()}-thinking`;
  const thinkingMessage: Message = {
    id: thinkingId,
    role: "assistant",
    content: "💭 Pensando...",
    timestamp: new Date(),
    agentId: selectedAgent.id,
    agentName: selectedAgent.name
  };
  
  setMessages((prev) => [...prev, thinkingMessage]);
  
  try {
    // 3. Llamar a invokeAgent() con OpenAI
    const response = await invokeAgent(
      selectedAgent.id,
      'azure', // o 'local' para desarrollo
      { input: userInput }
    );
    
    // 4. Reemplazar mensaje "pensando..." con respuesta real
    setMessages((prev) => 
      prev.map((msg) => 
        msg.id === thinkingId
          ? {
              ...msg,
              content: response.ok 
                ? response.output 
                : `❌ Error: ${response.output}`,
              timestamp: new Date()
            }
          : msg
      )
    );
    
  } catch (error: any) {
    // 5. Manejar error
    setMessages((prev) => 
      prev.map((msg) => 
        msg.id === thinkingId
          ? {
              ...msg,
              content: `❌ Error de conexión: ${error.message}`,
              timestamp: new Date()
            }
          : msg
      )
    );
  }
}, [inputValue, selectedAgent]);
```

---

## 📝 Archivos a Modificar

### 1. `apps/web/src/EconeuraCockpit.tsx`

**Cambios:**
- ✅ Línea 26: Agregar `import invokeAgent from "./utils/invokeAgent";`
- ✅ Líneas 201-214: Reemplazar `handleSendMessage()` con código real (ver arriba)

**Resultado esperado:**
- Chat muestra "💭 Pensando..." mientras espera respuesta
- Respuesta real de GPT-4 reemplaza el mensaje temporal
- Errores se muestran claramente al usuario

### 2. `apps/web/src/utils/invokeAgent.ts` (sin cambios)

**Estado actual:** ✅ Ya está optimizado
- Detecta si es producción o desarrollo
- Usa `/api/chat` (OpenAI) en producción
- Usa `/api/invoke/:agentId` (backend Node.js) en desarrollo

### 3. `apps/web/api/chat.js` (sin cambios)

**Estado actual:** ✅ Ya funcional
- Recibe: `{ agentId, message, context }`
- Llama a OpenAI GPT-4
- Retorna: `{ success, message, agentId, timestamp }`

---

## 🧪 Plan de Testing

### Prueba 1: Desarrollo Local

```bash
# Terminal 1: Iniciar backend Node.js
cd apps/api_node
node server.js
# ✅ Backend listening on http://127.0.0.1:8080

# Terminal 2: Iniciar frontend
cd apps/web
pnpm dev
# ✅ Vite dev server on http://localhost:3000
```

**Probar:**
1. Abrir `http://localhost:3000`
2. Seleccionar departamento (ej: Executive)
3. Seleccionar agente (ej: CEO Vision)
4. Escribir: "¿Cuál es la visión estratégica?"
5. **Verificar:** Debería mostrar respuesta del backend Node.js (modo simulación o Make.com)

### Prueba 2: Producción (Vercel)

```bash
# Deploy a Vercel
vercel --prod
```

**Probar:**
1. Abrir URL de Vercel (ej: `econeura-punto.vercel.app`)
2. Seleccionar agente NEURA (CEO, CFO, CTO, etc.)
3. Escribir mensaje de prueba
4. **Verificar:** Respuesta real de OpenAI GPT-4

### Casos de Prueba

| # | Escenario | Input | Output Esperado |
|---|-----------|-------|-----------------|
| 1 | Agente CEO | "¿Cuál es nuestra misión?" | Respuesta ejecutiva de GPT-4 |
| 2 | Agente CFO | "Analiza estos números: 100k revenue" | Análisis financiero de GPT-4 |
| 3 | Sin API key | Cualquier mensaje | Error claro: "OpenAI API key not configured" |
| 4 | Timeout | Mensaje muy complejo | Error: "Request timed out" |
| 5 | Agente no válido | ID incorrecto | Error 404 o simulación |

---

## 🔧 Variables de Entorno Necesarias

### Desarrollo (`.env.local`)

```bash
# Backend Node.js (opcional - para Make.com)
PORT=8080
MAKE_FORWARD=0  # 0 = simulación, 1 = forwarding a Make.com
MAKE_TOKEN=

# OpenAI (no se usa en dev, solo en prod)
OPENAI_API_KEY=
```

### Producción (Vercel)

```bash
# ✅ CRÍTICO: Configurar en Vercel Dashboard
OPENAI_API_KEY=sk-proj-tu-clave-real-aqui

# Opcional (si usas Azure OpenAI)
AZURE_OPENAI_API_ENDPOINT=https://econeura.openai.azure.com
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_API_VERSION=2024-02-01
AZURE_OPENAI_DEPLOYMENT=gpt-4
```

**Cómo configurar en Vercel:**
1. Ir a dashboard: https://vercel.com/econeura/econeura-punto
2. Settings → Environment Variables
3. Agregar `OPENAI_API_KEY` con valor real
4. Redeploy: `vercel --prod`

---

## 📊 Flujo de Datos Completo

```
┌─────────────────┐
│  Usuario escribe│
│  mensaje en UI  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ EconeuraCockpit.tsx     │
│ handleSendMessage()     │
│ - Agrega mensaje user   │
│ - Muestra "Pensando..." │
└────────┬────────────────┘
         │
         ▼
┌────────────────────────┐
│ invokeAgent()          │
│ - Detecta PROD vs DEV  │
│ - Elige endpoint       │
└────────┬───────────────┘
         │
         ├─ DEV ──────────────────┐
         │                         │
         │                         ▼
         │              ┌───────────────────────┐
         │              │ Backend Node.js       │
         │              │ /api/invoke/:agentId  │
         │              │ - Modo simulación     │
         │              │ - O proxy a Make.com  │
         │              └───────────┬───────────┘
         │                          │
         │                          ▼
         │              ┌───────────────────────┐
         │              │ Make.com Webhooks     │
         │              │ (opcional)            │
         │              └───────────┬───────────┘
         │                          │
         ├──────────────────────────┘
         │
         └─ PROD ─────────────────┐
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │ /api/chat.js         │
                        │ (Vercel Serverless)  │
                        └──────────┬───────────┘
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │ OpenAI GPT-4 API     │
                        │ - System prompt      │
                        │ - User message       │
                        │ - Temperature 0.7    │
                        └──────────┬───────────┘
                                   │
         ┌─────────────────────────┘
         │
         ▼
┌────────────────────────┐
│ Respuesta AI           │
│ - output: "..."        │
│ - ok: true/false       │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ UI actualiza mensaje   │
│ - Reemplaza "Pensando" │
│ - Muestra respuesta    │
└────────────────────────┘
```

---

## ⚡ Optimizaciones Futuras

### 1. Streaming de Respuestas (GPT-4 Turbo)

Actualmente la respuesta llega toda de golpe. Podemos hacer streaming:

```typescript
// En /api/chat.js
const stream = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [...],
  stream: true  // ✅ Activar streaming
});

// Enviar Server-Sent Events (SSE)
res.setHeader('Content-Type', 'text/event-stream');
for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || '';
  res.write(`data: ${JSON.stringify({ content })}\n\n`);
}
res.end();
```

**Beneficio:** Usuario ve el texto aparecer palabra por palabra (mejor UX)

### 2. Historial de Conversación

Actualmente cada mensaje es independiente. Podemos enviar contexto:

```typescript
// En handleSendMessage()
const context = messages.slice(-5).map(msg => ({
  role: msg.role,
  content: msg.content
}));

const response = await invokeAgent(
  selectedAgent.id,
  'azure',
  { 
    input: userInput,
    context: context  // ✅ Últimos 5 mensajes
  }
);
```

**Beneficio:** GPT-4 recuerda el contexto de la conversación

### 3. Indicadores de Typing (...)

```typescript
// En handleSendMessage(), antes de llamar invokeAgent()
const typingInterval = setInterval(() => {
  setMessages(prev => 
    prev.map(msg => 
      msg.id === thinkingId
        ? { ...msg, content: msg.content + '.' }
        : msg
    )
  );
}, 500);

// Después de recibir respuesta
clearInterval(typingInterval);
```

**Beneficio:** Feedback visual más dinámico

### 4. Rate Limiting

```typescript
// En /api/chat.js
const rateLimiter = new Map();

export default async function handler(req, res) {
  const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();
  const lastRequest = rateLimiter.get(userIp) || 0;
  
  if (now - lastRequest < 2000) {  // Max 1 req cada 2 segundos
    return res.status(429).json({ error: 'Too many requests' });
  }
  
  rateLimiter.set(userIp, now);
  // ... resto del código
}
```

**Beneficio:** Protege contra abuso de API (costos OpenAI)

---

## 🚀 Implementación Paso a Paso

### Fase 1: Cambio Mínimo (15 min)

1. ✅ Agregar import en `EconeuraCockpit.tsx`
2. ✅ Reemplazar `handleSendMessage()`
3. ✅ Probar en desarrollo local
4. ✅ Commit + push

### Fase 2: Testing (10 min)

1. ✅ Probar 5 casos de prueba
2. ✅ Verificar errores se muestran bien
3. ✅ Verificar respuestas de GPT-4

### Fase 3: Deploy (5 min)

1. ✅ `git push origin main`
2. ✅ Vercel auto-deploy
3. ✅ Probar en producción

**Tiempo total:** ~30 minutos

---

## 📈 Métricas de Éxito

| Métrica | Antes | Después | Meta |
|---------|-------|---------|------|
| Respuestas reales | 0% | 100% | ✅ |
| Latencia promedio | N/A | <3s | ✅ |
| Tasa de error | N/A | <5% | ✅ |
| Satisfacción usuario | N/A | 90%+ | 🎯 |

---

## 🔐 Consideraciones de Seguridad

1. ✅ **API Key segura:** Nunca exponer en frontend, solo en Vercel env vars
2. ✅ **Rate limiting:** Implementar en `/api/chat.js`
3. ✅ **Input validation:** Validar mensaje antes de enviar a OpenAI
4. ✅ **Error handling:** No exponer detalles internos al usuario
5. ✅ **CORS:** Configurado en Vercel para producción

---

## 📚 Documentación Relacionada

- `docs/OPENAI_INTEGRATION.md` - Integración OpenAI existente
- `apps/web/src/utils/invokeAgent.ts` - Función unificada
- `packages/configs/agent-routing.json` - Configuración de rutas
- `.env.example` - Variables de entorno

---

## ✅ Checklist Final

- [ ] Import `invokeAgent` en Cockpit
- [ ] Reemplazar `handleSendMessage()` 
- [ ] Probar en desarrollo (backend Node.js)
- [ ] Verificar `OPENAI_API_KEY` en Vercel
- [ ] Deploy a producción
- [ ] Probar 5 casos de prueba
- [ ] Documentar en CHANGELOG
- [ ] Commit + push
- [ ] Celebrar 🎉

---

**¿Listo para implementar?** Empezamos con Fase 1. 🚀
