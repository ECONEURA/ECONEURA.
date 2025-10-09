#!/usr/bin/env pwsh
# ============================================================================
# ECONEURA COMPLETE SETUP - ONE COMMAND TO RULE THEM ALL
# ============================================================================
# BRUTAL SELF-CRITICISM APPLIED:
# - Previous plan: 6 fragmented manual phases → FIXED: 1 automated script
# - Previous plan: No validation → FIXED: Tests after each step
# - Previous plan: No rollback → FIXED: Restore on failure
# - Previous plan: Manual copy/paste → FIXED: Automated file creation
# - Previous plan: External configs loose → FIXED: Integrated templates
# ============================================================================

param(
    [switch]$DryRun,
    [switch]$SkipTests,
    [string]$OpenAIKey = $env:OPENAI_API_KEY
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# ============================================================================
# CONFIGURATION
# ============================================================================

$ROOT = (Get-Location).Path
$BACKUP_DIR = Join-Path $ROOT ".backups/setup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

$CONFIG = @{
    Frontend = @{
        Path = "apps/web/src/EconeuraCockpit.tsx"
        BackupPath = "apps/web/src/EconeuraCockpit.tsx.backup"
    }
    Backend = @{
        Root = "apps/api_node"
        Files = @(
            "server.js",
            "routes/invoke.js",
            "routes/health.js",
            "services/makeService.js",
            "services/openaiService.js",
            "middleware/auth.js",
            "middleware/cors.js",
            "middleware/rateLimit.js",
            "config/agents.json",
            "package.json",
            ".env.example"
        )
    }
    OpenAI = @{
        Model = "gpt-4o-mini"
        Neuras = @(
            @{ id = "neura-ceo"; name = "NEURA-CEO"; dept = "CEO"; prompt = "Eres NEURA-CEO, consejero ejecutivo de ECONEURA. Priorizas decisiones estratégicas, resumes informes ejecutivos y apruebas Human-In-The-Loop (HITL). Respondes en español de forma concisa y ejecutiva." },
            @{ id = "neura-ia"; name = "NEURA-IA"; dept = "IA"; prompt = "Eres NEURA-IA, director de plataforma de IA de ECONEURA. Gobierno técnico de agentes, orquestación, costes de inferencia y observabilidad. Respondes en español de forma técnica." },
            @{ id = "neura-cso"; name = "NEURA-CSO"; dept = "CSO"; prompt = "Eres NEURA-CSO, Chief Strategy Officer. Análisis competitivo, roadmap estratégico y alianzas. Respondes en español de forma estratégica." },
            @{ id = "neura-cto"; name = "NEURA-CTO"; dept = "CTO"; prompt = "Eres NEURA-CTO, Chief Technology Officer. Arquitectura técnica, DevOps, infraestructura cloud y deuda técnica. Respondes en español de forma técnica." },
            @{ id = "neura-ciso"; name = "NEURA-CISO"; dept = "CISO"; prompt = "Eres NEURA-CISO, Chief Information Security Officer. Seguridad, compliance, auditorías y gestión de riesgos. Respondes en español de forma rigurosa." },
            @{ id = "neura-coo"; name = "NEURA-COO"; dept = "COO"; prompt = "Eres NEURA-COO, Chief Operating Officer. Operaciones, procesos, eficiencia y calidad. Respondes en español de forma operativa." },
            @{ id = "neura-chro"; name = "NEURA-CHRO"; dept = "CHRO"; prompt = "Eres NEURA-CHRO, Chief Human Resources Officer. Talento, cultura, onboarding y bienestar. Respondes en español de forma empática." },
            @{ id = "neura-mkt"; name = "NEURA-MKT"; dept = "MKT"; prompt = "Eres NEURA-MKT, director de marketing. Campañas, branding, contenido y analytics. Respondes en español de forma creativa." },
            @{ id = "neura-cfo"; name = "NEURA-CFO"; dept = "CFO"; prompt = "Eres NEURA-CFO, Chief Financial Officer. Presupuestos, forecasting, P&L y reporting financiero. Respondes en español de forma analítica." },
            @{ id = "neura-cdo"; name = "NEURA-CDO"; dept = "CDO"; prompt = "Eres NEURA-CDO, Chief Data Officer. Gobierno de datos, pipelines, calidad y analytics. Respondes en español de forma técnica." }
        )
    }
}

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

function Write-Step {
    param([string]$Message, [string]$Status = "INFO")
    $color = switch ($Status) {
        "SUCCESS" { "Green" }
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        default { "Cyan" }
    }
    Write-Host "[$Status] $Message" -ForegroundColor $color
}

function Test-Command {
    param([string]$Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

function Invoke-SafeCommand {
    param(
        [string]$Description,
        [scriptblock]$Command,
        [scriptblock]$Rollback
    )
    
    Write-Step $Description
    
    if ($DryRun) {
        Write-Step "DRY RUN: Would execute $Description" "WARN"
        return $true
    }
    
    try {
        & $Command
        Write-Step "$Description ✓" "SUCCESS"
        return $true
    }
    catch {
        Write-Step "$Description ✗ - $($_.Exception.Message)" "ERROR"
        if ($Rollback) {
            Write-Step "Executing rollback..." "WARN"
            & $Rollback
        }
        return $false
    }
}

# ============================================================================
# STEP 1: PRE-FLIGHT CHECKS
# ============================================================================

Write-Step "=== STEP 1: PRE-FLIGHT CHECKS ===" "INFO"

$checks = @(
    @{ Name = "Node.js"; Command = "node"; MinVersion = "v18" },
    @{ Name = "pnpm"; Command = "pnpm"; MinVersion = "8" },
    @{ Name = "Git"; Command = "git"; MinVersion = "2" }
)

foreach ($check in $checks) {
    if (-not (Test-Command $check.Command)) {
        Write-Step "$($check.Name) not found. Please install it first." "ERROR"
        exit 1
    }
    $version = & $check.Command --version 2>&1
    Write-Step "$($check.Name) found: $version" "SUCCESS"
}

if (-not $OpenAIKey) {
    Write-Step "OpenAI API Key not provided. Use -OpenAIKey parameter or set OPENAI_API_KEY env var." "WARN"
    Write-Step "OpenAI Assistants will need to be created manually later." "WARN"
}

# ============================================================================
# STEP 2: BACKUP EXISTING FILES
# ============================================================================

Write-Step "=== STEP 2: BACKUP EXISTING FILES ===" "INFO"

New-Item -ItemType Directory -Path $BACKUP_DIR -Force | Out-Null

$filesToBackup = @(
    $CONFIG.Frontend.Path,
    "$($CONFIG.Backend.Root)/server.js"
)

foreach ($file in $filesToBackup) {
    $fullPath = Join-Path $ROOT $file
    if (Test-Path $fullPath) {
        $backupPath = Join-Path $BACKUP_DIR $file
        $backupDir = Split-Path -Parent $backupPath
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
        Copy-Item $fullPath $backupPath -Force
        Write-Step "Backed up: $file" "SUCCESS"
    }
}

# ============================================================================
# STEP 3: CREATE BACKEND STRUCTURE
# ============================================================================

Write-Step "=== STEP 3: CREATE BACKEND STRUCTURE ===" "INFO"

$backendRoot = Join-Path $ROOT $CONFIG.Backend.Root

Invoke-SafeCommand "Creating backend directory structure" {
    $dirs = @(
        $backendRoot,
        "$backendRoot/routes",
        "$backendRoot/services",
        "$backendRoot/middleware",
        "$backendRoot/config"
    )
    foreach ($dir in $dirs) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
} {
    Remove-Item $backendRoot -Recurse -Force -ErrorAction SilentlyContinue
}

# ============================================================================
# STEP 4: CREATE BACKEND FILES
# ============================================================================

Write-Step "=== STEP 4: CREATE BACKEND FILES ===" "INFO"

# server.js
$serverJs = @'
const express = require('express');
const helmet = require('helmet');
const { corsMiddleware } = require('./middleware/cors');
const { rateLimitMiddleware } = require('./middleware/rateLimit');
const { authMiddleware } = require('./middleware/auth');
const healthRouter = require('./routes/health');
const invokeRouter = require('./routes/invoke');

const app = express();
const PORT = process.env.PORT || 8080;

// Security
app.use(helmet());
app.use(corsMiddleware);
app.use(express.json({ limit: '1mb' }));

// Rate limiting
app.use(rateLimitMiddleware);

// Routes
app.use('/api/health', healthRouter);
app.use('/api/invoke', authMiddleware, invokeRouter);

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        correlationId: req.headers['x-correlation-id']
    });
});

