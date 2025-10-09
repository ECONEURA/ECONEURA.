# Instalación de Azure Tools para ECONEURA

## Opción 1: Azure Static Web Apps (FÁCIL - YA INSTALADA)

✅ **Ya tienes la extensión instalada en VS Code**

**Pasos para desplegar**:
1. Presiona `Ctrl+Shift+P` en VS Code
2. Escribe: `Azure Static Web Apps: Create Static Web App...`
3. Selecciona:
   - **Subscription**: Tu suscripción de Azure
   - **Resource Group**: Crea uno nuevo: `rg-econeura`
   - **Name**: `econeura-cockpit`
   - **Region**: `East US` o tu región preferida
   - **Build Preset**: `Custom`
   - **App location**: `/apps/web`
   - **Output location**: `dist`
4. Espera 2-3 minutos mientras Azure crea recursos y hace deploy
5. ✅ ¡Listo! Obtendrás una URL pública como `https://econeura-cockpit-xxx.azurestaticapps.net`

**Ventajas**:
- No requiere instalar nada adicional
- CI/CD automático (cada push a GitHub despliega automáticamente)
- SSL gratis incluido
- Tier gratuito: 100 GB bandwidth/mes gratis

---

## Opción 2: Azure CLI + Container Apps (MÁS CONTROL)

Si quieres usar Container Apps (para tener backend Node.js separado):

### Instalar Azure CLI

**Windows (PowerShell como Admin)**:
```powershell
# Usando winget (recomendado)
winget install Microsoft.AzureCLI

# O usando MSI installer
# Descarga de: https://aka.ms/installazurecliwindows
```

### Instalar Azure Developer CLI (azd)

**Windows (PowerShell como Admin)**:
```powershell
# Usando winget
winget install Microsoft.Azd

# O usando PowerShell script
powershell -ex AllSigned -c "Invoke-RestMethod 'https://aka.ms/install-azd.ps1' | Invoke-Expression"
```

### Verificar instalación

```powershell
az --version
azd version
```

### Login a Azure

```powershell
az login
azd auth login
```

---

## 🎯 Mi Recomendación

**EMPIEZA CON OPCIÓN 1** (Azure Static Web Apps desde VS Code):
- ✅ Cero configuración
- ✅ Ya tienes la extensión
- ✅ Deploy inmediato
- ✅ Gratis para desarrollo

**Si necesitas más adelante**:
- Instala Azure CLI + AZD para Container Apps
- Migra cuando necesites microservicios escalables

---

## ¿Qué prefieres?

1️⃣ **Opción 1**: Usar Azure Static Web Apps AHORA (1 click, 5 minutos)  
2️⃣ **Opción 2**: Instalar Azure CLI primero (15 minutos setup, más flexibilidad)

**Yo recomiendo empezar con Opción 1** 🚀
