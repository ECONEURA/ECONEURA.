/**
 * 🧠 MODELO ADAPTATIVO - Selección inteligente de modelo OpenAI
 * 
 * GPT-4o: Tareas generales (rápido, económico, excelente)
 * o1-preview: Razonamiento profundo (lento, caro, superior para análisis complejos)
 * 
 * Auto-detecta complejidad y elige el mejor modelo
 */

// 📚 DESCRIPCIÓN DE MODELOS DISPONIBLES
const MODEL_DETAILS = {
    'gpt-4o': {
        label: 'GPT-4o',
        tier: 'premium',
        strengths: ['multimodal', 'respuestas rápidas', 'contexto 128K tokens'],
        typicalUse: 'Conversaciones generales, análisis equilibrados, soporte ejecutivo',
        latency: '⚡ 2-3s',
        cost: '$5 / $15 por 1M tokens'
    },
    'gpt-4o-mini': {
        label: 'GPT-4o-mini',
        tier: 'economy',
        strengths: ['muy económico', 'respuestas rápidas', 'ideal para tareas breves'],
        typicalUse: 'FAQs, atención básica, resúmenes cortos',
        latency: '⚡ 1-2s',
        cost: '$0.15 / $0.60 por 1M tokens'
    },
    'o1-preview': {
        label: 'o1-preview',
        tier: 'deep-reasoning',
        strengths: ['chain-of-thought exhaustivo', 'razonamiento estratégico', 'matemáticas avanzadas'],
        typicalUse: 'Auditorías, valoraciones financieras, arquitectura compleja',
        latency: '⏳ 30-60s',
        cost: '$15 / $60 por 1M tokens'
    },
    'o1-mini': {
        label: 'o1-mini',
        tier: 'deep-reasoning-lite',
        strengths: ['razonamiento profundo equilibrado', 'más rápido que o1-preview', 'costo moderado'],
        typicalUse: 'Análisis avanzados de media complejidad, investigación aplicada',
        latency: '⏱️ 10-20s',
        cost: '$3 / $12 por 1M tokens'
    }
};

