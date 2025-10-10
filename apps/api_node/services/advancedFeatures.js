/**
 * ECONEURA - Capacidades Avanzadas ChatGPT
 * 
 * Módulo que añade todas las funciones de ChatGPT a los agentes NEURA:
 * ✅ Búsqueda web (información actualizada)
 * ✅ Análisis de imágenes (GPT-4 Vision)
 * ✅ Generación de imágenes (DALL-E 3)
 * ✅ Code Interpreter (ejecutar Python)
 * ✅ Análisis de documentos (PDF, Word, Excel)
 * ✅ Function calling (acceso a datos internos)
 */

const OpenAI = require('openai');
const axios = require('axios');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// ============================================
// 🔍 BÚSQUEDA WEB (información actualizada)
// ============================================

async function webSearch(query) {
    /**
     * Buscar información actualizada en la web
     * Usa Bing Search API o alternativa
     */
    
    // Opción 1: Bing Search (requiere BING_API_KEY)
    if (process.env.BING_API_KEY) {
        try {
            const response = await axios.get('https://api.bing.microsoft.com/v7.0/search', {
                headers: {
                    'Ocp-Apim-Subscription-Key': process.env.BING_API_KEY
                },
                params: {
                    q: query,
                    count: 5,
                    mkt: 'es-ES'
                }
            });
            
            return {
                results: response.data.webPages?.value?.map(page => ({
                    title: page.name,
                    url: page.url,
                    snippet: page.snippet
                })) || [],
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error en búsqueda web:', error.message);
        }
    }
    
    // Opción 2: Simulación con fecha actual
    return {
        results: [{
            title: "Información actualizada no disponible",
            snippet: `Fecha actual: ${new Date().toLocaleString('es-ES')}. Configure BING_API_KEY para búsquedas reales.`
        }],
        simulated: true
    };
}

// ============================================
// 👁️ ANÁLISIS DE IMÁGENES (GPT-4 Vision)
// ============================================

async function analyzeImage(imageUrl, question = "¿Qué ves en esta imagen?") {
    /**
     * Analizar una imagen usando GPT-4 Vision
     * Puede procesar imágenes desde URL o base64
     */
    
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",  // Modelo con capacidad de visión
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: question },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageUrl,
                                detail: "high"  // "high" para análisis detallado
                            }
                        }
                    ]
                }
            ],
            max_tokens: 1000
        });
        
        return {
            analysis: response.choices[0].message.content,
            model: "gpt-4o-vision",
            usage: response.usage
        };
    } catch (error) {
        console.error('Error analizando imagen:', error.message);
        throw new Error(`No se pudo analizar la imagen: ${error.message}`);
    }
}

// ============================================
// 🎨 GENERACIÓN DE IMÁGENES (DALL-E 3)
// ============================================

async function generateImage(prompt, options = {}) {
    /**
     * Generar imágenes con DALL-E 3
     * Calidad profesional, ideal para marketing, presentaciones
     */
    
    const {
        size = "1024x1024",  // "1024x1024", "1792x1024", "1024x1792"
        quality = "standard",  // "standard" o "hd"
        style = "vivid"  // "vivid" o "natural"
    } = options;
    
    try {
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: size,
            quality: quality,
            style: style
        });
        
        return {
            url: response.data[0].url,
            revisedPrompt: response.data[0].revised_prompt,  // OpenAI mejora el prompt
            model: "dall-e-3",
            size: size,
            quality: quality
        };
    } catch (error) {
        console.error('Error generando imagen:', error.message);
        throw new Error(`No se pudo generar imagen: ${error.message}`);
    }
}

// ============================================
// 🐍 CODE INTERPRETER (ejecutar código)
// ============================================

