const OpenAI = require('openai');
const { selectOptimalModel, usageTracker, explainModelSelection } = require('./modelSelector');
const { conversationStore } = require('./conversationStore');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// 🎭 PERSONALIDADES DE AGENTES NEURA (igual que ChatGPT pero especializados)
const NEURA_PERSONALITIES = {
    'neura-1': {
        name: 'Analytics Specialist',
        role: 'Data Analytics Expert',
        systemPrompt: `Eres un experto en análisis de datos y métricas empresariales.
Tu especialidad es interpretar datos complejos y proporcionar insights accionables.
Respondes de forma clara, utilizas ejemplos cuando sea apropiado, y siempre fundamentas
tus recomendaciones en datos. Puedes realizar cálculos, crear visualizaciones conceptuales
y explicar tendencias.`,
        temperature: 0.5,
        model: 'gpt-4o'
    },
    'neura-2': {
        name: 'Chief Data Officer',
        role: 'Data Strategy Leader',
        systemPrompt: `Eres el Chief Data Officer de ECONEURA. Tu rol es dirigir la estrategia
de datos de la organización. Piensas estratégicamente sobre gobernanza de datos, calidad,
privacidad y arquitectura de datos. Eres experto en regulaciones (GDPR, CCPA) y mejores
prácticas de gestión de datos empresariales.`,
        temperature: 0.6,
        model: 'gpt-4o'
    },
    'neura-3': {
        name: 'Chief Financial Officer',
        role: 'Financial Strategy Expert',
        systemPrompt: `Eres el CFO de ECONEURA. Dominas análisis financiero, planificación
presupuestaria, forecasting, y gestión de riesgos financieros. Interpretas estados
financieros, ROI, cash flow, y métricas de rentabilidad. Tu objetivo es maximizar el
valor financiero mientras mantienes prudencia fiscal.`,
        temperature: 0.4,
        model: 'gpt-4o'
    },
    'neura-4': {
        name: 'Chief Human Resources Officer',
        role: 'People & Culture Leader',
        systemPrompt: `Eres el CHRO de ECONEURA. Tu especialidad es gestión de talento,
cultura organizacional, desarrollo de liderazgo, y estrategias de retención. Entiendes
dinámicas de equipo, motivación, compensación competitiva, y compliance laboral.
Eres empático pero objetivo.`,
        temperature: 0.7,
        model: 'gpt-4o'
    },
    'neura-5': {
        name: 'Chief Information Security Officer',
        role: 'Cybersecurity Expert',
        systemPrompt: `Eres el CISO de ECONEURA. Tu prioridad es la seguridad de la información,
gestión de riesgos cibernéticos, compliance (ISO 27001, SOC2), y respuesta a incidentes.
Evalúas vulnerabilidades, implementas controles de seguridad, y educas sobre mejores
prácticas. Siempre priorizas la postura de seguridad sin frenar innovación.`,
        temperature: 0.5,
        model: 'gpt-4o'
    },
    'neura-6': {
        name: 'Chief Marketing Officer',
        role: 'Marketing Strategy Leader',
        systemPrompt: `Eres el CMO de ECONEURA. Dominas estrategia de marca, marketing digital,
customer journey, análisis de mercado, y growth hacking. Entiendes SEO, SEM, content marketing,
social media, y marketing analytics. Eres creativo pero data-driven.`,
        temperature: 0.8,
        model: 'gpt-4o'
    },
    'neura-7': {
        name: 'Chief Technology Officer',
        role: 'Technology Visionary',
        systemPrompt: `Eres el CTO de ECONEURA. Tu expertise es arquitectura de software,
infraestructura cloud, DevOps, IA/ML, y escalabilidad de sistemas. Entiendes trade-offs
técnicos, technical debt, y modernización de sistemas. Equilibras innovación con estabilidad.`,
        temperature: 0.6,
        model: 'gpt-4o'
    },
    'neura-8': {
        name: 'Legal Counsel',
        role: 'Corporate Legal Advisor',
        systemPrompt: `Eres el Legal Counsel de ECONEURA. Tu especialidad es derecho corporativo,
contratos, propiedad intelectual, compliance regulatorio, y gestión de riesgos legales.
Proporcionas asesoramiento legal claro y práctico, identificas riesgos, y recomiendas
estrategias de mitigación.`,
        temperature: 0.4,
        model: 'gpt-4o'
    },
    'neura-9': {
        name: 'Reception Assistant',
        role: 'First Point of Contact',
        systemPrompt: `Eres el asistente de recepción de ECONEURA. Tu rol es ser el primer punto
de contacto, proporcionar información general, enrutar consultas al agente correcto, y
ofrecer asistencia amigable. Eres profesional, amigable, y eficiente.`,
        temperature: 0.7,
        model: 'gpt-4o'
    },
    'neura-10': {
        name: 'Research Specialist',
        role: 'Research & Development Expert',
        systemPrompt: `Eres especialista en investigación de ECONEURA. Tu expertise es metodología
de investigación, análisis de literatura científica, diseño experimental, y síntesis de
información compleja. Citas fuentes cuando es relevante y distingues entre evidencia fuerte
y especulativa.`,
        temperature: 0.6,
        model: 'gpt-4o'
    }
};

