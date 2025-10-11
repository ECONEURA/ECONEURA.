# 🚀 ECONEURA - Guía de Despliegue Vercel

## ✅ TODO LISTO PARA DESPLEGAR

Ya he preparado TODOS los archivos necesarios para desplegar ECONEURA en Vercel.

## 📦 Archivos Creados

### 1. **vercel.json** (Configuración principal)
- Build command configurado
- Rewrites para SPA
- API endpoints mapeados
- CORS headers configurados

### 2. **API Serverless Functions**
- `api/vercel-health.js` - Health check endpoint
- `api/vercel-invoke.js` - Invoke agent endpoint
- Compatible con Vercel runtime
- 11 agentes configurados (neura-1 a neura-11)

### 3. **Frontend Build**
- ✅ Build verificado y funcional
- ✅ Vite genera dist/ correctamente
- ✅ Variables de entorno configuradas

---

## 🎯 OPCIÓN 1: Desplegar desde VS Code (MÁS RÁPIDO)

### Pasos:

1. **Abrir terminal en VS Code**
   ```bash
   cd /path/to/ECONEURA.
   ```

2. **Ejecutar Vercel CLI**
   ```bash
   vercel
   ```

3. **Seguir prompts interactivos:**
   - "Set up and deploy?" → **Y** (Yes)
   - "Which scope?" → Selecciona tu cuenta
   - "Link to existing project?" → **N** (No, create new)
   - "What's your project's name?" → `econeura-cockpit`
   - "In which directory is your code located?" → `.` (current directory)
   - Vercel detectará la configuración automáticamente

4. **Esperar despliegue**
   - Tarda 1-2 minutos
   - Vercel subirá todo, ejecutará build, desplegará API

5. **¡LISTO!**
   - Vercel te dará URL pública: `https://econeura-cockpit-xxx.vercel.app`
   - Backend API automático: `https://econeura-cockpit-xxx.vercel.app/api/health`

---

## 🎯 OPCIÓN 2: Integración GitHub + Vercel (RECOMENDADO)

### Ventajas:
- ✅ Auto-deploy en cada push
- ✅ Preview URLs para PRs
- ✅ Rollback fácil
- ✅ Logs y analytics

### Pasos:

1. **Ve a https://vercel.com/new**
2. **Conecta tu cuenta de GitHub**
3. **Importa el repositorio `ECONEURA/ECONEURA.`**
4. **Vercel detecta automáticamente:**
   - Build command: `cd apps/web && pnpm install && pnpm build`
   - Output directory: `apps/web/dist`
   - Framework: React + Vite
5. **Haz clic en "Deploy"**
6. **¡LISTO EN 2 MINUTOS!**

---

## 🔧 Configurar Variables de Entorno en Vercel

Una vez desplegado, puedes agregar variables:

1. Ve a tu proyecto en Vercel Dashboard
2. Click en **Settings** → **Environment Variables**
3. Agrega:
   - `MAKE_FORWARD` = `0` (o `1` para producción)
   - `MAKE_TOKEN` = `tu-token-de-make-com`

---

## 📊 Qué Obtienes

### Frontend:
- ✅ React Cockpit completo
- ✅ 40 agentes organizados por departamentos
- ✅ Iconos profesionales
- ✅ Sistema de voz
- ✅ Chat interactivo

### Backend API:
- ✅ `/api/health` - Health check
- ✅ `/api/invoke/:agentId` - Invoke agent
- ✅ Modo simulación por defecto
- ✅ CORS habilitado
- ✅ Headers validados (Authorization, X-Route, X-Correlation-Id)

### Infraestructura:
- ✅ CDN global (Edge Network)
- ✅ HTTPS automático
- ✅ Auto-scaling
- ✅ Tier gratuito generoso
- ✅ Custom domain support

---

## 🧪 Probar Localmente Antes de Desplegar

```bash
# Terminal 1: Instalar Vercel CLI (ya hecho)
npm i -g vercel

# Terminal 2: Desarrollo local con Vercel
cd /path/to/ECONEURA.
vercel dev

# Abre: http://localhost:3000
```

Esto simula el entorno de Vercel localmente con las API functions.

---

## 🎉 Resultado Final

Una vez desplegado, tendrás:

**URL Pública:** `https://econeura-cockpit-[random].vercel.app`

**Endpoints:**
- `GET /api/health` → Status del sistema
- `POST /api/invoke/neura-1` → Invocar agente 1
- `POST /api/invoke/neura-2` → Invocar agente 2
- ... (hasta neura-11)

**Frontend:**
- Cockpit completo funcionando
- Conectado al backend automáticamente
- Listo para usar

---

## ❓ Si Tienes Problemas

### Build Fails:
- Verifica que `pnpm` esté instalado
- Revisa logs en Vercel Dashboard

### API No Responde:
- Verifica variables de entorno
- Revisa logs de functions

### CORS Errors:
- Ya está configurado en vercel.json
- Si persiste, agrega dominio en headers

---

## 📝 Comandos Útiles

```bash
# Deploy a producción
vercel --prod

# Ver logs
vercel logs [deployment-url]

# Lista deployments
vercel ls

# Rollback
vercel rollback [deployment-id]
```

---

## 🚀 ¡LISTO PARA DESPLEGAR!

**Ejecuta ahora:**

```bash
cd /path/to/ECONEURA.
vercel
```

**O conecta GitHub + Vercel en:**
https://vercel.com/new

**¡Todo está preparado! Solo falta hacer deploy.** 🎉
