# 🚀 Despliegue de ECONEURA en Azure Static Web Apps

## ✅ Pre-requisitos Completados
- [x] Azure Static Web Apps extensión instalada en VS Code
- [x] Archivos de configuración creados:
  - `apps/web/staticwebapp.config.json`
  - `api/health.js` (Azure Function)
  - `api/invoke.js` (Azure Function)
  - `api/host.json`
  - `api/package.json`

---

## 📋 Pasos para Desplegar

### **Paso 1: Abrir el Panel de Azure en VS Code**

1. Haz clic en el icono de **Azure** en la barra lateral izquierda (logo de "A" azul)
2. Verás una sección llamada **"Static Web Apps"**

---

### **Paso 2: Crear la Static Web App**

1. En la sección "Static Web Apps", haz clic en el **icono "+"** (Create Static Web App)
2. Se abrirá un wizard. Sigue estos pasos:

#### **2.1 Selecciona tu Subscription**
- Elige tu suscripción de Azure activa

#### **2.2 Nombre de la aplicación**
- Escribe: `econeura-cockpit`

#### **2.3 Región**
- Selecciona: **East US 2** (o tu región preferida)

#### **2.4 Build Preset**
- Selecciona: **Custom**

#### **2.5 Ubicación del código de la aplicación**
- Escribe: `/apps/web`
  - ⚠️ **Importante**: Debe empezar con `/`

#### **2.6 Ubicación del código de la API** (Azure Functions)
- Escribe: `/api`
  - ⚠️ **Importante**: Debe empezar con `/`

#### **2.7 Ubicación de salida del build**
- Escribe: `dist`
  - ℹ️ Esta es la carpeta donde Vite genera el build de producción

---

### **Paso 3: Esperar el Despliegue Inicial**

1. VS Code creará automáticamente:
   - **Resource Group** en Azure
   - **Static Web App** resource
   - **GitHub Action** en tu repositorio (archivo `.github/workflows/azure-static-web-apps-xxx.yml`)

2. El primer despliegue tardará **2-5 minutos**

3. Verás el progreso en la terminal de VS Code

---

### **Paso 4: Verificar el Despliegue**

1. Una vez completado, VS Code te mostrará la **URL pública**:
   ```
   https://econeura-cockpit-xxx.azurestaticapps.net
   ```

2. Haz clic en la URL para abrir en el navegador

3. **Deberías ver el Cockpit ECONEURA funcionando** 🎉

---

### **Paso 5: Configurar Variables de Entorno en Azure**

Para que el backend funcione con Make.com:

1. En el panel de Azure en VS Code, encuentra tu Static Web App
2. Haz clic derecho → **Open in Portal**
3. En Azure Portal, ve a **Configuration** (menú izquierdo)
4. Haz clic en **+ New application setting**
5. Agrega las siguientes variables:

| Name | Value |
|------|-------|
| `MAKE_FORWARD` | `1` (para activar forwarding a Make.com) |
| `MAKE_TOKEN` | `tu-token-de-make-com` |

6. Haz clic en **Save**

---

## 🎯 Resultado Final

Tendrás:
- ✅ **Frontend**: React Cockpit en `https://econeura-cockpit-xxx.azurestaticapps.net`
- ✅ **Backend API**: Azure Functions en `/api/health` y `/api/invoke/:agentId`
- ✅ **CI/CD**: Cada push a GitHub despliega automáticamente
- ✅ **HTTPS**: SSL incluido gratis
- ✅ **Dominio custom**: Puedes agregar tu propio dominio después

---

## 🔧 Comandos Útiles (Opcional)

Si quieres probar localmente antes de desplegar:

```powershell
# Instalar dependencias de la API
cd api
npm install

# Instalar Azure Functions Core Tools (si no lo tienes)
npm install -g azure-functions-core-tools@4

# Iniciar API localmente (puerto 7071)
func start

# En otra terminal, iniciar frontend
cd apps/web
pnpm dev
```

Frontend correrá en `http://localhost:3000` y llamará a API en `http://localhost:7071/api`

---

## 📝 Notas Importantes

1. **Build Command Automático**: Azure Static Web Apps detectará automáticamente que usas pnpm y ejecutará:
   ```bash
   cd apps/web
   pnpm install
   pnpm build
   ```

2. **API Automática**: Las Azure Functions en `/api` se despliegan automáticamente junto con el frontend

3. **Modo Simulation**: Por defecto, la API funciona en modo simulación (no necesitas Make.com)

4. **Activar Make.com**: Configura `MAKE_FORWARD=1` y `MAKE_TOKEN` en Azure Portal

---

## 🎉 ¡LISTO PARA DESPLEGAR!

**EMPIEZA AHORA**:
1. Haz clic en el icono de **Azure** en VS Code
2. Busca **"Static Web Apps"**
3. Haz clic en el **"+"** para crear

**¿Listo? ¡Dime cuando empieces y te guío paso a paso!** 🚀
