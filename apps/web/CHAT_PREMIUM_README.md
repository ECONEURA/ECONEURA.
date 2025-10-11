# 🚀 Chat NEURA Premium - Configuración OpenAI

El cockpit ECONEURA incluye un **Chat NEURA Premium** integrado con OpenAI directamente en el frontend.

## ✨ Funcionalidades

- ✅ **OpenAI GPT-4** integrado directamente
- ✅ **Contexto por departamento** - Cada NEURA especializado en su área
- ✅ **Historial de conversación** - Mantiene contexto de últimos 10 mensajes
- ✅ **TTS/STT** - Text-to-Speech y Speech-to-Text en español
- ✅ **Modo demostración** - Funciona sin API key (con respuesta simulada)

## 🔧 Configuración Rápida

### 1. Crear archivo `.env`

```bash
cd apps/web
cp .env.example .env
```

### 2. Configurar tu API Key de OpenAI

Edita `apps/web/.env`:

```env
VITE_OPENAI_API_KEY=sk-tu-api-key-aqui
VITE_OPENAI_MODEL=gpt-4
```

### 3. Obtener API Key

1. Ve a https://platform.openai.com/api-keys
2. Crea una nueva API key
3. Cópiala y pégala en tu archivo `.env`

### 4. Reiniciar Vite

```bash
# Detén el servidor con Ctrl+C
# Vuelve a arrancar
npx vite
```

## 🎯 Modelos Disponibles

Puedes cambiar el modelo en `.env`:

```env
# GPT-4 (recomendado para respuestas premium)
VITE_OPENAI_MODEL=gpt-4

# GPT-4 Turbo (más rápido)
VITE_OPENAI_MODEL=gpt-4-turbo-preview

# GPT-3.5 Turbo (más económico)
VITE_OPENAI_MODEL=gpt-3.5-turbo
```

## 💡 Uso

1. **Abre el cockpit**: http://localhost:3000
2. **Selecciona un departamento** (CEO, IA, CTO, etc.)
3. **Haz clic en "Abrir chat"**
4. **Escribe tu mensaje** o usa el micrófono 🎤
5. **NEURA responde** con expertise en el área del departamento

## 🎭 Contextos por Departamento

Cada departamento tiene su propio contexto especializado:

- **CEO**: Estrategia ejecutiva, decisiones corporativas, OKRs
- **IA**: Plataforma de IA, modelos, costes, optimización
- **CTO**: Tecnología, arquitectura, infraestructura cloud
- **CISO**: Seguridad, compliance, vulnerabilidades
- **CFO**: Finanzas, presupuesto, cash flow
- **CHRO**: Recursos humanos, talento, clima laboral
- **CMO**: Marketing, campañas, embudo comercial
- **COO**: Operaciones, procesos, SLAs
- **CSO**: Estrategia, M&A, análisis de mercado
- **CDO**: Datos, calidad, gobierno de datos

## 🔒 Seguridad

⚠️ **IMPORTANTE**: 
- El archivo `.env` está en `.gitignore` - NO lo subas a Git
- Tu API key es privada - No la compartas
- Rotala regularmente desde https://platform.openai.com/api-keys

## 🎨 Personalización

Puedes modificar el comportamiento del chat editando la función `callOpenAI` en `App.tsx`:

```typescript
// Cambiar temperatura (0-2, más alto = más creativo)
temperature: 0.7,

// Cambiar tokens máximos
max_tokens: 1000,

// Modificar el prompt del sistema
content: `Eres NEURA-${departmentContext}...`
```

## 🐛 Troubleshooting

### "Error al conectar con OpenAI"
- Verifica que tu API key sea correcta
- Revisa que tengas créditos en tu cuenta OpenAI
- Comprueba tu conexión a internet

### "Modo demostración"
- Falta configurar la API key en `.env`
- Reinicia Vite después de crear el archivo `.env`

### Chat no responde
- Abre la consola del navegador (F12)
- Verifica errores de CORS o red
- Comprueba que Vite esté corriendo en puerto 3000

## 📊 Costes

Los costes dependen del modelo usado:

- **GPT-4**: ~$0.03 por 1K tokens input, ~$0.06 por 1K output
- **GPT-4 Turbo**: ~$0.01 por 1K tokens input, ~$0.03 por 1K output  
- **GPT-3.5**: ~$0.0005 por 1K tokens input, ~$0.0015 por 1K output

Una conversación típica usa ~500-1000 tokens.

## 🚀 Siguientes Pasos

- [ ] Añadir función de streaming para respuestas en tiempo real
- [ ] Integrar herramientas (web search, code execution)
- [ ] Guardar historial en localStorage
- [ ] Añadir export de conversaciones
- [ ] Integrar con backend para analytics

---

**¿Preguntas?** Abre un issue en el repositorio.
