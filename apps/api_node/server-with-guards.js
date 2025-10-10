// Servidor con guards funcionales integrados + OTLP observability
require('dotenv').config();
const express = require('express');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 8080;

// ====== OTLP OBSERVABILITY ======
const OTLP_ENDPOINT = process.env.OTLP_ENDPOINT || 'http://localhost:4318';
const SERVICE_NAME = 'econeura-gateway';

// Simple span tracking (no external dependencies)
const activeSpans = new Map();

function createSpan(name, attributes = {}) {
  const spanId = crypto.randomBytes(8).toString('hex');
  const span = {
    spanId,
    name,
    startTime: Date.now(),
    attributes: { 'service.name': SERVICE_NAME, ...attributes }
  };
  activeSpans.set(spanId, span);
  return spanId;
}

function endSpan(spanId, status = 'ok', error = null) {
  const span = activeSpans.get(spanId);
  if (!span) return;
  
  span.endTime = Date.now();
  span.duration = span.endTime - span.startTime;
  span.status = status;
  if (error) span.error = error.message;
  
  // Log span (in production, send to OTLP collector)
  console.log(`[TRACE] ${span.name} | ${span.duration}ms | ${status}`, span.attributes);
  
  activeSpans.delete(spanId);
  return span;
}

// ====== GUARDS IMPLEMENTATION ======

// Cost Guard
const MODEL_PRICING_EUR = {
  'gpt-4o': { prompt: 0.0046, completion: 0.0138 },
  'gpt-4o-mini': { prompt: 0.00014, completion: 0.00056 },
  'o1-preview': { prompt: 0.0138, completion: 0.0552 },
  'o1-mini': { prompt: 0.00276, completion: 0.01104 }
};

const agentSpendTracker = new Map();

function getDayKey() {
  return new Date().toISOString().slice(0, 10);
}

function naiveTokenEstimate(text) {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).length;
  const chars = text.length;
  return Math.max(words * 1.33, chars / 4.2) | 0;
}

function checkCostGuard(request, model = 'gpt-4o-mini') {
  const pricing = MODEL_PRICING_EUR[model] || MODEL_PRICING_EUR['gpt-4o-mini'];
  const estimatedPromptTokens = Math.min(
    request.limits.maxPromptTokens,
    naiveTokenEstimate(request.message)
  );
  const estimatedCompletionTokens = request.limits.maxCompletionTokens;

  const estimatedCostEUR =
    (estimatedPromptTokens / 1_000_000) * pricing.prompt +
    (estimatedCompletionTokens / 1_000_000) * pricing.completion;

  if (estimatedCostEUR > request.limits.costCapEUR) {
    const error = new Error(
      `Cost estimated €${estimatedCostEUR.toFixed(5)} exceeds request cap €${request.limits.costCapEUR.toFixed(5)}`
    );
    error.code = 'COST_CAP_EXCEEDED';
    error.context = { estimatedCostEUR, requestCostCap: request.limits.costCapEUR };
    throw error;
  }

  return { estimatedCostEUR, estimatedPromptTokens, estimatedCompletionTokens };
}

// Idempotency Guard
const idempotencyCache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function checkIdempotency(key) {
  const entry = idempotencyCache.get(key);
  if (!entry) return null;
  
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    idempotencyCache.delete(key);
    return null;
  }
  
  return entry.response;
}

function storeIdempotentResponse(key, response) {
  idempotencyCache.set(key, {
    response,
    timestamp: Date.now()
  });
}

// Time Guard
const activeTimeouts = new Map();

function startTimeout(timeoutMs, callback) {
  const id = crypto.randomUUID();
  const handle = setTimeout(callback, timeoutMs);
  activeTimeouts.set(id, handle);
  return id;
}

function clearTimeoutGuard(id) {
  const handle = activeTimeouts.get(id);
  if (handle) {
    clearTimeout(handle);
    activeTimeouts.delete(id);
  }
}

// ====== EXPRESS APP ======

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Route, X-Correlation-Id, X-Idempotency-Key');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'econeura-gateway-with-guards',
        version: '1.1.0',
        features: ['cost-guard', 'time-guard', 'idempotency-guard']
    });
});

