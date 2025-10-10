const express = require('express');
const crypto = require('crypto');
const router = express.Router();

try {
    require('ts-node/register/transpile-only');
} catch (err) {
    if (process.env.NODE_ENV !== 'production') {
        console.warn('ts-node no disponible; los generadores TypeScript se omitirán (instala devDependencies para habilitarlos).');
    }
}

const { createValidator } = require('../middleware/validate');
const { invokeMakeAgent } = require('../services/makeService');
const { invokeOpenAIAgent } = require('../services/openaiService');
const agentsConfig = require('../config/agents.json');

const invokeBodySchema = {
    type: 'object',
    required: ['input'],
    additionalProperties: true,
    properties: {
        input: {
            anyOf: [
                { type: 'string', minLength: 1 },
                { type: 'object' }
            ]
        },
        context: { type: 'object', additionalProperties: true },
        userId: { type: 'string', minLength: 1, maxLength: 128 },
        metadata: { type: 'object', additionalProperties: true },
        route: { type: 'string', maxLength: 64 }
    }
};

const validateInvokeBody = createValidator(invokeBodySchema);

function normalizeIdempotency(req, correlationId) {
    const headerKey = req.headers['idempotency-key'];
    const payloadKey = req.body?.idempotencyKey;
    const key = typeof headerKey === 'string' && headerKey.length >= 8
        ? headerKey
        : typeof payloadKey === 'string' && payloadKey.length >= 8
            ? payloadKey
            : correlationId;

    req.body.idempotencyKey = key;
    return key;
}

function handleMakeError(error, res, agentId, correlationId, idempotencyKey) {
    const statusMap = {
        COST_CAP_EXCEEDED: 402,
        DAILY_BUDGET_EXCEEDED: 402,
        TOOL_TIMEOUT: 504,
        TOTAL_TIMEOUT: 504,
        CIRCUIT_OPEN: 503
    };

    const status = statusMap[error.code] || error.status || 500;
    res.status(status).json({
        error: error.code || 'MAKE_AGENT_ERROR',
        message: error.message,
        agentId,
        correlationId,
        idempotencyKey,
        retryable: status >= 500,
        diagnostics: error.diagnostics || null
    });
}

router.post('/:agentId', validateInvokeBody, async (req, res, next) => {
    const { agentId } = req.params;
    const correlationId = req.correlationId || req.headers['x-correlation-id'] || crypto.randomUUID();
    const idempotencyKey = normalizeIdempotency(req, correlationId);
    res.setHeader('X-Idempotency-Key', idempotencyKey);
    const payload = { ...req.body, correlationId };

    try {
        if (agentId.startsWith('a-')) {
            if (!agentsConfig.makeAgents?.[agentId]) {
                return res.status(404).json({
                    error: 'Automation agent not configured',
                    agentId,
                    correlationId
                });
            }

            const makeResult = await invokeMakeAgent(agentId, payload);
            const { _meta = {}, ...result } = makeResult || {};
            return res.json({
                correlationId,
                agentId,
                idempotencyKey,
                replayed: Boolean(_meta.replayed),
                breakerState: _meta.breakerState || 'closed',
                attempts: _meta.attempts || 1,
                toolDiagnostics: _meta.diagnostics || [],
                result
            });
        }

        if (agentId.startsWith('neura-')) {
            const result = await invokeOpenAIAgent(agentId, payload);
            return res.json({
                correlationId,
                agentId,
                ...result
            });
        }

        return res.status(404).json({
            error: 'Agent not found',
            agentId,
            correlationId
        });
    } catch (error) {
        if (agentId.startsWith('a-')) {
            return handleMakeError(error, res, agentId, correlationId, idempotencyKey);
        }

        error.correlationId = correlationId;
        return next(error);
    }
});

module.exports = router;
