# ⚡ START HERE - INTEGRACIÓN OPENAI EN 3 PASOS

**Todos tus chats NEURA ahora tienen capacidades ChatGPT completas.**

---

## 🚀 PASO 1: Configurar (1 minuto)

```powershell
# Ejecutar script de configuración
.\START_NEURA_OPENAI.ps1
```

**Te pedirá tu API Key:**
- 🔑 Obtén una en: https://platform.openai.com/api-keys
- 📋 Copia y pega cuando te lo pida

---

## 🎯 PASO 2: Arrancar Cockpit (30 segundos)

**En OTRO terminal:**

```powershell
.\START_COCKPIT.ps1
```

---

## ✅ PASO 3: Probar (10 segundos)

1. Abre: **http://localhost:3000**
2. Click: **"Abrir chat"**
3. Escribe: **"Hola CFO, analiza nuestros gastos del último trimestre"**
4. ✨ **Respuesta GPT-4o en segundos**

---

## 🎭 10 AGENTES DISPONIBLES

- `neura-1` → Analytics Specialist
- `neura-2` → Chief Data Officer
- `neura-3` → **Chief Financial Officer** ⭐
- `neura-4` → Chief HR Officer
- `neura-5` → Chief Security Officer
- `neura-6` → Chief Marketing Officer
- `neura-7` → Chief Technology Officer
- `neura-8` → Legal Counsel
- `neura-9` → Reception Assistant
- `neura-10` → Research Specialist

---

## 💡 LO QUE TIENES AHORA

✅ **Memoria conversacional** - Cada agente recuerda tus conversaciones  
✅ **Personalidades especializadas** - CFO habla de finanzas, CTO de tech  
✅ **GPT-4o** - El modelo más avanzado de OpenAI  
✅ **Streaming opcional** - Respuestas token por token  
✅ **CERO cambios frontend** - Funciona con tu UI actual

---

## 🐛 ¿PROBLEMAS?

### "Python not found" o "node not found"

```powershell
# Ignóralo - solo necesitas el backend Node.js
cd apps\api_node
node server-simple.js
```

### Backend no arranca

```powershell
# Instalar dependencias
cd apps\api_node
npm install
node server-simple.js
```

### "OPENAI_API_KEY not configured"

```powershell
# Ejecuta el script de nuevo
.\START_NEURA_OPENAI.ps1

# O crea .env manualmente:
echo "OPENAI_API_KEY=sk-proj-TU_KEY_AQUI" > apps\api_node\.env
```

---

## 📚 DOCUMENTACIÓN COMPLETA

- **Guía detallada:** `docs/OPENAI_CHAT_INTEGRATION_GUIDE.md`
- **Resumen ejecutivo:** `docs/OPENAI_INTEGRATION_COMPLETE.md`
- **Código fuente:** `apps/api_node/services/openaiService.js`

---

## 🧪 PRUEBA RÁPIDA (PowerShell)

```powershell
# Verificar que funciona
$body = @{
    input = "Hola, ¿cómo estás?"
    userId = "test"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/invoke/neura-3" `
  -Method Post -Body $body -ContentType "application/json"

# Deberías ver una respuesta del CFO con GPT-4o
```

---

## 💬 CONVERSACIÓN DE EJEMPLO

```
TÚ:  "¿Cuál es nuestra posición financiera?"
CFO: "Como CFO, puedo decirte que nuestra posición 
      financiera actual muestra..."

TÚ:  "¿Y cuáles son los principales riesgos?"
CFO: "Basándome en la posición financiera que mencioné,
      los principales riesgos son..."
      ↑ Recuerda el contexto automáticamente
```

---

## ✨ ESO ES TODO

**3 comandos. 2 minutos. Capacidades ChatGPT completas.**

```powershell
# Terminal 1
.\START_NEURA_OPENAI.ps1

# Terminal 2
.\START_COCKPIT.ps1

# Browser
http://localhost:3000
```

**¡Disfruta tus agentes IA mejorados! 🚀**
