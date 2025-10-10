#!/usr/bin/env node
/**
 * 🚀 ejecutaAgente.js
 * CLI para ejecutar agentes NEURA desde terminal VS Code
 *
 * Uso:
 *   node ejecutaAgente.js "Busca información sobre IA en 2024"
 *   node ejecutaAgente.js "Crea una tarea para revisar presupuesto Q4"
 *   node ejecutaAgente.js "Ejecuta análisis financiero del último trimestre"
 */

require('dotenv').config();
const axios = require('axios');
const { ejecutarTareaCompleja } = require('./services/orchestrator');

// 🎨 COLORES PARA TERMINAL
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    gray: '\x1b[90m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// 🔧 CONFIGURACIÓN
const CONFIG = {
    backendUrl: process.env.BACKEND_URL || 'http://localhost:8080',
    econeuraUrl: process.env.ECONEURA_URL || 'http://localhost:3000',
    defaultUserId: process.env.USER_ID || 'cli-user',
    defaultAgent: process.env.DEFAULT_AGENT || 'neura-3' // CFO por defecto
};

// 📊 MOSTRAR PROGRESO
function mostrarProgreso(resultado) {
    log('\n📊 RESULTADO DE LA EJECUCIÓN:', 'cyan');
    log('═'.repeat(60), 'gray');

    if (resultado.success) {
        log('\n✅ Tarea completada exitosamente\n', 'green');

        // Respuesta principal
        log('💬 Respuesta:', 'bright');
        log(resultado.respuesta || resultado.output, 'reset');

        // Tools ejecutados
        if (resultado.toolsEjecutados && resultado.toolsEjecutados.length > 0) {
            log('\n🔧 Herramientas utilizadas:', 'yellow');
            resultado.toolsEjecutados.forEach((tool, idx) => {
                log(`   ${idx + 1}. ${tool.function}`, 'cyan');
                log(`      Args: ${JSON.stringify(tool.arguments)}`, 'gray');
                if (tool.result && !tool.result.error) {
                    log(`      ✓ Ejecutado correctamente`, 'green');
                }
            });
        }

        // Métricas
        if (resultado.usage) {
            log('\n📈 Métricas:', 'yellow');
            log(`   Tokens: ${resultado.usage.totalTokens || resultado.usage.total_tokens || 'N/A'}`, 'gray');
            log(`   Iteraciones: ${resultado.iteraciones || 1}`, 'gray');
        }

    } else {
        log('\n❌ Error en la ejecución\n', 'red');
        log(resultado.error || 'Error desconocido', 'red');
    }

    log('\n' + '═'.repeat(60), 'gray');
}

// 🎯 EJECUTAR TAREA LOCAL (Orchestrator)
async function ejecutarTareaLocal(mensaje) {
    log('\n🎯 Ejecutando tarea localmente con Orchestrator...', 'cyan');
    log(`📝 Mensaje: "${mensaje}"`, 'gray');

    try {
        const resultado = await ejecutarTareaCompleja(
            mensaje,
            CONFIG.defaultUserId,
            'neura-orchestrator'
        );

        return resultado;

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// 🌐 EJECUTAR VÍA API BACKEND
async function ejecutarViaBackend(mensaje, agentId = CONFIG.defaultAgent) {
    log('\n🌐 Ejecutando vía backend API...', 'cyan');
    log(`📝 Mensaje: "${mensaje}"`, 'gray');
    log(`🤖 Agente: ${agentId}`, 'gray');

    try {
        const response = await axios.post(
            `${CONFIG.backendUrl}/api/invoke/${agentId}`,
            {
                input: mensaje,
                userId: CONFIG.defaultUserId,
                correlationId: `cli-${Date.now()}`
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 60000
            }
        );

        return {
            success: true,
            ...response.data
        };

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// 🚀 FUNCIÓN PRINCIPAL
async function main() {
    // Banner
    log('\n╔═══════════════════════════════════════════════════════╗', 'cyan');
    log('║      🚀 NEURA Agent Executor - CLI Tool             ║', 'cyan');
    log('╚═══════════════════════════════════════════════════════╝\n', 'cyan');

    // Validar argumentos
    const args = process.argv.slice(2);

    if (args.length === 0) {
        log('❌ Error: Debes proporcionar un mensaje\n', 'red');
        log('Uso:', 'yellow');
        log('  node ejecutaAgente.js "Tu mensaje aquí"', 'gray');
        log('  node ejecutaAgente.js --agent neura-7 "Analiza arquitectura"', 'gray');
        log('  node ejecutaAgente.js --local "Busca info sobre IA 2024"\n', 'gray');
        log('Ejemplos:', 'yellow');
        log('  node ejecutaAgente.js "Crea tarea para revisar presupuesto"', 'gray');
        log('  node ejecutaAgente.js "Busca noticias sobre OpenAI"', 'gray');
        log('  node ejecutaAgente.js "Analiza datos financieros Q3 2024"\n', 'gray');
        process.exit(1);
    }

    // Parse argumentos
    let modo = 'backend'; // 'backend' o 'local'
    let agentId = CONFIG.defaultAgent;
    let mensaje = '';

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--local') {
            modo = 'local';
        } else if (args[i] === '--agent' && args[i + 1]) {
            agentId = args[i + 1];
            i++; // Skip next arg
        } else {
            mensaje += (mensaje ? ' ' : '') + args[i];
        }
    }

    if (!mensaje) {
        log('❌ Error: Mensaje vacío\n', 'red');
        process.exit(1);
    }

    // Verificar configuración
    if (!process.env.OPENAI_API_KEY) {
        log('⚠️  OPENAI_API_KEY no configurada', 'yellow');
        log('   Configúrala en el archivo .env\n', 'gray');
    }

    // Ejecutar según modo
    let resultado;

    if (modo === 'local') {
        resultado = await ejecutarTareaLocal(mensaje);
    } else {
        resultado = await ejecutarViaBackend(mensaje, agentId);
    }

    // Mostrar resultado
    mostrarProgreso(resultado);

    // Exit code
    process.exit(resultado.success ? 0 : 1);
}

// 🏃 EJECUTAR
if (require.main === module) {
    main().catch(error => {
        log(`\n❌ Error fatal: ${error.message}\n`, 'red');
        console.error(error);
        process.exit(1);
    });
}

module.exports = { ejecutarTareaLocal, ejecutarViaBackend };
