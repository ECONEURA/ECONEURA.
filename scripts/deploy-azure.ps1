#!/usr/bin/env pwsh
# Automated deployment script for ECONEURA to Azure Static Web Apps

Write-Host "🚀 ECONEURA - Automated Azure Deployment" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Build the frontend
Write-Host "📦 Step 1/4: Building frontend..." -ForegroundColor Yellow
Set-Location "apps/web"
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

pnpm build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build frontend" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend build successful`n" -ForegroundColor Green

# Step 2: Install API dependencies
Write-Host "📦 Step 2/4: Installing API dependencies..." -ForegroundColor Yellow
Set-Location "../../api"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install API dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ API dependencies installed`n" -ForegroundColor Green

# Step 3: Initialize SWA deployment
Write-Host "🔧 Step 3/4: Preparing Static Web App configuration..." -ForegroundColor Yellow
Set-Location ".."

# Create SWA CLI config
$swaConfig = @{
    "\$schema" = "https://aka.ms/azure/static-web-apps-cli/schema"
    configurations = @{
        econeura = @{
            appLocation = "apps/web"
            apiLocation = "api"
            outputLocation = "dist"
            appBuildCommand = "pnpm build"
            apiBuildCommand = "npm install"
        }
    }
} | ConvertTo-Json -Depth 10

$swaConfig | Out-File -FilePath "swa-cli.config.json" -Encoding utf8
Write-Host "✅ SWA configuration created`n" -ForegroundColor Green

# Step 4: Deploy instructions
Write-Host "🎯 Step 4/4: Ready to deploy!" -ForegroundColor Yellow
Write-Host "`n📝 MANUAL STEPS REQUIRED:" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────" -ForegroundColor Gray
Write-Host "1. Press Ctrl+Shift+P in VS Code" -ForegroundColor White
Write-Host "2. Type: 'Azure Static Web Apps: Create Static Web App...'" -ForegroundColor White
Write-Host "3. Follow the wizard with these values:" -ForegroundColor White
Write-Host "   • Name: econeura-cockpit" -ForegroundColor Gray
Write-Host "   • Region: East US 2" -ForegroundColor Gray
Write-Host "   • Build Preset: Custom" -ForegroundColor Gray
Write-Host "   • App location: /apps/web" -ForegroundColor Gray
Write-Host "   • API location: /api" -ForegroundColor Gray
Write-Host "   • Output location: dist" -ForegroundColor Gray
Write-Host "`n✅ Build artifacts ready!" -ForegroundColor Green
Write-Host "📁 Frontend build: apps/web/dist/" -ForegroundColor Gray
Write-Host "📁 API functions: api/" -ForegroundColor Gray
Write-Host "`n🚀 Once deployed, your app will be at:" -ForegroundColor Cyan
Write-Host "   https://econeura-cockpit-<random>.azurestaticapps.net`n" -ForegroundColor Yellow

# Return to root
Set-Location "C:\Users\Usuario\OneDrive\Documents\GitHub\ECONEURA-PUNTO"
