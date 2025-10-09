const express = require('express');
const router = express.Router();
const { invokeMakeAgent } = require('../services/makeService');
const { invokeOpenAIAgent } = require('../services/openaiService');
const agentsConfig = require('../config/agents.json');

router.post('/:agentId', async (req, res, next) => {
    const { agentId } = req.params;
    const { input, context } = req.body;
    const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();

    try {
        // Route to appropriate service
        if (agentId.startsWith('a-')) {
            // Make.com automation agent
            const result = await invokeMakeAgent(agentId, { input, context, correlationId });
            return res.json(result);
        } else if (agentId.startsWith('neura-')) {
            // OpenAI conversational agent
            const result = await invokeOpenAIAgent(agentId, { input, context, correlationId });
            return res.json(result);
        } else {
            return res.status(404).json({ error: 'Agent not found', agentId });
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;
