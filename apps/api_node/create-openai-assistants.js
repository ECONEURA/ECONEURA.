#!/usr/bin/env node
/**
 * Script para crear los 10 Assistants de OpenAI (neura-*)
 * Actualiza automáticamente apps/api_node/config/agents.json
 */

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const ASSISTANTS = [
    { id: 'neura-ceo', name: 'NEURA CEO', instructions: 'Eres el asistente ejecutivo del CEO. Ayudas con decisiones estratégicas, análisis de mercado y gestión de alto nivel.' },
    { id: 'neura-ia', name: 'NEURA IA', instructions: 'Eres el experto en Inteligencia Artificial. Ayudas con implementación de IA, machine learning y automatización inteligente.' },
    { id: 'neura-cso', name: 'NEURA CSO', instructions: 'Eres el Chief Strategy Officer. Ayudas con estrategia corporativa, planificación y análisis competitivo.' },
    { id: 'neura-cto', name: 'NEURA CTO', instructions: 'Eres el Chief Technology Officer. Ayudas con arquitectura técnica, desarrollo de software y gestión de infraestructura.' },
    { id: 'neura-ciso', name: 'NEURA CISO', instructions: 'Eres el Chief Information Security Officer. Ayudas con ciberseguridad, compliance y gestión de riesgos.' },
    { id: 'neura-coo', name: 'NEURA COO', instructions: 'Eres el Chief Operating Officer. Ayudas con operaciones, procesos y optimización de recursos.' },
    { id: 'neura-chro', name: 'NEURA CHRO', instructions: 'Eres el Chief Human Resources Officer. Ayudas con gestión de talento, cultura organizacional y desarrollo de equipos.' },
    { id: 'neura-mkt', name: 'NEURA Marketing', instructions: 'Eres el experto en Marketing. Ayudas con estrategia de marketing, campañas y análisis de audiencia.' },
    { id: 'neura-cfo', name: 'NEURA CFO', instructions: 'Eres el Chief Financial Officer. Ayudas con finanzas, presupuestos y análisis financiero.' },
    { id: 'neura-cdo', name: 'NEURA CDO', instructions: 'Eres el Chief Data Officer. Ayudas con análisis de datos, BI y estrategia de datos.' }
];

async function createAssistantsAndThreads() {
    console.log('🚀 Creando 10 Assistants de OpenAI...\n');

    const results = {};

    for (const config of ASSISTANTS) {
        try {
            console.log(`📝 Creando ${config.name}...`);

            // Crear Assistant
            const assistant = await openai.beta.assistants.create({
                name: config.name,
                instructions: config.instructions,
                model: 'gpt-4o-mini'
            });

            // Crear Thread dedicado
            const thread = await openai.beta.threads.create();

            results[config.id] = {
                assistantId: assistant.id,
                threadId: thread.id
            };

            console.log(`   ✅ Assistant: ${assistant.id}`);
            console.log(`   ✅ Thread: ${thread.id}\n`);

        } catch (error) {
            console.error(`   ❌ Error creando ${config.name}:`, error.message);
            throw error;
        }
    }

    return results;
}

async function updateAgentsConfig(openaiAgents) {
    // Save to config file
    const configPath = path.join(__dirname, 'config', 'agents.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    config.openaiAgents = openaiAgents;

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('✅ Actualizado agents.json con IDs reales');
}

async function main() {
    try {
        if (!process.env.OPENAI_API_KEY) {
            console.error('❌ ERROR: OPENAI_API_KEY no encontrada en apps/api_node/.env');
            process.exit(1);
        }

        const openaiAgents = await createAssistantsAndThreads();
        await updateAgentsConfig(openaiAgents);

        console.log('\n🎉 ¡COMPLETADO! Los 10 Assistants están listos.');
        console.log('\n📋 Resumen:');
        Object.entries(openaiAgents).forEach(([id, data]) => {
            console.log(`   ${id}: ${data.assistantId}`);
        });

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

main();