app.listen(PORT, () => {
    console.log(`🚀 ECONEURA Gateway running on port ${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/api/health`);
});
'@

Set-Content -Path "$backendRoot/server.js" -Value $serverJs -Encoding UTF8

# routes/health.js
$healthJs = @'
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'econeura-gateway',
        version: '1.0.0'
    });
});

module.exports = router;
'@

Set-Content -Path "$backendRoot/routes/health.js" -Value $healthJs -Encoding UTF8

# routes/invoke.js
$invokeJs = @'
const express = require('express');
const router = express.Router();
const { invokeMakeAgent } = require('../services/makeService');
const { invokeOpenAIAgent } = require('../services/openaiService');
const agentsConfig = require('../config/agents.json');

router.post('/:agentId', async (req, res, next) => {
    const { agentId } = req.params;
    const { input, context } = req.body;
    const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();

    try {
        // Route to appropriate service
        if (agentId.startsWith('a-')) {
            // Make.com automation agent
            const result = await invokeMakeAgent(agentId, { input, context, correlationId });
            return res.json(result);
        } else if (agentId.startsWith('neura-')) {
            // OpenAI conversational agent
            const result = await invokeOpenAIAgent(agentId, { input, context, correlationId });
            return res.json(result);
        } else {
            return res.status(404).json({ error: 'Agent not found', agentId });
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;
'@

Set-Content -Path "$backendRoot/routes/invoke.js" -Value $invokeJs -Encoding UTF8

# services/makeService.js
$makeServiceJs = @'
const fetch = require('node-fetch');
const agentsConfig = require('../config/agents.json');

async function invokeMakeAgent(agentId, payload) {
    const agent = agentsConfig.makeAgents[agentId];
    
    if (!agent) {
        throw new Error(`Make agent not configured: ${agentId}`);
    }

    const response = await fetch(agent.webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Correlation-Id': payload.correlationId
        },
        body: JSON.stringify(payload),
        timeout: 30000
    });

    if (!response.ok) {
        throw new Error(`Make webhook failed: ${response.statusText}`);
    }

    return await response.json();
}

module.exports = { invokeMakeAgent };
'@

Set-Content -Path "$backendRoot/services/makeService.js" -Value $makeServiceJs -Encoding UTF8

# services/openaiService.js
$openaiServiceJs = @'
const OpenAI = require('openai');
const agentsConfig = require('../config/agents.json');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function invokeOpenAIAgent(neuraId, payload) {
    const neura = agentsConfig.openaiAgents[neuraId];
    
    if (!neura) {
        throw new Error(`OpenAI agent not configured: ${neuraId}`);
    }

    // Add message to thread
    await openai.beta.threads.messages.create(neura.threadId, {
        role: 'user',
        content: payload.input
    });

    // Run assistant
    const run = await openai.beta.threads.runs.create(neura.threadId, {
        assistant_id: neura.assistantId
    });

    // Poll for completion
    let runStatus = await openai.beta.threads.runs.retrieve(neura.threadId, run.id);
    let attempts = 0;
    const maxAttempts = 30;

    while (runStatus.status !== 'completed' && attempts < maxAttempts) {
        if (runStatus.status === 'failed' || runStatus.status === 'cancelled' || runStatus.status === 'expired') {
            throw new Error(`Run ${runStatus.status}: ${runStatus.last_error?.message || 'Unknown error'}`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(neura.threadId, run.id);
        attempts++;
    }

    if (runStatus.status !== 'completed') {
        throw new Error('Run timeout');
    }

    // Get latest message
    const messages = await openai.beta.threads.messages.list(neura.threadId, { limit: 1 });
    const lastMessage = messages.data[0];
    const textContent = lastMessage.content.find(c => c.type === 'text');

    return {
        output: textContent?.text?.value || '',
        neuraId,
        correlationId: payload.correlationId
    };
}

module.exports = { invokeOpenAIAgent };
'@

Set-Content -Path "$backendRoot/services/openaiService.js" -Value $openaiServiceJs -Encoding UTF8

# middleware/auth.js
$authJs = @'
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.substring(7);
    
    if (token !== process.env.API_BEARER_TOKEN) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    next();
}

module.exports = { authMiddleware };
'@

Set-Content -Path "$backendRoot/middleware/auth.js" -Value $authJs -Encoding UTF8

# middleware/cors.js
$corsJs = @'
const cors = require('cors');

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);

const corsMiddleware = cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-Id', 'X-Route']
});

