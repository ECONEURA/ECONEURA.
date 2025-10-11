# 🏆 CONFIGURACIÓN PREMIUM: Lo Mejor de OpenAI

## ⚡ Resumen Ejecutivo

**Ya estás usando GPT-4o** (el mejor modelo general de OpenAI) ✅

**Ahora puedes usar o1-preview** para tareas ultra-complejas automáticamente 🧠

---

## 🎯 ¿Qué es esto?

### **Sistema Adaptativo de Modelos**

Tu ECONEURA ahora **elige inteligentemente** qué modelo usar:

- **GPT-4o** (default): 90% de tareas
  - ⚡ Rápido (2-3 segundos)
  - 💰 Económico ($5/$15 por 1M tokens)
  - 🎯 Excelente para todo uso general

- **o1-preview** (automático): Tareas complejas
  - 🧠 Razonamiento profundo (30-60 segundos)
  - 💎 Premium ($15/$60 por 1M tokens)
  - 🔬 Superior para análisis estratégicos

---

## 🚀 Uso Inmediato

### 1️⃣ **Configurar** (1 minuto)

Edita `apps/api_node/.env`:

```bash
# Ya tienes esto ✅
OPENAI_API_KEY=sk-proj-TU_KEY_AQUI

# Añade esto 👇
ALLOW_O1_PREVIEW=true         # Activar o1-preview
PREFER_SPEED=false            # false = calidad, true = velocidad
COMPLEXITY_THRESHOLD=0.6      # 0.6 = balance perfecto
```

### 2️⃣ **Iniciar Backend**

```powershell
.\START_NEURA_OPENAI.ps1
```

### 3️⃣ **Probar**

```powershell
# Demo automática
.\DEMO_MODELO_ADAPTATIVO.ps1

# O prueba manual:
node apps/api_node/ejecutaAgente.js "Análisis financiero profundo con forecast 5 años"
```

---

## 🎭 Ejemplos Automáticos

### ⚡ **Usa GPT-4o** (rápido)

```bash
"¿Cuál es el horario?"              → gpt-4o
"Dame ideas para marketing"         → gpt-4o  
"Resumen de esta reunión"           → gpt-4o
```

### 🧠 **Usa o1-preview** (profundo)

```bash
"Análisis financiero profundo con DCF"           → o1-preview
"Auditoría de seguridad completa OWASP"          → o1-preview
"Diseña arquitectura escalable multi-región"     → o1-preview
"Análisis legal de contrato M&A"                 → o1-preview
```

**¡EL SISTEMA DECIDE SOLO!** 🎯

---

## 💰 Costos Reales

### Ejemplo: 1,000 conversaciones/mes

| Escenario | GPT-4o | o1-preview | Costo Total |
|-----------|--------|------------|-------------|
| **Solo GPT-4o** | 1000 | 0 | **$17.50** |
| **Mix inteligente** | 900 | 100 | **$24.25** |
| **Solo o1-preview** | 0 | 1000 | **$67.50** |

**Recomendado:** Mix inteligente (38% más que GPT-4o, pero 179% menos que solo o1) ✅

---

## 🔍 Ver Estadísticas

### En tiempo real:

```powershell
# PowerShell
Invoke-RestMethod -Uri "http://localhost:8080/api/stats/models" | ConvertTo-Json
```

```bash
# Bash/curl
curl http://localhost:8080/api/stats/models | jq
```

### Respuesta:

```json
{
  "stats": {
    "gpt-4o": {
      "count": 847,
      "tokens": 1245000,
      "cost": 14.32
    },
    "o1-preview": {
      "count": 153,
      "tokens": 892000,
      "cost": 61.78
    },
    "total": {
      "count": 1000,
      "tokens": 2137000,
      "cost": 76.10
    }
  },
  "config": {
    "allowO1": true,
    "preferSpeed": false,
    "complexityThreshold": 0.6
  }
}
```

---

## 🧭 Ver Capacidades Avanzadas por Agente

Consulta todo lo que cada NEURA puede hacer (modelos disponibles, disparadores de razonamiento, features premium).

```powershell
# PowerShell
Invoke-RestMethod -Uri "http://localhost:8080/api/agents/capabilities" | ConvertTo-Json -Depth 4
```

```bash
# Bash/curl
curl http://localhost:8080/api/agents/capabilities | jq
```

### Qué devuelve

- `summary.totalAgents`: número total de agentes NEURA.
- `summary.reasoningAgents`: cuántos tienen acceso a o1-preview.
- `agents[i].defaultModel`: siempre **GPT-4o** con capacidades multimodales.
- `agents[i].reasoningModel`: **o1-preview** para razonamiento profundo (si aplica).
- `agents[i].reasoningLiteModel`: **o1-mini** para análisis medio intensivo.
- `agents[i].economyModel`: **gpt-4o-mini** para respuestas ultra rápidas/económicas.
- `agents[i].features`: lista humana de funciones premium listadas para el agente.
- `agents[i].complexTriggers`: palabras clave que activan reasoning automático.

