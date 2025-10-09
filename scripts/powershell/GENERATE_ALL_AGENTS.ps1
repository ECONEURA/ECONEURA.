# Script para completar los 10 agentes restantes
# Copia el template de analytics y adapta para cada agente

$agents = @(
    @{name = 'cdo'; id = '2'; port = '8102'; desc = 'Chief Data Officer'; prompt = 'data governance and strategy expert' },
    @{name = 'cfo'; id = '3'; port = '8103'; desc = 'Chief Financial Officer'; prompt = 'financial analysis and planning expert' },
    @{name = 'chro'; id = '4'; port = '8104'; desc = 'Chief Human Resources Officer'; prompt = 'HR policies and people management expert' },
    @{name = 'ciso'; id = '5'; port = '8105'; desc = 'Chief Information Security Officer'; prompt = 'cybersecurity and compliance expert' },
    @{name = 'cmo'; id = '6'; port = '8106'; desc = 'Chief Marketing Officer'; prompt = 'marketing strategies and campaigns expert' },
    @{name = 'cto'; id = '7'; port = '8107'; desc = 'Chief Technology Officer'; prompt = 'technology architecture and innovation expert' },
    @{name = 'legal'; id = '8'; port = '8108'; desc = 'Legal Advisor'; prompt = 'legal compliance and contracts expert' },
    @{name = 'reception'; id = '9'; port = '8109'; desc = 'Reception Agent'; prompt = 'customer service and first contact expert' },
    @{name = 'research'; id = '10'; port = '8110'; desc = 'Research Analyst'; prompt = 'market research and competitive intelligence expert' },
    @{name = 'support'; id = '11'; port = '8111'; desc = 'Support Agent'; prompt = 'technical support and troubleshooting expert' }
)

$basePath = "services\neuras"
$analyticsTemplate = Get-Content "$basePath\analytics\app.py" -Raw
$requirementsTxt = Get-Content "$basePath\analytics\requirements.txt" -Raw

foreach ($agent in $agents) {
    Write-Host "📝 Creando agente $($agent.name) (neura-$($agent.id))..." -ForegroundColor Cyan
    
    # Reemplazar en el template
    $appPy = $analyticsTemplate -replace 'neura-analytics', "neura-$($agent.name)"
    $appPy = $appPy -replace 'Analytics Agent', "$($agent.desc)"
    $appPy = $appPy -replace 'neura-1', "neura-$($agent.id)"
    $appPy = $appPy -replace '8101', $agent.port
    $appPy = $appPy -replace 'analytics_requests_total', "$($agent.name)_requests_total"
    $appPy = $appPy -replace 'analytics_errors_total', "$($agent.name)_errors_total"
    $appPy = $appPy -replace 'analytics_task', "$($agent.name)_task"
    $appPy = $appPy -replace 'an expert data analyst', "an $($agent.prompt)"
    $appPy = $appPy -replace 'Agent specialized in data analysis, metrics, and reporting', "Agent specialized in $($agent.desc) responsibilities"
    
    # Guardar app.py
    $targetPath = "$basePath\$($agent.name)\app.py"
    $appPy | Out-File -FilePath $targetPath -Encoding UTF8 -Force
    Write-Host "✅ $targetPath creado" -ForegroundColor Green
    
    # Copiar requirements.txt
    $reqPath = "$basePath\$($agent.name)\requirements.txt"
    $requirementsTxt | Out-File -FilePath $reqPath -Encoding UTF8 -Force
    Write-Host "✅ $reqPath creado" -ForegroundColor Green
}

Write-Host "`n🎉 ¡Todos los agentes completados!" -ForegroundColor Green
Write-Host "✅ 11 agentes listos para ejecutar" -ForegroundColor Green
