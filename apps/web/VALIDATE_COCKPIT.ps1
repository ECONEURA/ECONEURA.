# VALIDATION SCRIPT - Ejecutar después de escribir código
Write-Host "=== VALIDACIÓN POST-ESCRITURA ===" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar tamaño
$file = Get-Item "apps/web/src/EconeuraCockpit.tsx"
if ($file.Length -lt 10000) {
    Write-Host "❌ Archivo muy pequeño ($($file.Length) bytes) - posible fallo" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Tamaño: $($file.Length) bytes" -ForegroundColor Green

# 2. Verificar líneas
$lines = (Get-Content "apps/web/src/EconeuraCockpit.tsx" | Measure-Object -Line).Lines
if ($lines -lt 500) {
    Write-Host "❌ Muy pocas líneas ($lines) - esperadas ~620" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Líneas: $lines" -ForegroundColor Green

# 3. Verificar imports clave
$content = Get-Content "apps/web/src/EconeuraCockpit.tsx" -Raw
if (-not ($content -match "import.*Crown.*from.*lucide-react")) {
    Write-Host "❌ Import de lucide-react no encontrado" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Imports Lucide presentes" -ForegroundColor Green

# 4. Verificar export
if (-not ($content -match "export default function EconeuraUI")) {
    Write-Host "❌ Export default no encontrado" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Export default correcto" -ForegroundColor Green

Write-Host ""
Write-Host "✅ TODAS LAS VALIDACIONES PASARON" -ForegroundColor Green
