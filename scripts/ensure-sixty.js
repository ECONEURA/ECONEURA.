#!/usr/bin/env node
/**
 * ensure-sixty.ts
 * Generates routing configuration for 60 AI agents
 * Usage: node scripts/ensure-sixty.ts
 */

const fs = require('fs');
const path = require('path');

const AGENTS_COUNT = 60;
const OUTPUT_FILE = path.join(__dirname, '../packages/configs/agent-routing.json');

// Agent categories with descriptions
const AGENT_CATEGORIES = [
  { prefix: 'neura', name: 'Core Business', count: 10 },
  { prefix: 'specialist', name: 'Domain Specialists', count: 15 },
  { prefix: 'support', name: 'Customer Support', count: 10 },
  { prefix: 'analyst', name: 'Data Analytics', count: 10 },
  { prefix: 'creative', name: 'Creative & Content', count: 8 },
  { prefix: 'tech', name: 'Technical Operations', count: 7 }
];

function generateAgents() {
  const agents = [];
  let currentId = 1;

  for (const category of AGENT_CATEGORIES) {
    for (let i = 1; i <= category.count; i++) {
      agents.push({
        id: `${category.prefix}-${i}`,
        name: `${category.name} Agent ${i}`,
        category: category.name,
        endpoint: `http://localhost:${3100 + currentId}/api/process`,
        description: `AI agent for ${category.name.toLowerCase()} tasks`,
        status: 'active',
        capabilities: ['text-generation', 'analysis', 'reasoning'],
        maxTokens: 4096,
        temperature: 0.7
      });
      currentId++;
    }
  }

  return agents;
}

function main() {
  console.log('🚀 Generating 60 agent routing configuration...');

  const agents = generateAgents();
  
  if (agents.length !== AGENTS_COUNT) {
    console.error(`❌ Error: Expected ${AGENTS_COUNT} agents, got ${agents.length}`);
    process.exit(1);
  }

  const config = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    totalAgents: agents.length,
    agents: agents
  };

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write config file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(config, null, 2), 'utf-8');

  console.log(`✅ Successfully generated ${agents.length} agents`);
  console.log(`📁 Output: ${OUTPUT_FILE}`);
  console.log('\nAgent breakdown:');
  
  AGENT_CATEGORIES.forEach(cat => {
    console.log(`  - ${cat.name}: ${cat.count} agents`);
  });
}

main();
