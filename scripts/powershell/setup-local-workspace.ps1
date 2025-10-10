<#
.SYNOPSIS
  Clona o sincroniza este repositorio fuera de OneDrive y ejecuta `pnpm install`
  usando el modo `copy` para evitar bloqueos de hardlinks. Después ejecuta
  opcionalmente los comandos `pnpm run check` y `pnpm run typecheck`.

.DESCRIPTION
  Este script automatiza los pasos recomendados para trabajar con el monorepo
  ECONEURA en Windows cuando la carpeta original está dentro de OneDrive.

  1. Copia todo el repositorio (excluyendo `node_modules`, caches y artefactos)
     a una ruta local fuera de OneDrive (por defecto `C:\Dev\ECONEURA-PUNTO`).
  2. Ejecuta `pnpm install --no-frozen-lockfile --package-import-method copy`
     para restaurar las dependencias sin hardlinks.
  3. Ejecuta (opcional) `pnpm run check` en `apps/api_node` para validar lint/typecheck.

.PARAMETER DestinationPath
  Ruta de destino donde se copiará el repositorio. Debe estar fuera de OneDrive.
  Valor por defecto: `C:\Dev\ECONEURA-PUNTO`.

.PARAMETER SkipCopy
  Si se especifica, omite la fase de copiado (útil si la copia ya existe).

.PARAMETER SkipInstall
  Si se especifica, omite la instalación de dependencias.

.PARAMETER RunChecks
  Si se especifica, ejecuta `pnpm run check` en `apps/api_node` al finalizar la
  instalación.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/powershell/setup-local-workspace.ps1

  Copia el repo a `C:\Dev\ECONEURA-PUNTO`, instala dependencias y termina.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/powershell/setup-local-workspace.ps1 -DestinationPath D:\Repos\ECONEURA -RunChecks

  Copia el repo a `D:\Repos\ECONEURA`, instala dependencias y ejecuta los checks
  del backend Node.

.NOTES
  - El script utiliza `robocopy` para copiar de forma eficiente.
  - Requiere tener `pnpm` disponible en la PATH del sistema.
  - No borra la copia original en OneDrive.
#>

param(
  [string]$DestinationPath = "${env:SystemDrive}\Dev\ECONEURA-PUNTO",
  [switch]$SkipCopy,
  [switch]$SkipInstall,
  [switch]$RunChecks
)

function Confirm-OutsideOneDrive {
  param([string]$Path)
  $oneDrive = $env:OneDrive
  if ([string]::IsNullOrWhiteSpace($oneDrive)) { return }
  if ($Path.ToLower().StartsWith($oneDrive.ToLower())) {
    throw "La ruta '$Path' aún está dentro de OneDrive. Elige una carpeta fuera de OneDrive."
  }
}

function Initialize-Directory {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) {
    Write-Host "[setup] Creando directorio: $Path" -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $Path | Out-Null
  }
}

$ErrorActionPreference = 'Stop'
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path (Join-Path $scriptRoot '..\..')).Path

$destinationParent = Split-Path $DestinationPath -Parent
if (-not [string]::IsNullOrWhiteSpace($destinationParent)) {
  Initialize-Directory $destinationParent
}

$destinationRoot = [System.IO.Path]::GetFullPath($DestinationPath)

Confirm-OutsideOneDrive $destinationRoot
Initialize-Directory $destinationRoot

if (-not $SkipCopy) {
  Write-Host "[setup] Copiando repositorio a $destinationRoot" -ForegroundColor Cyan
  $robocopyArgs = @(
    $repoRoot,
    $destinationRoot,
    '/MIR',
    '/Z', '/R:3', '/W:5',
    '/XD', 'node_modules', '.pnpm-store', '.git', 'coverage', 'dist', 'reports', '.vscode', '.idea',
    '/XF', 'pnpm-debug.log', 'npm-debug.log'
  )

  Start-Process -FilePath 'robocopy' -ArgumentList $robocopyArgs -Wait -NoNewWindow -PassThru
  if ($LASTEXITCODE -gt 3) {
    throw "robocopy falló con código $LASTEXITCODE"
  }
  Write-Host "[setup] Copia completada" -ForegroundColor Green
} else {
  Write-Host "[setup] Fase de copiado omitida (SkipCopy)" -ForegroundColor Yellow
}

if (-not $SkipInstall) {
  Confirm-OutsideOneDrive $destinationRoot
  Write-Host "[setup] Instalando dependencias con pnpm (modo copy)..." -ForegroundColor Cyan
  Push-Location $destinationRoot
  try {
    pnpm install --no-frozen-lockfile --package-import-method copy
    pnpm install --no-frozen-lockfile --filter @econeura/api-node --package-import-method copy
    Write-Host "[setup] Dependencias instaladas correctamente" -ForegroundColor Green
  } finally {
    Pop-Location
  }
} else {
  Write-Host "[setup] Instalación omitida (SkipInstall)" -ForegroundColor Yellow
}

if ($RunChecks -and -not $SkipInstall) {
  Write-Host "[setup] Ejecutando pnpm run check en apps/api_node" -ForegroundColor Cyan
  Push-Location (Join-Path $destinationRoot 'apps\api_node')
  try {
    pnpm run check
  } finally {
    Pop-Location
  }
}

Write-Host "[setup] Entorno listo en: $destinationRoot" -ForegroundColor Green
Write-Host "[setup] Para trabajar allí, ejecuta:" -ForegroundColor Cyan
Write-Host "    cd `"$destinationRoot`"" -ForegroundColor Gray
Write-Host "    code ." -ForegroundColor Gray
