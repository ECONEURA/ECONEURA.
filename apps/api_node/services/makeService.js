const crypto = require('crypto');
const axios = require('axios');

const agentsConfig = require('../config/agents.json');
const { getRuntimeConfig } = require('../config/runtime');

const idempotencyCache = new Map();

function buildWebhookUrl(agent, runtime) {
    if (agent.webhookUrl && agent.webhookUrl.startsWith('http')) {
        return agent.webhookUrl;
    }

    const base = (agent.webhookUrl || agent.webhookId || '').replace(/^\/+/, '');
    const root = (runtime.make.webhookBaseUrl || '').replace(/\/+$/, '');
    return `${root}/${base}`;
}

function cacheResponse(key, payload) {
    idempotencyCache.set(key, {
        data: payload,
        storedAt: Date.now()
    });
}

function getCachedResponse(key, maxAgeMs = 5 * 60 * 1000) {
    const entry = idempotencyCache.get(key);
    if (!entry) {
        return null;
    }
    if (Date.now() - entry.storedAt > maxAgeMs) {
        idempotencyCache.delete(key);
        return null;
    }
    return entry.data;
}

async function invokeMakeAgent(agentId, payload = {}) {
    const agent = agentsConfig.makeAgents?.[agentId];
    if (!agent) {
        throw new Error(`Make agent not configured: ${agentId}`);
    }

    const runtime = getRuntimeConfig();
    const correlationId = payload.correlationId || crypto.randomUUID();
    const idempotencyKey = payload.idempotencyKey || `${agentId}:${correlationId}`;

    const cached = getCachedResponse(idempotencyKey);
    if (cached) {
        return {
            ...cached,
            _meta: {
                ...(cached._meta || {}),
                replayed: true,
                idempotencyKey
            }
        };
    }

    const url = buildWebhookUrl(agent, runtime);
    if (!url) {
        throw new Error(`Invalid Make webhook configuration for agent ${agentId}`);
    }

    const requestBody = {
        ...payload,
        agentId,
        correlationId,
        idempotencyKey,
        requestedAt: new Date().toISOString()
    };

    const headers = {
        'Content-Type': 'application/json'
    };
    if (runtime.make.apiKey) {
        headers.Authorization = `Bearer ${runtime.make.apiKey}`;
    }

    const timeout = Number(runtime.make.timeoutMs) || 25000;

    const response = await axios.post(url, requestBody, { headers, timeout });
    const envelope = {
        ...response.data,
        _meta: {
            ...(response.data?._meta || {}),
            correlationId,
            idempotencyKey,
            breakerState: 'closed',
            attempts: 1,
            replayed: false
        }
    };

    cacheResponse(idempotencyKey, envelope);
    return envelope;
}

module.exports = {
    invokeMakeAgent
};