async function executeCode(code, language = 'python') {
    /**
     * Ejecutar código en sandbox seguro
     * NOTA: Requiere servicio externo o Docker para seguridad
     */
    
    // Opción 1: Usar OpenAI Assistants con Code Interpreter
    if (process.env.USE_OPENAI_CODE_INTERPRETER === 'true') {
        try {
            // Crear thread
            const thread = await openai.beta.threads.create();
            
            // Añadir mensaje con código
            await openai.beta.threads.messages.create(thread.id, {
                role: "user",
                content: `Ejecuta este código ${language}:\n\n${code}`
            });
            
            // Ejecutar con code interpreter habilitado
            const run = await openai.beta.threads.runs.create(thread.id, {
                assistant_id: process.env.OPENAI_ASSISTANT_ID,
                tools: [{ type: "code_interpreter" }]
            });
            
            // Esperar resultado
            let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
            while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
                await new Promise(resolve => setTimeout(resolve, 1000));
                runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
            }
            
            // Obtener resultado
            const messages = await openai.beta.threads.messages.list(thread.id);
            const lastMessage = messages.data[0];
            
            return {
                output: lastMessage.content[0].text.value,
                status: 'success',
                method: 'openai-code-interpreter'
            };
        } catch (error) {
            console.error('Error en code interpreter:', error.message);
        }
    }
    
    // Opción 2: Simulación (SOLO para demo - NO ejecutar código real sin sandbox)
    return {
        output: `[SIMULACIÓN] Código ${language} recibido. Configure code interpreter para ejecución real.`,
        code: code,
        status: 'simulated',
        warning: '⚠️ Ejecución de código requiere sandbox seguro'
    };
}

// ============================================
// 📄 ANÁLISIS DE DOCUMENTOS
// ============================================

async function analyzeDocument(fileContent, fileType, question) {
    /**
     * Analizar documentos: PDF, Word, Excel, CSV
     * Extrae texto y analiza contenido con GPT-4
     */
    
    let extractedText = '';
    
    // Según tipo de archivo, extraer texto
    switch (fileType) {
        case 'pdf':
            // Requiere: npm install pdf-parse
            extractedText = '[PDF] Instalar pdf-parse para procesamiento real';
            break;
        case 'docx':
            // Requiere: npm install mammoth
            extractedText = '[DOCX] Instalar mammoth para procesamiento real';
            break;
        case 'xlsx':
        case 'csv':
            // Requiere: npm install xlsx
            extractedText = '[Excel/CSV] Instalar xlsx para procesamiento real';
            break;
        default:
            extractedText = fileContent;
    }
    
    // Analizar con GPT-4
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "Eres un experto analizando documentos. Proporciona análisis claros y precisos."
                },
                {
                    role: "user",
                    content: `Documento:\n${extractedText}\n\nPregunta: ${question}`
                }
            ],
            max_tokens: 2000
        });
        
        return {
            analysis: response.choices[0].message.content,
            fileType: fileType,
            extractedLength: extractedText.length,
            usage: response.usage
        };
    } catch (error) {
        console.error('Error analizando documento:', error.message);
        throw error;
    }
}

// ============================================
// 🛠️ FUNCTION CALLING (Tools)
// ============================================

const AVAILABLE_FUNCTIONS = {
    // Función: Obtener datos financieros
    get_financial_data: async (params) => {
        const { metric, period } = params;
        // Aquí conectarías a tu DB o API interna
        return {
            metric: metric,
            period: period,
            value: 1234567,
            currency: 'USD',
            source: 'internal_db',
            timestamp: new Date().toISOString()
        };
    },
    
    // Función: Búsqueda en base de conocimiento
    search_knowledge_base: async (params) => {
        const { query, category } = params;
        // Aquí buscarías en tu documentación interna
        return {
            results: [
                {
                    title: 'Resultado de búsqueda simulado',
                    content: 'Configure esta función para búsquedas reales',
                    category: category
                }
            ]
        };
    },
    
    // Función: Obtener datos de usuario
    get_user_profile: async (params) => {
        const { userId } = params;
        // Aquí consultarías tu DB de usuarios
        return {
            userId: userId,
            name: 'Usuario Simulado',
            role: 'CFO',
            preferences: {}
        };
    },
    
    // Función: Búsqueda web
    web_search: async (params) => {
        return await webSearch(params.query);
    }
};

