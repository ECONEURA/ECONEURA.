require('dotenv').config();
const express = require('express');
const openaiService = require('./services/openaiService');
const makeService = require('./services/makeService');
const orchestrator = require('./services/orchestrator');
const { usageTracker, getAgentCapabilities, MODEL_DETAILS } = require('./services/modelSelector');

const app = express();
const PORT = process.env.PORT || 8080;

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Route, X-Correlation-Id');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Middleware básico
app.use(express.json());

// Health check simple
app.get('/api/health', (req, res) => {
    console.log('Health check called');
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'econeura-gateway',
        version: '1.0.0'
    });
});

// 📊 ESTADÍSTICAS DE USO DE MODELOS
app.get('/api/stats/models', (req, res) => {
    console.log('Model usage stats requested');

    const stats = usageTracker.getStats();
    const config = {
        allowO1: process.env.ALLOW_O1_PREVIEW !== 'false',
        preferSpeed: process.env.PREFER_SPEED === 'true',
        complexityThreshold: parseFloat(process.env.COMPLEXITY_THRESHOLD || '0.6')
    };

    res.json({
        stats,
        config,
        timestamp: new Date().toISOString()
    });
});

// 🧭 CAPACIDADES AVANZADAS POR AGENTE
app.get('/api/agents/capabilities', (req, res) => {
    console.log('Agent capabilities requested');

    const agents = getAgentCapabilities();
    const models = Object.entries(MODEL_DETAILS).map(([id, meta]) => ({
        id,
        ...meta
    }));

    res.json({
        updatedAt: new Date().toISOString(),
        summary: {
            totalAgents: agents.length,
            reasoningAgents: agents.filter(agent => agent.reasoningModel).length,
            liteReasoningAgents: agents.filter(agent => agent.reasoningLiteModel).length,
            economyAgents: agents.filter(agent => agent.economyModel).length
        },
        models,
        agents
    });
});

// Invoke agent endpoint
app.post('/api/invoke/:agentId', async (req, res) => {
    const { agentId } = req.params;
    const payload = req.body;

    console.log(`📨 Invoke ${agentId}:`, payload);

    try {
        let result;

        // Route to appropriate service
        if (agentId.startsWith('neura-')) {
            // OpenAI Assistant
            result = await openaiService.invokeOpenAIAgent(agentId, payload);
        } else if (agentId.startsWith('a-')) {
            // Make.com webhook
            result = await makeService.invokeMakeAgent(agentId, payload);
        } else {
            return res.status(404).json({ error: `Unknown agent: ${agentId}` });
        }

        res.json(result);
    } catch (error) {
        console.error(`❌ Error invoking ${agentId}:`, error.message);
        res.status(500).json({ error: error.message });
    }
});

// 🌊 STREAMING endpoint (respuestas token por token como ChatGPT)
app.post('/api/stream/:agentId', async (req, res) => {
    const { agentId } = req.params;
    const payload = req.body;

    console.log(`🌊 Streaming ${agentId}:`, payload);

    if (!agentId.startsWith('neura-')) {
        return res.status(400).json({ error: 'Streaming only available for neura agents' });
    }

    try {
        // Set headers for SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');

        // Stream from OpenAI
        await openaiService.streamOpenAIAgent(agentId, payload, res);

    } catch (error) {
        console.error(`❌ Streaming error:`, error.message);
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
    }
});

// 🎯 TASK ORCHESTRATOR endpoint (tareas complejas con function calling)
app.post('/api/task/:agentId', async (req, res) => {
    const { agentId } = req.params;
    const { input, userId, correlationId } = req.body;

    console.log(`🎯 Task orchestration ${agentId}:`, input);

    if (!input) {
        return res.status(400).json({ error: 'Missing required field: input' });
    }

    try {
        const result = await orchestrator.ejecutarTareaCompleja(
            input,
            userId || 'user-default',
            agentId
        );

        res.json(result);
    } catch (error) {
        console.error(`❌ Task orchestration error:`, error.message);
        res.status(500).json({ error: error.message });
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ECONEURA Gateway running on port ${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/api/health`);
});