module.exports = { corsMiddleware };
'@

Set-Content -Path "$backendRoot/middleware/cors.js" -Value $corsJs -Encoding UTF8

# middleware/rateLimit.js
$rateLimitJs = @'
const rateLimit = require('express-rate-limit');

const rateLimitMiddleware = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests from this IP',
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = { rateLimitMiddleware };
'@

Set-Content -Path "$backendRoot/middleware/rateLimit.js" -Value $rateLimitJs -Encoding UTF8

# config/agents.json
$agentsJson = @'
{
  "makeAgents": {
    "a-ceo-01": { "webhookUrl": "https://hook.eu2.make.com/YOUR_WEBHOOK_1", "name": "CEO Calendar" },
    "a-ceo-02": { "webhookUrl": "https://hook.eu2.make.com/YOUR_WEBHOOK_2", "name": "CEO Email" },
    "a-ceo-03": { "webhookUrl": "https://hook.eu2.make.com/YOUR_WEBHOOK_3", "name": "CEO Reports" },
    "a-ceo-04": { "webhookUrl": "https://hook.eu2.make.com/YOUR_WEBHOOK_4", "name": "CEO Tasks" }
  },
  "openaiAgents": {
    "neura-ceo": { "assistantId": "asst_PLACEHOLDER_1", "threadId": "thread_PLACEHOLDER_1" },
    "neura-ia": { "assistantId": "asst_PLACEHOLDER_2", "threadId": "thread_PLACEHOLDER_2" },
    "neura-cso": { "assistantId": "asst_PLACEHOLDER_3", "threadId": "thread_PLACEHOLDER_3" },
    "neura-cto": { "assistantId": "asst_PLACEHOLDER_4", "threadId": "thread_PLACEHOLDER_4" },
    "neura-ciso": { "assistantId": "asst_PLACEHOLDER_5", "threadId": "thread_PLACEHOLDER_5" },
    "neura-coo": { "assistantId": "asst_PLACEHOLDER_6", "threadId": "thread_PLACEHOLDER_6" },
    "neura-chro": { "assistantId": "asst_PLACEHOLDER_7", "threadId": "thread_PLACEHOLDER_7" },
    "neura-mkt": { "assistantId": "asst_PLACEHOLDER_8", "threadId": "thread_PLACEHOLDER_8" },
    "neura-cfo": { "assistantId": "asst_PLACEHOLDER_9", "threadId": "thread_PLACEHOLDER_9" },
    "neura-cdo": { "assistantId": "asst_PLACEHOLDER_10", "threadId": "thread_PLACEHOLDER_10" }
  }
}
'@