### Ejemplo (abreviado)

```json
{
  "summary": {
    "totalAgents": 10,
    "reasoningAgents": 7,
    "liteReasoningAgents": 7,
    "economyAgents": 10
  },
  "agents": [
    {
      "agentId": "neura-3",
      "name": "CFO",
      "defaultModel": {
        "id": "gpt-4o",
        "tier": "premium",
        "strengths": ["multimodal", "respuestas rápidas", "contexto 128K tokens"]
      },
      "reasoningModel": {
        "id": "o1-preview",
        "tier": "deep-reasoning"
      },
      "reasoningLiteModel": {
        "id": "o1-mini",
        "tier": "deep-reasoning-lite"
      },
      "economyModel": {
        "id": "gpt-4o-mini",
        "tier": "economy"
      },
      "features": ["Valoraciones DCF", "Modelos financieros a largo plazo", "Planes de mitigación de riesgos"],
      "complexTriggers": ["valoración", "forecast 3 años", "análisis financiero", "due diligence"]
    }
  ]
}
```

---

## ⚙️ Ajustes Finos

### `COMPLEXITY_THRESHOLD`

Controla cuándo cambiar a o1-preview:

```bash
COMPLEXITY_THRESHOLD=0.4   # Más agresivo (más o1-preview)
COMPLEXITY_THRESHOLD=0.6   # Balance perfecto ✅
COMPLEXITY_THRESHOLD=0.8   # Conservador (casi solo GPT-4o)
```

### `PREFER_SPEED`

```bash
PREFER_SPEED=false   # Prioriza CALIDAD ✅
PREFER_SPEED=true    # Prioriza VELOCIDAD (siempre GPT-4o)
```

### `ALLOW_O1_PREVIEW`

```bash
ALLOW_O1_PREVIEW=true    # Sistema adaptativo activo ✅
ALLOW_O1_PREVIEW=false   # Solo GPT-4o (desactiva o1)
```

---

## 🧪 Testing

### Demo Completa

```powershell
.\DEMO_MODELO_ADAPTATIVO.ps1
```

### Casos Específicos

```powershell
# CFO - Análisis complejo
node apps/api_node/ejecutaAgente.js --agent neura-3 "Análisis financiero profundo considerando múltiples escenarios"

# CISO - Auditoría
node apps/api_node/ejecutaAgente.js --agent neura-5 "Auditoría exhaustiva de vulnerabilidades"

# CTO - Arquitectura  
node apps/api_node/ejecutaAgente.js --agent neura-7 "Diseña arquitectura escalable multi-región"
```

---

## 📊 Triggers Automáticos

El sistema detecta estas palabras/patrones y activa o1-preview:

### **CFO (neura-3)**
- "valoración", "forecast 3 años", "análisis financiero", "due diligence"

### **CISO (neura-5)**
- "auditoría", "vulnerabilidad", "threat modeling", "compliance"

### **CTO (neura-7)**
- "arquitectura", "debugging", "optimización", "escalabilidad"

### **Legal (neura-8)**
- "análisis jurídico", "contrato complejo", "litigation", "compliance"

### **Research (neura-10)**
- "investigación profunda", "meta-análisis", "review sistemático"

---

## 🎯 Agentes que SIEMPRE usan GPT-4o

Estos no necesitan razonamiento profundo:

- **Reception (neura-9)**: Preguntas simples
- **CHRO (neura-4)**: Consultas HR generales
- **CMO (neura-6)**: Marketing creativo

---

## ✅ Checklist Rápido

- [ ] `OPENAI_API_KEY` configurada en `.env`
- [ ] `ALLOW_O1_PREVIEW=true` en `.env`
- [ ] Backend corriendo (puerto 8080)
- [ ] Ejecutar `.\DEMO_MODELO_ADAPTATIVO.ps1`
- [ ] Ver estadísticas: `GET /api/stats/models`

---

## 🔮 Futuro: GPT-5

Cuando salga GPT-5:

1. Cambiar en código: `'gpt-4o'` → `'gpt-5'`
2. **¡Listo!** El sistema adaptativo seguirá funcionando igual

---

## 💡 Recomendación Final

**Configuración óptima para ECONEURA:**

```bash
OPENAI_API_KEY=tu_key_real
ALLOW_O1_PREVIEW=true
PREFER_SPEED=false
COMPLEXITY_THRESHOLD=0.6
```

**Resultado:**
- 🚀 Respuestas rápidas para 90% de casos (GPT-4o)
- 🧠 Razonamiento profundo para 10% crítico (o1-preview)
- 💰 Costo ~40% más que solo GPT-4o
- 🎯 Calidad superior en análisis complejos

---

## 📚 Documentación Completa

Ver: `docs/MODELO_PREMIUM_OPTIONS.md`

---

**¡YA TIENES LO MEJOR DE OPENAI!** 🏆
