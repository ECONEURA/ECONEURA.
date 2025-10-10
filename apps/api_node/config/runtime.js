function toNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function buildConfig() {
    return {
        env: process.env.NODE_ENV || 'development',
        port: toNumber(process.env.PORT, 8080),
        metrics: {
            enabled: process.env.METRICS_ENABLED !== 'false',
        },
        make: {
            apiKey: process.env.MAKE_API_KEY || process.env.MAKE_TOKEN || '',
            webhookBaseUrl: process.env.MAKE_WEBHOOK_BASE_URL || 'https://hook.us1.make.com',
            timeoutMs: toNumber(process.env.MAKE_TIMEOUT_MS || process.env.MAKE_TIMEOUT, 25000),
            circuitBreakerThreshold: toNumber(process.env.MAKE_CIRCUIT_THRESHOLD, 5),
            circuitBreakerCooldownMs: toNumber(process.env.MAKE_CIRCUIT_COOLDOWN_MS, 60000),
            maxAttempts: toNumber(process.env.MAKE_MAX_ATTEMPTS, 3),
            backoffMs: toNumber(process.env.MAKE_BACKOFF_MS, 1000),
        },
        openai: {
            apiKey: process.env.OPENAI_API_KEY || '',
            preferSpeed: process.env.PREFER_SPEED === 'true',
            allowO1: process.env.ALLOW_O1_PREVIEW !== 'false',
            complexityThreshold: toNumber(process.env.COMPLEXITY_THRESHOLD, 0.6),
        },
        orchestrator: {
            braveApiKey: process.env.BRAVE_API_KEY || '',
        }
    };
}

let cachedConfig = buildConfig();

function getRuntimeConfig() {
    return cachedConfig;
}

function reloadRuntimeConfig() {
    cachedConfig = buildConfig();
    return cachedConfig;
}

module.exports = {
    getRuntimeConfig,
    reloadRuntimeConfig,
};
