# 🚀 DEPLOY ECONEURA A AZURE - COMANDOS DIRECTOS

## ⚡ OPCIÓN 1: DEPLOY MANUAL DESDE VS CODE (2 MINUTOS)

### Paso 1: Abre el panel de Azure
1. Presiona `Ctrl+Shift+P`
2. Escribe: `Azure Static Web Apps: Create Static Web App (Advanced)`
3. Enter

### Paso 2: Completa el wizard
- **Subscription**: Selecciona la tuya
- **Name**: `econeura-cockpit`
- **Region**: `East US 2`
- **SKU**: `Free`
- **Repository**: Este repositorio actual
- **Branch**: `copilot/vscode1759934617859` (o la que quieras)
- **Build preset**: `Custom`
- **App location**: `/apps/web`
- **API location**: `/api`
- **Output location**: `dist`

### Paso 3: Espera 3-5 minutos
Azure creará todo automáticamente y te dará la URL.

---

## ⚡ OPCIÓN 2: GITHUB ACTIONS (AUTOMÁTICO)

Commitea y pushea los cambios:

```powershell
cd C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-PUNTO

git add .
git commit -m "feat: Azure Static Web Apps configuration"
git push origin copilot/vscode1759934617859
```

Luego en GitHub:
1. Ve a tu repo → Settings → Secrets
2. Add new secret: `AZURE_STATIC_WEB_APPS_API_TOKEN` (lo obtienes de Azure Portal)

---

## ⚡ OPCIÓN 3: USAR VERCEL (MÁS RÁPIDO - 1 MINUTO)

Si Azure tarda mucho, usa Vercel:

```powershell
# Instalar Vercel CLI
npm install -g vercel

# Deploy
cd apps\web
vercel --prod
```

Responde:
- **Framework**: Vite
- **Build command**: `pnpm build`
- **Output directory**: `dist`

¡LISTO EN 60 SEGUNDOS! 🎉

---

## 🎯 ¿CUÁL PREFIERES?

1️⃣ = Azure Static Web Apps (VS Code wizard)
2️⃣ = GitHub Actions (automático en cada push)
3️⃣ = Vercel (el más rápido, 1 minuto)

**Dime cuál quieres y te doy los pasos EXACTOS sin más rodeos** 🚀
