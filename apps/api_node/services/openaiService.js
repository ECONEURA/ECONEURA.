const OpenAI = require('openai');
const agentsConfig = require('../config/agents.json');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function invokeOpenAIAgent(neuraId, payload) {
    const neura = agentsConfig.openaiAgents[neuraId];
    
    if (!neura) {
        throw new Error(`OpenAI agent not configured: ${neuraId}`);
    }

    // Add message to thread
    await openai.beta.threads.messages.create(neura.threadId, {
        role: 'user',
        content: payload.input
    });

    // Run assistant
    const run = await openai.beta.threads.runs.create(neura.threadId, {
        assistant_id: neura.assistantId
    });

    // Poll for completion
    let runStatus = await openai.beta.threads.runs.retrieve(neura.threadId, run.id);
    let attempts = 0;
    const maxAttempts = 30;

    while (runStatus.status !== 'completed' && attempts < maxAttempts) {
        if (runStatus.status === 'failed' || runStatus.status === 'cancelled' || runStatus.status === 'expired') {
            throw new Error(`Run ${runStatus.status}: ${runStatus.last_error?.message || 'Unknown error'}`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(neura.threadId, run.id);
        attempts++;
    }

    if (runStatus.status !== 'completed') {
        throw new Error('Run timeout');
    }

    // Get latest message
    const messages = await openai.beta.threads.messages.list(neura.threadId, { limit: 1 });
    const lastMessage = messages.data[0];
    const textContent = lastMessage.content.find(c => c.type === 'text');

    return {
        output: textContent?.text?.value || '',
        neuraId,
        correlationId: payload.correlationId
    };
}

module.exports = { invokeOpenAIAgent };