// 🎯 ESTRATEGIA POR AGENTE
const AGENT_MODEL_STRATEGY = {
    'neura-1': { 
        name: 'Analytics',
        role: 'Data Analytics Expert',
        default: 'gpt-4o', 
        complex: 'o1-preview',
        reasoningLite: 'o1-mini',
        economy: 'gpt-4o-mini',
        complexTriggers: ['análisis profundo', 'forecast', 'tendencia', 'predicción'],
        features: ['Análisis estadístico avanzado', 'Proyecciones basadas en datos', 'Dashboards narrativos']
    },
    'neura-2': { 
        name: 'CDO',
        role: 'Chief Data Officer',
        default: 'gpt-4o', 
        complex: 'o1-preview',
        reasoningLite: 'o1-mini',
        economy: 'gpt-4o-mini',
        complexTriggers: ['estrategia datos', 'gobernanza', 'arquitectura', 'compliance'],
        features: ['Gobernanza de datos', 'Diseño de arquitectura', 'Planes de MDM / calidad']
    },
    'neura-3': { 
        name: 'CFO',
        role: 'Financial Strategy Expert',
        default: 'gpt-4o', 
        complex: 'o1-preview',
        reasoningLite: 'o1-mini',
        economy: 'gpt-4o-mini',
        complexTriggers: ['valoración', 'forecast 3 años', 'análisis financiero', 'due diligence'],
        features: ['Valoraciones DCF', 'Modelos financieros a largo plazo', 'Planes de mitigación de riesgos']
    },
    'neura-4': { 
        name: 'CHRO',
        role: 'People & Culture Leader',
        default: 'gpt-4o', 
        complex: null, // Siempre usa default (no requiere razonamiento profundo)
        reasoningLite: null,
        economy: 'gpt-4o-mini',
        complexTriggers: [],
        features: ['Programas de desarrollo de talento', 'Clima organizacional', 'Planes de compensación']
    },
    'neura-5': { 
        name: 'CISO',
        role: 'Cybersecurity Strategist',
        default: 'gpt-4o', 
        complex: 'o1-preview',
        reasoningLite: 'o1-mini',
        economy: 'gpt-4o-mini',
        complexTriggers: ['auditoría', 'vulnerabilidad', 'threat modeling', 'compliance'],
        features: ['Threat modeling avanzado', 'Planes de respuesta a incidentes', 'Mapeo OWASP / NIST']
    },
    'neura-6': { 
        name: 'CMO',
        role: 'Marketing Orchestrator',
        default: 'gpt-4o', 
        complex: null,
        reasoningLite: null,
        economy: 'gpt-4o-mini',
        complexTriggers: [],
        features: ['Campañas creativas', 'Calendarios de contenido', 'Mensajes segmentados']
    },
    'neura-7': { 
        name: 'CTO',
        role: 'Technology Strategist',
        default: 'gpt-4o', 
        complex: 'o1-preview',
        reasoningLite: 'o1-mini',
        economy: 'gpt-4o-mini',
        complexTriggers: ['arquitectura', 'debugging', 'optimización', 'escalabilidad'],
        features: ['Arquitecturas escalables', 'Estrategias multi-cloud', 'Planes de modernización']
    },
    'neura-8': { 
        name: 'Legal',
        role: 'Corporate Counsel',
        default: 'gpt-4o', 
        complex: 'o1-preview',
        reasoningLite: 'o1-mini',
        economy: 'gpt-4o-mini',
        complexTriggers: ['análisis jurídico', 'contrato complejo', 'litigation', 'compliance'],
        features: ['Análisis contractual', 'Mapeo de riesgos regulatorios', 'Compliance internacional']
    },
    'neura-9': { 
        name: 'Reception',
        role: 'AI Concierge',
        default: 'gpt-4o', 
        complex: null,
        reasoningLite: null,
        economy: 'gpt-4o-mini',
        complexTriggers: [],
        features: ['Enrutamiento inteligente', 'FAQs instantáneas', 'Embudos de bienvenida']
    },
    'neura-10': { 
        name: 'Research',
        role: 'Research Strategist',
        default: 'gpt-4o', 
        complex: 'o1-preview',
        reasoningLite: 'o1-mini',
        economy: 'gpt-4o-mini',
        complexTriggers: ['investigación profunda', 'meta-análisis', 'review sistemático'],
        features: ['Meta-análisis', 'Revisión bibliográfica 360°', 'Planes de experimentación']
    }
};

// 🔍 DETECTORES DE COMPLEJIDAD
const COMPLEXITY_PATTERNS = {
    // Palabras clave que indican necesidad de razonamiento profundo
    deep_analysis: /analiz[ae].*(profund[oa]|exhaustiv[oa]|detallad[oa])/i,
    strategic: /estrategi[ca].*(largo plazo|3 años|5 años)/i,
    audit: /audit[oía]|compliance|regulatorio|due diligence/i,
    architecture: /(diseñ|architect)[oa].*(sistema|infraestructura)|debugging complejo/i,
    financial: /valoración|forecast.*años|análisis financiero profundo/i,
    legal: /análisis jurídico|contrato complejo|litigation/i,
    research: /investigación.*(profunda|exhaustiva)|meta-análisis|systematic review/i,
    
    // Indicadores de complejidad por estructura
    multiple_constraints: /considerando|teniendo en cuenta|dado que.*y.*además/i,
    comparison: /compar[ae].*(ventajas|desventajas|pros|cons)/i,
    optimization: /optimiz[ae]|maximiz[ae]|minimiz[ae].*\w+.*\w+/i, // Con múltiples variables
};

