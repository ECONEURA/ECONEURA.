# START RECEPTION AGENT
# Script PowerShell para arrancar Reception Agent

$pythonPath = "C:\Users\Usuario\AppData\Local\Programs\Python\Python312\python.exe"
$workingDir = "C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-PUNTO\services\neuras\reception"

Write-Host "🚀 Starting Reception Agent on port 3101..." -ForegroundColor Green

Push-Location $workingDir
& $pythonPath -m uvicorn app:app --host 0.0.0.0 --port 3101 --reload
Pop-Location
