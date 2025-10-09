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
