/**
 * 🚀 NEURA Task Orchestrator
 * Conecta Make.com + OpenAI + NEURA Agents para ejecutar tareas complejas
 */

const OpenAI = require('openai');
const axios = require('axios');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// 🔧 CONFIGURACIÓN
const CONFIG = {
    makeWebhookBase: process.env.MAKE_WEBHOOK_BASE_URL || 'https://hook.us1.make.com',
    makeApiKey: process.env.MAKE_API_KEY,
    econeuraUrl: process.env.ECONEURA_URL || 'http://localhost:3000',
    braveApiKey: process.env.BRAVE_API_KEY // Para búsqueda web
};

// 🛠️ TOOLS DISPONIBLES (Function Calling)
const AVAILABLE_TOOLS = [
    {
        type: 'function',
        function: {
            name: 'buscar_web',
            description: 'Busca información actualizada en internet usando Brave Search',
            parameters: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'La consulta de búsqueda'
                    },
                    count: {
                        type: 'number',
                        description: 'Número de resultados (default: 5)',
                        default: 5
                    }
                },
                required: ['query']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'ejecutar_make_webhook',
            description: 'Ejecuta un webhook de Make.com para automatizar una tarea',
            parameters: {
                type: 'object',
                properties: {
                    webhook_id: {
                        type: 'string',
                        description: 'ID del webhook en Make.com'
                    },
                    data: {
                        type: 'object',
                        description: 'Datos a enviar al webhook'
                    }
                },
                required: ['webhook_id', 'data']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'obtener_datos_financieros',
            description: 'Obtiene datos financieros de la empresa (revenue, gastos, métricas)',
            parameters: {
                type: 'object',
                properties: {
                    tipo: {
                        type: 'string',
                        enum: ['revenue', 'gastos', 'roi', 'cash_flow'],
                        description: 'Tipo de dato financiero'
                    },
                    periodo: {
                        type: 'string',
                        description: 'Periodo (ej: "2024-Q3", "ultimo_trimestre")'
                    }
                },
                required: ['tipo']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'crear_tarea',
            description: 'Crea una tarea en el sistema de gestión de proyectos',
            parameters: {
                type: 'object',
                properties: {
                    titulo: {
                        type: 'string',
                        description: 'Título de la tarea'
                    },
                    descripcion: {
                        type: 'string',
                        description: 'Descripción detallada'
                    },
                    asignado_a: {
                        type: 'string',
                        description: 'Usuario asignado'
                    },
                    prioridad: {
                        type: 'string',
                        enum: ['baja', 'media', 'alta', 'urgente']
                    }
                },
                required: ['titulo']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'analizar_documento',
            description: 'Analiza un documento (PDF, Word, Excel) y extrae información',
            parameters: {
                type: 'object',
                properties: {
                    url: {
                        type: 'string',
                        description: 'URL del documento a analizar'
                    },
                    tipo_analisis: {
                        type: 'string',
                        enum: ['resumen', 'extraccion_datos', 'traduccion'],
                        description: 'Tipo de análisis a realizar'
                    }
                },
                required: ['url', 'tipo_analisis']
            }
        }
    }
];

// 🔍 IMPLEMENTACIÓN DE TOOLS
async function buscarWeb(query, count = 5) {
    if (!CONFIG.braveApiKey) {
        return { error: 'Brave API Key not configured', fallback: 'Búsqueda web no disponible' };
    }

    try {
        const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
            params: { q: query, count },
            headers: { 'X-Subscription-Token': CONFIG.braveApiKey }
        });

        const results = response.data.web?.results || [];
        return {
            query,
            resultados: results.slice(0, count).map(r => ({
                titulo: r.title,
                url: r.url,
                descripcion: r.description,
                fecha: r.age
            }))
        };
    } catch (error) {
        console.error('Error en búsqueda web:', error.message);
        return { error: error.message, query };
    }
}

async function ejecutarMakeWebhook(webhookId, data) {
    try {
        const url = `${CONFIG.makeWebhookBase}/${webhookId}`;
        console.log(`🔗 Ejecutando webhook Make: ${webhookId}`);
        
        const response = await axios.post(url, data, {
            headers: { 
                'Content-Type': 'application/json',
                ...(CONFIG.makeApiKey && { 'Authorization': `Bearer ${CONFIG.makeApiKey}` })
            },
            timeout: 30000
        });

        return {
            success: true,
            webhookId,
            response: response.data
        };
    } catch (error) {
        console.error('Error ejecutando webhook Make:', error.message);
        return {
            success: false,
            error: error.message,
            webhookId
        };
    }
}

async function obtenerDatosFinancieros(tipo, periodo = 'actual') {
    // Simulación - En producción conectar a DB o API real
    const datosSimulados = {
        revenue: { valor: 5000000, moneda: 'USD', periodo, crecimiento: '+15%' },
        gastos: { valor: 3200000, moneda: 'USD', periodo, categorias: { personal: 1800000, operaciones: 1000000, marketing: 400000 } },
        roi: { valor: 156, unidad: '%', periodo },
        cash_flow: { valor: 1800000, moneda: 'USD', periodo, status: 'positivo' }
    };

    return datosSimulados[tipo] || { error: `Tipo de dato no reconocido: ${tipo}` };
}