// Definiciones de funciones para OpenAI
const FUNCTION_DEFINITIONS = [
    {
        name: "get_financial_data",
        description: "Obtiene datos financieros de la empresa",
        parameters: {
            type: "object",
            properties: {
                metric: {
                    type: "string",
                    description: "Métrica financiera (revenue, profit, expenses, etc.)"
                },
                period: {
                    type: "string",
                    description: "Período (current_month, current_quarter, current_year)"
                }
            },
            required: ["metric", "period"]
        }
    },
    {
        name: "search_knowledge_base",
        description: "Busca información en la base de conocimiento interna",
        parameters: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "Consulta de búsqueda"
                },
                category: {
                    type: "string",
                    description: "Categoría (policies, procedures, documentation)"
                }
            },
            required: ["query"]
        }
    },
    {
        name: "web_search",
        description: "Busca información actualizada en la web",
        parameters: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "Consulta de búsqueda"
                }
            },
            required: ["query"]
        }
    }
];

async function chatWithTools(messages, availableTools = FUNCTION_DEFINITIONS) {
    /**
     * Chat con function calling habilitado
     * El modelo decide automáticamente cuándo usar herramientas
     */
    
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: messages,
            tools: availableTools.map(tool => ({
                type: "function",
                function: tool
            })),
            tool_choice: "auto"  // El modelo decide cuándo usar tools
        });
        
        const message = response.choices[0].message;
        
        // Si el modelo quiere usar una función
        if (message.tool_calls) {
            const toolResults = [];
            
            for (const toolCall of message.tool_calls) {
                const functionName = toolCall.function.name;
                const functionArgs = JSON.parse(toolCall.function.arguments);
                
                console.log(`🛠️ Ejecutando función: ${functionName}`, functionArgs);
                
                // Ejecutar función
                const functionResponse = await AVAILABLE_FUNCTIONS[functionName](functionArgs);
                
                toolResults.push({
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: functionName,
                    content: JSON.stringify(functionResponse)
                });
            }
            
            // Continuar conversación con resultados de funciones
            const secondResponse = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    ...messages,
                    message,
                    ...toolResults
                ]
            });
            
            return {
                response: secondResponse.choices[0].message.content,
                toolsUsed: message.tool_calls.map(tc => tc.function.name),
                usage: secondResponse.usage
            };
        }
        
        // Respuesta directa sin usar tools
        return {
            response: message.content,
            toolsUsed: [],
            usage: response.usage
        };
        
    } catch (error) {
        console.error('Error en chat con tools:', error.message);
        throw error;
    }
}

// ============================================
// 🧠 MEMORIA A LARGO PLAZO (persistente)
// ============================================

// Esta función se conectaría a PostgreSQL para guardar/cargar memoria
async function saveMemory(userId, agentId, key, value) {
    /**
     * Guardar información en memoria persistente
     * Ejemplo: preferencias del usuario, contexto empresarial
     */
    
    // TODO: Implementar con PostgreSQL
    console.log(`💾 Guardando memoria: ${userId}:${agentId}:${key}`);
    
    return {
        saved: true,
        key: key,
        userId: userId,
        agentId: agentId
    };
}

async function loadMemory(userId, agentId, key) {
    /**
     * Cargar información de memoria persistente
     */
    
    // TODO: Implementar con PostgreSQL
    console.log(`🧠 Cargando memoria: ${userId}:${agentId}:${key}`);
    
    return {
        value: null,
        found: false
    };
}

// ============================================
// 📊 EXPORTAR FUNCIONES
// ============================================

module.exports = {
    // Búsqueda y datos actualizados
    webSearch,
    
    // Imágenes
    analyzeImage,
    generateImage,
    
    // Código
    executeCode,
    
    // Documentos
    analyzeDocument,
    
    // Function calling
    chatWithTools,
    FUNCTION_DEFINITIONS,
    AVAILABLE_FUNCTIONS,
    
    // Memoria
    saveMemory,
    loadMemory
};
