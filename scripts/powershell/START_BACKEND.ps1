#!/usr/bin/env pwsh
# Start ECONEURA Backend Gateway

$ErrorActionPreference = "Stop"

$BACKEND_DIR = "C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-PUNTO\apps\api_node"

Write-Host "🚀 Starting ECONEURA Backend Gateway..." -ForegroundColor Cyan
Write-Host "📂 Directory: $BACKEND_DIR" -ForegroundColor Gray
Write-Host "🔌 Port: 8080" -ForegroundColor Gray
Write-Host ""

Set-Location $BACKEND_DIR
node server.js
