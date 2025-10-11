# 🎯 PROMPT PARA COPILOT - COCKPIT ECONEURA

## OBJETIVO CLARO Y SIMPLE:

Crear un **Cockpit visual atractivo** para ECONEURA con:

### 1. CHAT NEURA PREMIUM 💬
- **OpenAI directo** (GPT-4, GPT-4-Turbo, o1-preview, o1-mini)
- **Todas las funciones de OpenAI**: streaming, function calling, vision, etc.
- **Sin agentes intermedios** - Cliente OpenAI directo en el frontend
- **Contexto por departamento** - Cada chat tiene personalidad según el área

### 2. AGENTES CONECTADOS A MAKE.COM 🔗
- **Webhook de Make.com** para activar/desactivar cada agente
- **Indicador visual de estado**: 
  - 🟢 Activo (ejecutando)
  - 🔴 Inactivo (pausado)
  - ⚠️ Error
- **Botón de activación automática** - Toggle on/off por agente
- **NO ejecutar agentes Python** - Solo llamar webhook de Make.com

### 3. DISEÑO VISUAL 🎨
- **Cockpit existente** (ya proporcionado por el usuario)
- 10 departamentos con colores Mediterranean
- Logo ECONEURA (árbol-circuito con nodos dorados)
- Sidebar con navegación
- Chat drawer lateral (380px)
- Tarjetas de agentes con progreso y botones

---

## ❌ ERRORES QUE NUNCA COMETER:

1. **NO intentar usar agentes Python backend** (neura-1, neura-9, etc.)
2. **NO usar el Gateway FastAPI** para el chat
3. **NO crear servicios intermedios** - OpenAI directo
4. **NO inventar arquitecturas complejas** - Keep it simple
5. **NO decir "está listo"** sin verificar configuración
6. **SIEMPRE verificar** que las API keys estén configuradas
7. **SIEMPRE reiniciar Vite** después de cambiar .env

---

## ✅ IMPLEMENTACIÓN CORRECTA:

### Paso 1: Configurar .env
```env
# OpenAI (puede ser Azure OpenAI o OpenAI.com)
VITE_OPENAI_API_KEY=sk-proj-XXXXXXXX
VITE_OPENAI_MODEL=gpt-4-turbo-preview
VITE_OPENAI_BASE_URL=https://api.openai.com/v1

# Make.com Webhooks (uno por agente)
VITE_MAKE_WEBHOOK_CEO=https://hook.us1.make.com/xxxxx
VITE_MAKE_WEBHOOK_IA=https://hook.us1.make.com/xxxxx
VITE_MAKE_WEBHOOK_CSO=https://hook.us1.make.com/xxxxx
# ... etc para cada departamento
```

### Paso 2: Chat NEURA con OpenAI
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

async function sendChatMessage(message: string, department: string) {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `Eres NEURA-${department}, asistente experto en ${department}.`
      },
      { role: 'user', content: message }
    ],
    stream: true,
    temperature: 0.7
  });
  
  // Procesar streaming response
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    // Actualizar UI en tiempo real
  }
}
```

### Paso 3: Activación de Agentes Make.com
```typescript
async function toggleAgent(agentId: string, active: boolean) {
  const webhookUrl = import.meta.env[`VITE_MAKE_WEBHOOK_${agentId}`];
  
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: active ? 'activate' : 'deactivate',
      agent_id: agentId,
      timestamp: new Date().toISOString()
    })
  });
  
  return response.ok;
}
```

### Paso 4: Indicador de Estado
```typescript
// Polling cada 30 segundos para verificar estado
async function checkAgentStatus(agentId: string) {
  const statusUrl = `${webhookUrl}/status`;
  const response = await fetch(statusUrl);
  const data = await response.json();
  
  return {
    status: data.active ? 'active' : 'inactive',
    lastExecution: data.last_execution,
    errorCount: data.error_count
  };
}
```

---

## 🔧 CONFIGURACIÓN AZURE OPENAI (Alternativa)

Si usas Azure OpenAI en lugar de OpenAI.com:

```env
VITE_OPENAI_API_KEY=TU_AZURE_KEY
VITE_OPENAI_BASE_URL=https://tu-recurso.openai.azure.com
VITE_OPENAI_API_VERSION=2024-02-01
VITE_OPENAI_DEPLOYMENT=gpt-4
```

```typescript
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  baseURL: `${import.meta.env.VITE_OPENAI_BASE_URL}/openai/deployments/${import.meta.env.VITE_OPENAI_DEPLOYMENT}`,
  defaultQuery: { 'api-version': import.meta.env.VITE_OPENAI_API_VERSION },
  defaultHeaders: { 'api-key': import.meta.env.VITE_OPENAI_API_KEY },
  dangerouslyAllowBrowser: true
});
```

---

## 📝 CHECKLIST ANTES DE DECIR "ESTÁ LISTO":

- [ ] .env tiene API keys configuradas
- [ ] Vite reiniciado después de cambiar .env
- [ ] Chat envía mensajes a OpenAI directamente
- [ ] Streaming funciona en tiempo real
- [ ] Botones de agentes llaman webhooks de Make.com
- [ ] Indicadores de estado muestran si agente está activo
- [ ] UI responsive y atractiva
- [ ] Sin errores en consola del navegador
- [ ] Probado con mensaje real: "Hola" → responde OpenAI

---

## 🎯 RESULTADO ESPERADO:

1. Usuario abre http://localhost:3000
2. Ve cockpit con 10 departamentos
3. Click "Abrir chat" → Chat NEURA aparece
4. Escribe "Hola" → OpenAI responde en tiempo real
5. Click botón "Ejecutar" en agente → Webhook Make.com activado
6. Indicador cambia a 🟢 Activo
7. Click "Pausar" → Webhook desactiva → Indicador 🔴 Inactivo

**SIN ERRORES. SIN COMPLICACIONES. SIMPLE Y FUNCIONAL.**

---

## 🚫 LO QUE NO DEBE PASAR:

- ❌ "El agente neura-9 no responde" → NO USAR AGENTES PYTHON
- ❌ "Gateway en puerto 8080" → NO USAR GATEWAY PARA CHAT
- ❌ "Base de datos PostgreSQL" → NO NECESARIO
- ❌ "Error de conexión localhost:3101" → NO ARRANCAR SERVICIOS PYTHON
- ❌ "Modo demostración" → CONFIGURAR API KEY PRIMERO

---

## 🎓 LECCIONES APRENDIDAS:

1. **El usuario sabe lo que quiere** - Escuchar literalmente
2. **Simple > Complejo** - No sobreingeniería
3. **Verificar antes de confirmar** - No asumir que funciona
4. **OpenAI directo = Menos fallos** - Sin intermediarios
5. **Make.com = Ejecución externa** - No reinventar la rueda
