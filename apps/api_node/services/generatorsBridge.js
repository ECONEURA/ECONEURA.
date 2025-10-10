// Enable runtime transpilation of the local TypeScript helpers
require('ts-node/register/transpile-only');

const { getRuntimeConfig } = require('../config/runtime');
const {
    MakeActionGenerator,
    SemanticSearchGenerator,
    FinanceGenerator
} = require('../src/services');

const makeGeneratorCache = new Map();
let cachedSearchGenerator;
let cachedFinanceGenerator;

function getConfig() {
    return getRuntimeConfig();
}

function resolveMakeGenerator(webhookUrl) {
    const config = getConfig();
    let baseUrl = config.make.webhookBaseUrl;
    let webhookId = '';

    if (webhookUrl) {
        try {
            const parsed = new URL(webhookUrl);
            baseUrl = `${parsed.protocol}//${parsed.host}`;
            webhookId = parsed.pathname.replace(/^\/+/, '');
        } catch (error) {
            // Fall back to config base URL if parsing fails
            webhookId = webhookUrl.replace(/^\/+/, '');
        }
    }

    let generator = makeGeneratorCache.get(baseUrl);
    if (!generator) {
        const options = {
            baseUrl,
            apiKey: config.make.apiKey,
            timeoutMs: config.make.timeoutMs,
            circuitBreakerThreshold: config.make.circuitBreakerThreshold,
            circuitBreakerCooldownMs: config.make.circuitBreakerCooldownMs,
            hmacSecret: process.env.MAKE_HMAC_SECRET
        };

        if (Number.isFinite(config.make.maxAttempts)) {
            options.maxAttempts = config.make.maxAttempts;
        }
        if (Number.isFinite(config.make.backoffMs)) {
            options.backoffMs = config.make.backoffMs;
        }

        generator = new MakeActionGenerator(options);
        makeGeneratorCache.set(baseUrl, generator);
    }

    return { generator, webhookId };
}

function getSearchGenerator() {
    if (!cachedSearchGenerator) {
        const config = getConfig();
        cachedSearchGenerator = new SemanticSearchGenerator({
            baseUrl: process.env.SEARCH_API_BASE_URL || 'http://localhost:7700',
            apiKey: process.env.SEARCH_API_KEY,
            timeoutMs: Number(process.env.SEARCH_TIMEOUT_MS || 7500),
            circuitBreakerThreshold: Number(process.env.SEARCH_CIRCUIT_THRESHOLD || 4),
            circuitBreakerCooldownMs: Number(process.env.SEARCH_CIRCUIT_COOLDOWN_MS || 45000)
        });
    }
    return cachedSearchGenerator;
}

function getFinanceGenerator() {
    if (!cachedFinanceGenerator) {
        const config = {
            baseUrl: process.env.FINANCE_API_BASE_URL || 'https://api.polygon.io',
            apiKey: process.env.FINANCE_API_KEY,
            timeoutMs: Number(process.env.FINANCE_TIMEOUT_MS || 8000),
            cacheTtlMs: Number(process.env.FINANCE_CACHE_TTL_MS || 60000),
            circuitBreakerThreshold: Number(process.env.FINANCE_CIRCUIT_THRESHOLD || 4),
            circuitBreakerCooldownMs: Number(process.env.FINANCE_CIRCUIT_COOLDOWN_MS || 30000)
        };
        cachedFinanceGenerator = new FinanceGenerator(config);
    }
    return cachedFinanceGenerator;
}

module.exports = {
    resolveMakeGenerator,
    getSearchGenerator,
    getFinanceGenerator
};
