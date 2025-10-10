# Entorno local sin bloqueos (Windows)

El repositorio original suele residir bajo OneDrive (`C:\Users\<usuario>\OneDrive\...`).
Cuando `pnpm` intenta crear hardlinks dentro de OneDrive aparecen errores `EPERM` y
los comandos `pnpm install` / `pnpm run typecheck` fallan.

Para evitarlo, utiliza la automatización incluida en `scripts/powershell/setup-local-workspace.ps1`:

```powershell
# Desde la raíz del repositorio actual en OneDrive
powershell -ExecutionPolicy Bypass -File scripts/powershell/setup-local-workspace.ps1 -RunChecks
```

El script realiza:

1. Copia el repositorio a `C:\Dev\ECONEURA-PUNTO` (puedes cambiar la ruta con `-DestinationPath`).
2. Ejecuta `pnpm install --package-import-method copy` para restaurar dependencias sin hardlinks.
3. (Opcional con `-RunChecks`) lanza `pnpm run check` en `apps/api_node`.

Tras ejecutarlo, abre la nueva ruta con VS Code:

```powershell
cd C:\Dev\ECONEURA-PUNTO
code .
```

## Opciones del script

- `-SkipCopy`: si ya tienes una copia local, salta la fase de `robocopy`.
- `-SkipInstall`: sólo copia archivos, sin instalar dependencias.
- `-RunChecks`: ejecuta `pnpm run check` (requiere que no uses `-SkipInstall`).

## Validación manual

En la nueva ubicación podrás ejecutar sin errores:

```powershell
pnpm install --no-frozen-lockfile --package-import-method copy
pnpm run check
pnpm run test -- --runInBand
```

Con esto se elimina el principal bloqueo y los nuevos tests del backend podrán ejecutarse correctamente.
