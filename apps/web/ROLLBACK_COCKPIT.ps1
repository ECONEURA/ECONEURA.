# ROLLBACK SCRIPT - Ejecutar si algo falla
$backup = Get-ChildItem "apps/web/src/EconeuraCockpit.backup.*.tsx" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($backup) {
    Copy-Item $backup.FullName "apps/web/src/EconeuraCockpit.tsx" -Force
    Write-Host "✅ Rollback completado desde: $($backup.Name)" -ForegroundColor Green
} else {
    Write-Host "❌ No hay backup disponible" -ForegroundColor Red
}