// 📏 SCORING DE COMPLEJIDAD
function calculateComplexityScore(input) {
    let score = 0;
    const inputLower = input.toLowerCase();
    
    // Pattern matching
    Object.entries(COMPLEXITY_PATTERNS).forEach(([key, pattern]) => {
        if (pattern.test(input)) {
            score += 0.15;
        }
    });
    
    // Longitud del input (queries largos = mayor complejidad)
    if (input.length > 500) score += 0.1;
    if (input.length > 1000) score += 0.1;
    
    // Múltiples preguntas/requisitos
    const questionMarks = (input.match(/\?/g) || []).length;
    if (questionMarks > 2) score += 0.1;
    
    // Palabras técnicas especializadas
    const technicalWords = [
        'arquitectura', 'compliance', 'vulnerabilidad', 'forecast',
        'estrategia', 'optimización', 'valoración', 'due diligence'
    ];
    const techCount = technicalWords.filter(word => inputLower.includes(word)).length;
    score += techCount * 0.1;
    
    // Estructura de razonamiento (bullets, pasos, etc)
    if (input.includes('1.') || input.includes('•') || input.includes('-')) {
        score += 0.1;
    }
    
    return Math.min(score, 1.0); // Cap at 1.0
}

// 🎯 SELECTOR DE MODELO
function selectOptimalModel(agentId, input, options = {}) {
    const {
        forceModel = null,           // Forzar modelo específico
        complexityThreshold = 0.6,   // Umbral para cambiar a o1-preview
        preferSpeed = false,         // Siempre usar gpt-4o
        allowO1 = true              // Permitir o1-preview (puede desactivarse globalmente)
    } = options;
    
    // Forzar modelo si se especifica
    if (forceModel) {
        return {
            model: forceModel,
            reason: 'forced',
            complexity: null
        };
    }
    
    // Si no se permite o1, siempre usar default
    if (!allowO1 || preferSpeed) {
        const strategy = AGENT_MODEL_STRATEGY[agentId];
        return {
            model: strategy?.default || 'gpt-4o',
            reason: 'speed_preferred',
            complexity: null
        };
    }
    
    // Obtener estrategia del agente
    const strategy = AGENT_MODEL_STRATEGY[agentId];
    if (!strategy) {
        return {
            model: 'gpt-4o',
            reason: 'unknown_agent',
            complexity: null
        };
    }
    
    // Si el agente no tiene modelo complejo, usar default
    if (!strategy.complex) {
        return {
            model: strategy.default,
            reason: 'no_complex_model',
            complexity: null
        };
    }
    
    // Calcular complejidad
    const complexity = calculateComplexityScore(input);
    
    // Verificar triggers específicos del agente
    const hasTrigger = strategy.complexTriggers.some(trigger => 
        input.toLowerCase().includes(trigger.toLowerCase())
    );
    
    // Decisión final
    const useComplexModel = (complexity >= complexityThreshold) || hasTrigger;
    
    return {
        model: useComplexModel ? strategy.complex : strategy.default,
        reason: useComplexModel 
            ? (hasTrigger ? 'agent_trigger' : 'high_complexity')
            : 'standard_task',
        complexity: complexity,
        trigger: hasTrigger
    };
}

// 💰 ESTIMACIÓN DE COSTO
function estimateCost(model, inputTokens, outputTokens) {
    const pricing = {
        'gpt-4o': { input: 5, output: 15 },           // per 1M tokens
        'gpt-4o-mini': { input: 0.15, output: 0.60 },
        'o1-preview': { input: 15, output: 60 },      // 4x más caro
        'o1-mini': { input: 3, output: 12 },
        'gpt-4-turbo': { input: 10, output: 30 }
    };
    
    const rates = pricing[model] || pricing['gpt-4o'];
    const costInput = (inputTokens / 1_000_000) * rates.input;
    const costOutput = (outputTokens / 1_000_000) * rates.output;
    
    return {
        total: costInput + costOutput,
        input: costInput,
        output: costOutput,
        currency: 'USD'
    };
}

