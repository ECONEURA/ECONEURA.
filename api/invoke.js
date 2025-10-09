const { app } = require('@azure/functions');

// Load agent routes configuration
const agentRoutes = {
    "neura-1": { dept: "analytics", url: "https://hook.us2.make.com/xxx" },
    "neura-2": { dept: "cdo", url: "https://hook.us2.make.com/xxx" },
    "neura-3": { dept: "cfo", url: "https://hook.us2.make.com/xxx" },
    "neura-4": { dept: "chro", url: "https://hook.us2.make.com/xxx" },
    "neura-5": { dept: "ciso", url: "https://hook.us2.make.com/xxx" },
    "neura-6": { dept: "cmo", url: "https://hook.us2.make.com/xxx" },
    "neura-7": { dept: "cto", url: "https://hook.us2.make.com/xxx" },
    "neura-8": { dept: "legal", url: "https://hook.us2.make.com/xxx" },
    "neura-9": { dept: "reception", url: "https://hook.us2.make.com/xxx" },
    "neura-10": { dept: "research", url: "https://hook.us2.make.com/xxx" },
    "neura-11": { dept: "support", url: "https://hook.us2.make.com/xxx" }
};

app.http('invoke', {
    methods: ['POST', 'OPTIONS'],
    authLevel: 'anonymous',
    route: 'invoke/{agentId}',
    handler: async (request, context) => {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Route, X-Correlation-Id'
                }
            };
        }

        const agentId = request.params.agentId;
        const authHeader = request.headers.get('authorization');
        const route = request.headers.get('x-route');
        const correlationId = request.headers.get('x-correlation-id');

        context.log(`Invoke agent: ${agentId}, route: ${route}, correlation: ${correlationId}`);

        // Validate headers
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Missing or invalid Authorization header' })
            };
        }

        if (!route || !correlationId) {
            return {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Missing required headers: X-Route, X-Correlation-Id' })
            };
        }

        // Validate agent exists
        if (!agentRoutes[agentId]) {
            return {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: `Agent ${agentId} not found` })
            };
        }

        // Parse request body
        let payload;
        try {
            const text = await request.text();
            payload = text ? JSON.parse(text) : {};
        } catch (err) {
            return {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Invalid JSON payload' })
            };
        }

        const agentConfig = agentRoutes[agentId];

        // SIMULATION MODE (default)
        if (process.env.MAKE_FORWARD !== '1') {
            context.log(`✅ [SIM] ${agentId} - ${correlationId}`);
            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    agentId,
                    dept: agentConfig.dept,
                    correlationId,
                    route,
                    mode: 'simulation',
                    response: `Simulación de respuesta del agente ${agentId} (${agentConfig.dept}). Input recibido: ${JSON.stringify(payload.input || 'N/A')}`,
                    timestamp: new Date().toISOString()
                })
            };
        }

        // FORWARD MODE (to Make.com)
        try {
            const makeToken = process.env.MAKE_TOKEN;
            if (!makeToken) {
                throw new Error('MAKE_TOKEN not configured');
            }

            const response = await fetch(agentConfig.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${makeToken}`
                },
                body: JSON.stringify({
                    ...payload,
                    agentId,
                    correlationId,
                    route
                })
            });

            const data = await response.json();
            context.log(`✅ [FORWARD] ${agentId} - ${correlationId} - ${response.status}`);

            return {
                status: response.status,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify(data)
            };
        } catch (err) {
            context.log(`❌ [FORWARD ERROR] ${agentId} - ${err.message}`);
            return {
                status: 502,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'Failed to forward request to Make.com',
                    details: err.message
                })
            };
        }
    }
});