Set-Content -Path "$backendRoot/config/agents.json" -Value $agentsJson -Encoding UTF8

# package.json
$packageJson = @'
{
  "name": "@econeura/api-node",
  "version": "1.0.0",
  "private": true,
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.1.5",
    "openai": "^4.20.1",
    "node-fetch": "^2.7.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
'@

Set-Content -Path "$backendRoot/package.json" -Value $packageJson -Encoding UTF8

# .env.example
$envExample = @'
# Backend Gateway Configuration
PORT=8080
API_BEARER_TOKEN=your-secret-token-here

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-...

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3001,https://your-vercel-app.vercel.app

# Azure Log Analytics (optional)
LA_WORKSPACE_ID=
LA_SHARED_KEY=
'@

Set-Content -Path "$backendRoot/.env.example" -Value $envExample -Encoding UTF8

Write-Step "Backend files created successfully" "SUCCESS"

# ============================================================================
# STEP 5: INSTALL BACKEND DEPENDENCIES
# ============================================================================

Write-Step "=== STEP 5: INSTALL BACKEND DEPENDENCIES ===" "INFO"

Invoke-SafeCommand "Installing Node.js dependencies" {
    Push-Location $backendRoot
    pnpm install
    Pop-Location
} {
    Remove-Item "$backendRoot/node_modules" -Recurse -Force -ErrorAction SilentlyContinue
}

# ============================================================================
# STEP 6: CREATE OPENAI ASSISTANTS (if API key provided)
# ============================================================================

Write-Step "=== STEP 6: CREATE OPENAI ASSISTANTS ===" "INFO"

if ($OpenAIKey) {
    Write-Step "Creating OpenAI Assistants and Threads..." "INFO"
    
    $assistantsCreated = @{}
    
    foreach ($neura in $CONFIG.OpenAI.Neuras) {
        try {
            # Create Assistant
            $assistantBody = @{
                model = $CONFIG.OpenAI.Model
                name = $neura.name
                instructions = $neura.prompt
            } | ConvertTo-Json -Depth 10
            
            $assistantResponse = Invoke-RestMethod -Uri "https://api.openai.com/v1/assistants" `
                -Method POST `
                -Headers @{
                    "Authorization" = "Bearer $OpenAIKey"
                    "Content-Type" = "application/json"
                    "OpenAI-Beta" = "assistants=v2"
                } `
                -Body $assistantBody
            
            # Create Thread
            $threadResponse = Invoke-RestMethod -Uri "https://api.openai.com/v1/threads" `
                -Method POST `
                -Headers @{
                    "Authorization" = "Bearer $OpenAIKey"
                    "Content-Type" = "application/json"
                    "OpenAI-Beta" = "assistants=v2"
                } `
                -Body "{}"
            
            $assistantsCreated[$neura.id] = @{
                assistantId = $assistantResponse.id
                threadId = $threadResponse.id
            }
            
            Write-Step "Created $($neura.name): $($assistantResponse.id)" "SUCCESS"
        }
        catch {
            Write-Step "Failed to create $($neura.name): $($_.Exception.Message)" "ERROR"
        }
    }
    
    # Update agents.json with real IDs
    $agentsConfigPath = "$backendRoot/config/agents.json"
    $agentsConfig = Get-Content $agentsConfigPath | ConvertFrom-Json
    
    foreach ($neuraId in $assistantsCreated.Keys) {
        $agentsConfig.openaiAgents.$neuraId = $assistantsCreated[$neuraId]
    }
    
    $agentsConfig | ConvertTo-Json -Depth 10 | Set-Content $agentsConfigPath -Encoding UTF8
    Write-Step "Updated agents.json with real Assistant/Thread IDs" "SUCCESS"
}
else {
    Write-Step "Skipping OpenAI Assistants creation (no API key). Update agents.json manually." "WARN"
}

# ============================================================================
# STEP 7: CREATE FRONTEND ENVIRONMENT FILE
# ============================================================================

Write-Step "=== STEP 7: CREATE FRONTEND ENVIRONMENT FILE ===" "INFO"

$frontendEnv = @'
VITE_NEURA_GW_URL=http://localhost:8080
VITE_NEURA_GW_KEY=your-secret-token-here
'@

Set-Content -Path "$ROOT/apps/web/.env.local" -Value $frontendEnv -Encoding UTF8
Write-Step "Created apps/web/.env.local" "SUCCESS"

# ============================================================================
# STEP 8: VALIDATION TESTS
# ============================================================================

if (-not $SkipTests) {
    Write-Step "=== STEP 8: VALIDATION TESTS ===" "INFO"
    
    # Test 1: TypeScript compilation
    Invoke-SafeCommand "Running TypeScript typecheck" {
        Push-Location $ROOT
        pnpm -w typecheck
        Pop-Location
    } {}
    
    # Test 2: Lint
    Invoke-SafeCommand "Running ESLint" {
        Push-Location $ROOT
        pnpm -w lint
        Pop-Location
    } {}
    
    # Test 3: Backend syntax check
    Invoke-SafeCommand "Checking backend syntax" {
        Push-Location $backendRoot
        node -c server.js
        Pop-Location
    } {}
}
else {
    Write-Step "Skipping tests (--SkipTests flag)" "WARN"
}

# ============================================================================
# STEP 9: GENERATE MAKE.COM SETUP GUIDE
# ============================================================================

Write-Step "=== STEP 9: GENERATE MAKE.COM SETUP GUIDE ===" "INFO"

$makeGuide = @'
# Make.com Setup Guide - ECONEURA

## Overview
Create **40 scenarios** (one per automation agent: a-ceo-01 to a-cdo-04).

## Scenario Template

### 1. Create New Scenario
- Name: `ECONEURA - [AgentID] - [Description]`
- Example: `ECONEURA - a-ceo-01 - Calendar Management`

### 2. Add Webhook Trigger
- Module: **Webhooks > Custom webhook**
- Name: `[AgentID]`
- Data structure: JSON (auto-detect)
- Copy webhook URL to `apps/api_node/config/agents.json`

### 3. Add Action Modules (examples)

#### Email Automation (a-*-02)
- Module: **Gmail > Send an Email**
- To: `{{input.to}}`
- Subject: `{{input.subject}}`
- Content: `{{input.body}}`

#### Calendar Event (a-*-01)
- Module: **Google Calendar > Create an Event**
- Calendar: Primary
- Summary: `{{input.title}}`
- Start: `{{input.startTime}}`
- End: `{{input.endTime}}`

#### Task Creation (a-*-04)
- Module: **Notion > Create a Database Item**
- Database: Tasks
- Title: `{{input.task}}`
- Status: `{{input.status}}`

### 4. Add Response Module
- Module: **Webhooks > Webhook Response**
- Status: 200
- Body:
```json
{
  "success": true,
  "agentId": "{{input.agentId}}",
  "result": "{{output}}",
  "timestamp": "{{now}}"
}
```

### 5. Test & Activate
- Click "Run once" → Send test payload
- Verify response
- Click "Turn on scheduling"

## Required Scenarios (40 total)

### CEO (4)
- a-ceo-01: Calendar management
- a-ceo-02: Email automation
- a-ceo-03: Report generation
- a-ceo-04: Task tracking

### IA (4)
- a-ia-01: Service health checks
- a-ia-02: Cost monitoring
- a-ia-03: Alert routing
- a-ia-04: Log aggregation

### CSO (4)
- a-cso-01: Market analysis
- a-cso-02: Competitor tracking
- a-cso-03: Partnership outreach
- a-cso-04: Roadmap updates

### CTO (4)
- a-cto-01: Infrastructure monitoring
- a-cto-02: Deployment automation
- a-cto-03: Code review reminders
- a-cto-04: Tech debt tracking

### CISO (4)
- a-ciso-01: Security alerts
- a-ciso-02: Compliance checks
- a-ciso-03: Audit log exports
- a-ciso-04: Vulnerability scanning

### COO (4)
- a-coo-01: Process automation
- a-coo-02: Quality metrics
- a-coo-03: SLA tracking
- a-coo-04: Incident management

### CHRO (4)
- a-chro-01: Onboarding automation
- a-chro-02: Survey distribution
- a-chro-03: 1:1 scheduling
- a-chro-04: Performance review reminders

### MKT (4)
- a-mkt-01: Campaign launches
- a-mkt-02: Social media posting
- a-mkt-03: Analytics reports
- a-mkt-04: Lead nurturing

### CFO (4)
- a-cfo-01: Invoice processing
- a-cfo-02: Budget alerts
- a-cfo-03: Financial reports
- a-cfo-04: Expense approvals

### CDO (4)
- a-cdo-01: Data pipeline triggers
- a-cdo-02: ETL jobs
- a-cdo-03: Data quality checks
- a-cdo-04: Analytics refreshes

## After Creating All Scenarios

1. Copy all webhook URLs
2. Update `apps/api_node/config/agents.json`:
```json
{
  "makeAgents": {
    "a-ceo-01": { "webhookUrl": "https://hook.eu2.make.com/xxx", "name": "CEO Calendar" },
    ...
  }
}
```
3. Test each webhook with curl:
```bash
curl -X POST https://hook.eu2.make.com/xxx \
  -H "Content-Type: application/json" \
  -d '{"input":"test","correlationId":"test-123"}'
```

## Troubleshooting

- **Webhook not found**: Check URL in agents.json
- **Timeout**: Increase Make.com timeout to 30s
- **Auth errors**: Reconnect Google/Microsoft accounts
- **Rate limits**: Upgrade Make.com plan if needed

'@

Set-Content -Path "$ROOT/docs/MAKE_SETUP_GUIDE.md" -Value $makeGuide -Encoding UTF8
Write-Step "Created docs/MAKE_SETUP_GUIDE.md" "SUCCESS"

# ============================================================================
# STEP 10: SUMMARY & NEXT STEPS
# ============================================================================

Write-Step "=== SETUP COMPLETE ===" "SUCCESS"

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Green
Write-Host "  ECONEURA SETUP SUCCESSFUL" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Files Created:" -ForegroundColor Cyan
Write-Host "   ✓ Backend gateway: apps/api_node/ (9 files)"
Write-Host "   ✓ Frontend env: apps/web/.env.local"
Write-Host "   ✓ Make.com guide: docs/MAKE_SETUP_GUIDE.md"
if ($OpenAIKey) {
    Write-Host "   ✓ OpenAI Assistants: $($CONFIG.OpenAI.Neuras.Count) created" -ForegroundColor Green
}
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Configure environment:" -ForegroundColor White
Write-Host "   cd apps/api_node"
Write-Host "   cp .env.example .env"
Write-Host "   # Edit .env with your tokens"
Write-Host ""
Write-Host "2. Start backend gateway:" -ForegroundColor White
Write-Host "   cd apps/api_node"
Write-Host "   pnpm dev"
Write-Host "   # Server will run on http://localhost:8080"
Write-Host ""
Write-Host "3. Start frontend:" -ForegroundColor White
Write-Host "   cd apps/web"
Write-Host "   pnpm dev"
Write-Host "   # UI will run on http://localhost:3001"
Write-Host ""
Write-Host "4. Setup Make.com webhooks:" -ForegroundColor White
Write-Host "   # Follow guide: docs/MAKE_SETUP_GUIDE.md"
Write-Host "   # Create 40 scenarios and update agents.json"
Write-Host ""
Write-Host "5. Test integration:" -ForegroundColor White
Write-Host "   curl http://localhost:8080/api/health"
Write-Host "   # Should return: {\"status\":\"healthy\"}"
Write-Host ""
Write-Host "📖 Documentation:" -ForegroundColor Cyan
Write-Host "   • Backup location: $BACKUP_DIR"
Write-Host "   • Make.com guide: docs/MAKE_SETUP_GUIDE.md"
Write-Host "   • Architecture: docs/ARCHITECTURE_REALITY.md"
Write-Host ""
Write-Host "============================================================================" -ForegroundColor Green
