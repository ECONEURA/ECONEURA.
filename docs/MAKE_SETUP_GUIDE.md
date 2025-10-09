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