async function crearTarea(titulo, descripcion, asignado_a, prioridad = 'media') {
    // Simulación - En producción conectar a sistema de tareas real
    console.log(`📋 Creando tarea: ${titulo} (${prioridad})`);
    
    return {
        success: true,
        tarea_id: `TASK-${Date.now()}`,
        titulo,
        descripcion,
        asignado_a,
        prioridad,
        estado: 'pendiente',
        creado: new Date().toISOString()
    };
}

async function analizarDocumento(url, tipoAnalisis) {
    // Simulación - En producción usar OCR/parsing real
    console.log(`📄 Analizando documento: ${url} (${tipoAnalisis})`);
    
    return {
        url,
        tipo_analisis: tipoAnalisis,
        resultado: `Análisis ${tipoAnalisis} del documento completado`,
        simulado: true,
        mensaje: 'Función de análisis de documentos en desarrollo'
    };
}

// 🎯 EJECUTOR DE FUNCTIONS
async function ejecutarFunction(functionName, args) {
    console.log(`🔧 Ejecutando function: ${functionName}`, args);

    switch (functionName) {
        case 'buscar_web':
            return await buscarWeb(args.query, args.count);
        
        case 'ejecutar_make_webhook':
            return await ejecutarMakeWebhook(args.webhook_id, args.data);
        
        case 'obtener_datos_financieros':
            return await obtenerDatosFinancieros(args.tipo, args.periodo);
        
        case 'crear_tarea':
            return await crearTarea(args.titulo, args.descripcion, args.asignado_a, args.prioridad);
        
        case 'analizar_documento':
            return await analizarDocumento(args.url, args.tipo_analisis);
        
        default:
            return { error: `Función no implementada: ${functionName}` };
    }
}

// 🚀 ORCHESTRATOR PRINCIPAL
async function ejecutarTareaCompleja(mensaje, userId, neuraId = 'neura-orchestrator', options = {}) {
    console.log(`\n🎯 ORCHESTRATOR: Nueva tarea compleja`);
    console.log(`   Usuario: ${userId}`);
    console.log(`   Agente: ${neuraId}`);
    console.log(`   Mensaje: ${mensaje}\n`);

    try {
        // Construir prompt del sistema
        const systemPrompt = `Eres un agente NEURA orchestrator conectado a Make.com y capaz de ejecutar múltiples herramientas.
Tu rol es analizar la solicitud del usuario y decidir qué herramientas usar para completar la tarea.

Herramientas disponibles:
- buscar_web: Buscar información actualizada en internet
- ejecutar_make_webhook: Automatizar tareas vía Make.com
- obtener_datos_financieros: Acceder a datos financieros de la empresa
- crear_tarea: Crear tareas en sistema de gestión
- analizar_documento: Analizar PDFs, Word, Excel

Cuando el usuario te pida algo, decide si necesitas usar herramientas o si puedes responder directamente.
Si necesitas usar herramientas, úsalas y luego proporciona una respuesta completa.`;

        // Primera llamada: GPT decide qué herramientas usar
        let messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: mensaje }
        ];

        let response = await openai.chat.completions.create({
            model: options.model || 'gpt-4o',
            messages,
            tools: AVAILABLE_TOOLS,
            tool_choice: 'auto',
            temperature: 0.7,
            max_tokens: 3000
        });

        let iterations = 0;
        const maxIterations = 5;
        const toolCalls = [];

        // Loop para ejecutar tool calls
        while (response.choices[0].message.tool_calls && iterations < maxIterations) {
            iterations++;
            console.log(`\n🔄 Iteración ${iterations}: Ejecutando tools...`);

            const message = response.choices[0].message;
            messages.push(message);

            // Ejecutar cada tool call
            for (const toolCall of message.tool_calls) {
                const functionName = toolCall.function.name;
                const functionArgs = JSON.parse(toolCall.function.arguments);
                
                console.log(`   📞 ${functionName}(${JSON.stringify(functionArgs)})`);

                const functionResult = await ejecutarFunction(functionName, functionArgs);
                
                toolCalls.push({
                    function: functionName,
                    arguments: functionArgs,
                    result: functionResult
                });

                // Añadir resultado del tool call
                messages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(functionResult)
                });
            }

            // Siguiente llamada con resultados de tools
            response = await openai.chat.completions.create({
                model: options.model || 'gpt-4o',
                messages,
                tools: AVAILABLE_TOOLS,
                tool_choice: 'auto',
                temperature: 0.7,
                max_tokens: 3000
            });
        }

        const finalResponse = response.choices[0].message.content;
        const usage = response.usage;

        console.log(`\n✅ Tarea completada en ${iterations} iteraciones`);
        console.log(`   Tools usados: ${toolCalls.length}`);
        console.log(`   Tokens: ${usage.total_tokens}\n`);

        return {
            success: true,
            respuesta: finalResponse,
            toolsEjecutados: toolCalls,
            iteraciones: iterations,
            usage: {
                promptTokens: usage.prompt_tokens,
                completionTokens: usage.completion_tokens,
                totalTokens: usage.total_tokens
            },
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('❌ Error en orchestrator:', error.message);
        return {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = {
    ejecutarTareaCompleja,
    ejecutarFunction,
    AVAILABLE_TOOLS,
    CONFIG
};
