Desarrollo local - guía rápida

1. Instalar dependencias y preparar entorno

- Usando el script bootstrap (sh o PowerShell):

  sh scripts/bootstrap.sh

  # o en PowerShell

  pwsh -File scripts/bootstrap.ps1

2. Ejecutar la aplicación web en modo dev

pnpm --filter @econeura/web dev

3. Correr tests unitarios

pnpm test

4. Ejecutar E2E local (requiere build y servir `apps/web/dist`)

pnpm --filter @econeura/web build npx http-server apps/web/dist -p 5173 & pnpm
run e2e:web

5. Cobertura y gate de PR

Nota: El workflow de cobertura a nivel de repo ha sido desactivado temporalmente
y sustituido por un CI más simple y fiable. Si necesitas restablecer una
política de cobertura en PRs, crea una propuesta de workflow enfocada y probada
para incluirlo nuevamente.

---

Arrancar (PowerShell):

pwsh -NoProfile -ExecutionPolicy Bypass -File
.\\.dev\\cockpit\\setup-cockpit.ps1

Probar (smoke):

pwsh -NoProfile -Command "Invoke-WebRequest -UseBasicParsing
http://127.0.0.1:8080/ | Select-String '<div id=\"root\"'"

Parar (por PID):

pwsh -NoProfile -Command "Stop-Process -Id <PID> -Force"

## Integración continua (CI) 🚀

Puedes ver el estado del workflow de cockpit en GitHub Actions mediante este
badge:

[![cockpit CI](https://github.com/ECONEURA/ECONEURA-/actions/workflows/cockpit-ci.yml/badge.svg)](https://github.com/ECONEURA/ECONEURA-/actions/workflows/cockpit-ci.yml)

El PR en `feature/cockpit-dev-setup` contiene los scripts y pruebas para
arrancar el cockpit en local.

## Crear PR desde la máquina

Si quieres crear el PR automáticamente desde tu entorno local (sin usar la UI),
exporta un token de GitHub con permisos de repositorio en `GITHUB_TOKEN` y
ejecuta:

```powershell
Set-Location -LiteralPath "C:\Users\Usuario\ECONEURA-\ECONEURA-"
$env:GITHUB_TOKEN = "<YOUR_TOKEN_HERE>"
.
\scripts\create-pr.ps1
```

## Verificar entorno de desarrollo

Hemos añadido un pequeño helper para comprobar que tienes instalado Node.js y
pnpm antes de ejecutar los tests localmente.

Linux / macOS / WSL:

```bash
./scripts/check_env.sh
```

Windows (PowerShell):

```powershell
bash .\scripts\check_env.sh
```

Si el script detecta falta de herramientas mostrará pasos rápidos para
instalarlas.

## Devcontainer

Se incluye un DevContainer básico en `.devcontainer/` para reproducir el entorno
de desarrollo (Node 20 + pnpm). Abre la carpeta en VS Code y selecciona "Reopen
in Container".

El script creará un PR draft usando los valores por defecto. Puedes editar el
archivo `.git/PR_DRAFT_BODY.md` para personalizar el cuerpo antes de ejecutar.
