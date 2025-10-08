const { app } = require('@azure/functions');

app.http('health', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'health',
    handler: async (request, context) => {
        context.log('Health check called');
        
        return {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                ok: true,
                mode: process.env.MAKE_FORWARD === '1' ? 'forward' : 'simulation',
                ts: new Date().toISOString(),
                service: 'Azure Static Web Apps API'
            })
        };
    }
});