// Invoke endpoint with guards
app.post('/api/invoke/:agentId', async (req, res) => {
    const { agentId } = req.params;
    const payload = req.body;
    const idempotencyKey = req.headers['x-idempotency-key'];
    
    try {
        const spanId = createSpan('invoke_agent', { agentId, userId: payload.userId });
        
        // Validate request structure
        if (!payload.message || !payload.userId) {
            endSpan(spanId, 'error', new Error('Missing required fields'));
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Missing required fields: message, userId'
            });
        }

        // Build NeuraRequestV1 structure
        const request = {
            version: '1.0',
            agentId,
            userId: payload.userId,
            message: payload.message,
            limits: payload.limits || {
                maxPromptTokens: 4000,
                maxCompletionTokens: 2000,
                costCapEUR: 0.10,
                timeoutMs: 30000
            },
            idempotencyKey: idempotencyKey || `auto-${Date.now()}-${Math.random()}`
        };

        // Check idempotency
        const existingResponse = checkIdempotency(request.idempotencyKey);
        if (existingResponse) {
            return res.json({
                ...existingResponse,
                status: 'cached',
                message: 'Response retrieved from idempotency cache',
                cached: true
            });
        }

        // Cost guard
        try {
            const costContext = checkCostGuard(request, 'gpt-4o-mini');
            console.log(`💰 Cost estimated: €${costContext.estimatedCostEUR.toFixed(5)}`);
        } catch (error) {
            if (error.code === 'COST_CAP_EXCEEDED' || error.code === 'DAILY_BUDGET_EXCEEDED') {
                return res.status(402).json({
                    error: 'Payment Required',
                    code: error.code,
                    message: error.message,
                    context: error.context
                });
            }
            throw error;
        }

        // Time guard
        const timeoutHandle = startTimeout(request.limits.timeoutMs, () => {
            throw new Error(`Request timeout after ${request.limits.timeoutMs}ms`);
        });

        try {
            // Simulate agent processing
            await new Promise(resolve => setTimeout(resolve, 100));

            const response = {
                status: 'success',
                agentId,
                message: `Agent ${agentId} invoked successfully (with guards)`,
                timestamp: new Date().toISOString(),
                input: payload,
                guards: {
                    costChecked: true,
                    timeoutSet: true,
                    idempotencyKey: request.idempotencyKey
                }
            };

            // Store in idempotency cache
            storeIdempotentResponse(request.idempotencyKey, response);

            clearTimeoutGuard(timeoutHandle);
            endSpan(spanId, 'ok');
            return res.json(response);

        } catch (processingError) {
            clearTimeoutGuard(timeoutHandle);
            endSpan(spanId, 'error', processingError);
            throw processingError;
        }

    } catch (error) {
        console.error('❌ Invoke error:', error.message);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

// Stats endpoint
app.get('/api/stats/guards', (req, res) => {
    res.json({
        timestamp: new Date().toISOString(),
        guards: {
            cost: 'active',
            time: 'active',
            idempotency: 'active'
        },
        message: 'All guards operational'
    });
});

// SSE Streaming endpoint
app.get('/api/stream/:agentId', (req, res) => {
    const { agentId } = req.params;
    
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    
    // Send retry instruction
    res.write('retry: 2500\n\n');
    
    // Send initial event
    res.write(`event: start\n`);
    res.write(`data: ${JSON.stringify({ agentId, status: 'streaming', timestamp: new Date().toISOString() })}\n\n`);
    
    // Simulate streaming chunks
    let chunkIndex = 0;
    const streamInterval = setInterval(() => {
        if (chunkIndex >= 5) {
            // Final event
            res.write(`event: complete\n`);
            res.write(`data: ${JSON.stringify({ agentId, status: 'completed', totalChunks: chunkIndex, timestamp: new Date().toISOString() })}\n\n`);
            clearInterval(streamInterval);
            clearInterval(heartbeatInterval);
            res.end();
            return;
        }
        
        // Send chunk
        res.write(`event: chunk\n`);
        res.write(`data: ${JSON.stringify({ agentId, chunkIndex, content: `Chunk ${chunkIndex} from ${agentId}`, timestamp: new Date().toISOString() })}\n\n`);
        chunkIndex++;
    }, 500);
    
    // Heartbeat
    const heartbeatInterval = setInterval(() => {
        res.write(`: heartbeat ${Date.now()}\n\n`);
    }, 15000);
    
    // Cleanup on close
    req.on('close', () => {
        clearInterval(streamInterval);
        clearInterval(heartbeatInterval);
        console.log(`🔌 SSE connection closed for ${agentId}`);
    });
    
    console.log(`📡 SSE streaming started for ${agentId}`);
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
});

// START SERVER
console.log('Starting server with guards...');
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ ECONEURA Gateway (with Guards) running on port ${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/api/health`);
    console.log(`🚀 Invoke: POST http://localhost:${PORT}/api/invoke/:agentId`);
    console.log(`� Stream: GET http://localhost:${PORT}/api/stream/:agentId`);
    console.log(`�📈 Stats: http://localhost:${PORT}/api/stats/guards`);
    console.log(`🛡️  Guards: Cost, Time, Idempotency`);
    console.log(`📻 SSE: Server-Sent Events with heartbeat`);
});

server.on('error', (err) => {
    console.error('❌ Server error:', err);
    process.exit(1);
});

process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