function prepareConversation(neuraId, payload = {}) {
    const personality = NEURA_PERSONALITIES[neuraId];
    if (!personality) {
        throw new Error(`Unknown agent: ${neuraId}. Available: neura-1 to neura-10`);
    }

    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not configured. Set it in .env file.');
    }

    const userMessage = payload.input || payload.message || JSON.stringify(payload);
    const userId = payload.userId || payload.user_id || 'anonymous';

    const modelSelection = selectOptimalModel(neuraId, userMessage, {
        preferSpeed: process.env.PREFER_SPEED === 'true',
        allowO1: process.env.ALLOW_O1_PREVIEW !== 'false',
        complexityThreshold: parseFloat(process.env.COMPLEXITY_THRESHOLD || '0.6')
    });

    const history = conversationStore.getHistory(userId, neuraId, 10);
    const messages = [
        { role: 'system', content: personality.systemPrompt },
        ...history,
        { role: 'user', content: userMessage }
    ];

    return {
        personality,
        userMessage,
        userId,
        history,
        messages,
        modelSelection
    };
}

// 🚀 FUNCIÓN PRINCIPAL - IGUAL QUE CHATGPT
async function invokeOpenAIAgent(neuraId, payload) {
    const {
        personality,
        userMessage,
        userId,
        history,
        messages,
        modelSelection
    } = prepareConversation(neuraId, payload);

    console.log(`💬 ${personality.name} processing message from ${userId}`);

    if (modelSelection.model !== personality.model) {
        console.log(`🧠 Model upgraded: ${personality.model} → ${modelSelection.model}`);
        console.log(`   Reason: ${modelSelection.reason} (complexity: ${(modelSelection.complexity || 0).toFixed(2)})`);
    }

    console.log(`📚 Conversation context: ${history.length} previous messages`);

    try {
        // ✨ LLAMADA A OPENAI (modelo seleccionado inteligentemente)
        const completion = await openai.chat.completions.create({
            model: modelSelection.model,
            messages,
            temperature: personality.temperature,
            max_tokens: modelSelection.model.startsWith('o1') ? 8000 : 3000,  // o1 necesita más tokens
            top_p: 0.95,
            frequency_penalty: 0.0,
            presence_penalty: 0.0
        });

        const assistantReply = completion.choices[0].message.content;
        const usage = completion.usage;

        // 📊 Trackear uso para estadísticas
        usageTracker.track(
            modelSelection.model,
            usage.prompt_tokens,
            usage.completion_tokens
        );

        // Guardar en historial para próxima conversación
    conversationStore.append(userId, neuraId, userMessage, assistantReply);

        console.log(`✅ ${personality.name} responded (${usage.total_tokens} tokens, model: ${modelSelection.model})`);

        return {
            output: assistantReply,
            neuraId,
            agent: personality.name,
            role: personality.role,
            model: modelSelection.model,  // Incluir modelo usado
            modelReason: modelSelection.reason,  // Por qué se eligió
            correlationId: payload.correlationId,
            contextMessages: history.length / 2, // Número de intercambios previos
            usage: {
                promptTokens: usage.prompt_tokens,
                completionTokens: usage.completion_tokens,
                totalTokens: usage.total_tokens
            },
            modelSelection
        };

    } catch (error) {
        console.error(`❌ OpenAI Error:`, error.message);

        if (error.status === 401) {
            throw new Error('Invalid OPENAI_API_KEY. Check your .env configuration.');
        }

        throw error;
    }
}

// 🌊 STREAMING - Respuestas token por token (como ChatGPT)
async function streamOpenAIAgent(neuraId, payload, res) {
    const {
        personality,
        userMessage,
        userId,
        history,
        messages,
        modelSelection
    } = prepareConversation(neuraId, payload);

    console.log(`🌊 Streaming from ${personality.name} (context: ${history.length} msgs, model: ${modelSelection.model})`);

    try {
        const startedAt = Date.now();

        const sendEvent = (event, data) => {
            res.write(`event: ${event}\n`);
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        };

        sendEvent('start', {
            agent: personality.name,
            role: personality.role,
            model: modelSelection.model,
            reason: modelSelection.reason,
            complexity: modelSelection.complexity,
            trigger: modelSelection.trigger,
            contextMessages: history.length / 2
        });

        // Stream de OpenAI
        const stream = await openai.chat.completions.create({
            model: modelSelection.model,
            messages,
            temperature: personality.temperature,
            max_tokens: 3000,
            stream: true
        });

        let fullResponse = '';
        let usageSnapshot = null;

        for await (const chunk of stream) {
            const choice = chunk.choices?.[0];
            const content = choice?.delta?.content || '';
            if (content) {
                fullResponse += content;
                sendEvent('token', { content });
            }

            if (choice?.delta?.tool_calls) {
                sendEvent('tool_call_delta', choice.delta.tool_calls);
            }

            if (chunk.usage) {
                usageSnapshot = chunk.usage;
            }
        }

        if (usageSnapshot) {
            usageTracker.track(
                modelSelection.model,
                usageSnapshot.prompt_tokens || 0,
                usageSnapshot.completion_tokens || 0
            );
            sendEvent('usage', usageSnapshot);
        }

        // Finalizar
        sendEvent('done', {
            durationMs: Date.now() - startedAt,
            model: modelSelection.model
        });
        res.end();

        // Guardar en historial
    conversationStore.append(userId, neuraId, userMessage, fullResponse);

        console.log(`✅ Streaming completed (${fullResponse.length} chars)`);

    } catch (error) {
        console.error(`❌ Streaming error:`, error.message);
        res.write(`event: error\n`);
        res.write(`data: ${JSON.stringify({ message: error.message })}\n\n`);
        res.end();
        throw error;
    }
}

module.exports = { invokeOpenAIAgent, streamOpenAIAgent, prepareConversation };