// 📊 ESTADÍSTICAS DE USO
class ModelUsageTracker {
    constructor() {
        this.stats = {
            'gpt-4o': { count: 0, tokens: 0, cost: 0 },
            'gpt-4o-mini': { count: 0, tokens: 0, cost: 0 },
            'o1-preview': { count: 0, tokens: 0, cost: 0 },
            'o1-mini': { count: 0, tokens: 0, cost: 0 }
        };
    }
    
    track(model, inputTokens, outputTokens) {
        if (!this.stats[model]) {
            this.stats[model] = { count: 0, tokens: 0, cost: 0 };
        }
        
        this.stats[model].count++;
        this.stats[model].tokens += (inputTokens + outputTokens);
        
        const cost = estimateCost(model, inputTokens, outputTokens);
        this.stats[model].cost += cost.total;
    }
    
    getStats() {
        return {
            ...this.stats,
            total: Object.values(this.stats).reduce((acc, stat) => ({
                count: acc.count + stat.count,
                tokens: acc.tokens + stat.tokens,
                cost: acc.cost + stat.cost
            }), { count: 0, tokens: 0, cost: 0 })
        };
    }
    
    reset() {
        Object.keys(this.stats).forEach(model => {
            this.stats[model] = { count: 0, tokens: 0, cost: 0 };
        });
    }
}

// Instancia global
const usageTracker = new ModelUsageTracker();

// 📋 RESUMEN DE CAPACIDADES POR AGENTE
function getAgentCapabilities() {
    const buildModelDescriptor = (modelKey) => {
        if (!modelKey) return null;
        const meta = MODEL_DETAILS[modelKey] || { label: modelKey, tier: 'custom', strengths: [] };
        return {
            id: modelKey,
            ...meta
        };
    };

    return Object.entries(AGENT_MODEL_STRATEGY).map(([agentId, strategy]) => ({
        agentId,
        name: strategy.name,
        role: strategy.role,
        defaultModel: buildModelDescriptor(strategy.default),
        reasoningModel: buildModelDescriptor(strategy.complex),
        reasoningLiteModel: buildModelDescriptor(strategy.reasoningLite),
        economyModel: buildModelDescriptor(strategy.economy),
        complexTriggers: strategy.complexTriggers,
        features: strategy.features,
        availableModels: [strategy.default, strategy.reasoningLite, strategy.complex, strategy.economy]
            .filter(Boolean)
            .map(model => buildModelDescriptor(model))
    }));
}

// 🧪 TESTING/DEBUGGING
function explainModelSelection(agentId, input) {
    const selection = selectOptimalModel(agentId, input);
    const strategy = AGENT_MODEL_STRATEGY[agentId];
    
    console.log('\n🧠 MODEL SELECTION ANALYSIS');
    console.log('═'.repeat(60));
    console.log(`Agent: ${agentId} (${strategy?.name || 'Unknown'})`);
    console.log(`Input: "${input.substring(0, 100)}${input.length > 100 ? '...' : ''}"`);
    console.log(`\nComplexity Score: ${(selection.complexity || 0).toFixed(2)}`);
    console.log(`Agent Triggers: ${strategy?.complexTriggers.join(', ') || 'None'}`);
    console.log(`Trigger Match: ${selection.trigger ? 'YES' : 'NO'}`);
    console.log(`\n✅ Selected Model: ${selection.model}`);
    console.log(`Reason: ${selection.reason}`);
    console.log('═'.repeat(60) + '\n');
    
    return selection;
}

module.exports = {
    selectOptimalModel,
    calculateComplexityScore,
    estimateCost,
    usageTracker,
    explainModelSelection,
    getAgentCapabilities,
    MODEL_DETAILS,
    AGENT_MODEL_STRATEGY,
    COMPLEXITY_PATTERNS
};
