#!/usr/bin/env node
/**
 * Script de validación de sincronización entre agent-routing.json y EconeuraCockpit.tsx
 *
 * Verifica que:
 * 1. Todos los agentes en agent-routing.json existen en el Cockpit
 * 2. No hay agentes en el Cockpit sin ruta correspondiente
 * 3. Los IDs coinciden correctamente
 *
 * Uso:
 *   pnpm tsx scripts/validate-agent-sync.ts
 *   node --loader ts-node/esm scripts/validate-agent-sync.ts
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

interface AgentRoute {
  id: string;
  dept: string;
  service: string;
  port: number;
  url: string;
}

interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
}

function log(color: keyof typeof colors, message: string) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function loadAgentRouting(): AgentRoute[] {
  const routingPath = join(ROOT, 'packages/configs/agent-routing.json');

  if (!existsSync(routingPath)) {
    throw new Error(`❌ No se encuentra agent-routing.json en: ${routingPath}`);
  }

  const content = readFileSync(routingPath, 'utf-8');
  const data = JSON.parse(content);

  if (!data.routes || !Array.isArray(data.routes)) {
    throw new Error('❌ agent-routing.json no tiene el formato esperado (debe tener array "routes")');
  }

  return data.routes;
}

function extractCockpitAgents(): string[] {
  const cockpitPath = join(ROOT, 'apps/web/src/EconeuraCockpit.tsx');

  if (!existsSync(cockpitPath)) {
    throw new Error(`❌ No se encuentra EconeuraCockpit.tsx en: ${cockpitPath}`);
  }

  const content = readFileSync(cockpitPath, 'utf-8');

  // Regex para encontrar todos los IDs de agentes en el formato: id: "neura-X"
  const regex = /\bid:\s*["']neura-\d+["']/g;
  const matches = content.match(regex) || [];

  // Extraer solo los IDs (neura-1, neura-2, etc.)
  const ids = matches.map(m => {
    const match = m.match(/neura-\d+/);
    return match ? match[0] : '';
  }).filter(Boolean);

  // Eliminar duplicados
  return [...new Set(ids)];
}

function validateSync(): ValidationResult {
  const result: ValidationResult = {
    ok: true,
    errors: [],
    warnings: [],
    info: [],
  };

  try {
    // Cargar datos
    const routes = loadAgentRouting();
    const cockpitIds = extractCockpitAgents();

    const routeIds = routes.map(r => r.id);

    result.info.push(`📊 agent-routing.json: ${routes.length} rutas`);
    result.info.push(`📊 EconeuraCockpit.tsx: ${cockpitIds.length} agentes`);

    // Validación 1: Todos los agentes del Cockpit tienen ruta
    const missingRoutes = cockpitIds.filter(id => !routeIds.includes(id));
    if (missingRoutes.length > 0) {
      result.ok = false;
      result.errors.push(
        `❌ Agentes en Cockpit sin ruta en agent-routing.json: ${missingRoutes.join(', ')}`
      );
    }

    // Validación 2: Todas las rutas tienen agente en el Cockpit
    const missingCockpit = routeIds.filter(id => !cockpitIds.includes(id));
    if (missingCockpit.length > 0) {
      result.warnings.push(
        `⚠️  Rutas sin agente en Cockpit: ${missingCockpit.join(', ')}`
      );
    }

    // Validación 3: Verificar secuencia numérica
    const routeNumbers = routeIds
      .map(id => parseInt(id.replace('neura-', ''), 10))
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b);

    const expectedSequence = Array.from({ length: routeNumbers.length }, (_, i) => i + 1);
    const missingNumbers = expectedSequence.filter(n => !routeNumbers.includes(n));

    if (missingNumbers.length > 0) {
      result.warnings.push(
        `⚠️  Números faltantes en secuencia neura-X: ${missingNumbers.join(', ')}`
      );
    }

    // Validación 4: Verificar puertos únicos
    const ports = routes.map(r => r.port);
    const duplicatePorts = ports.filter((p, i) => ports.indexOf(p) !== i);
    if (duplicatePorts.length > 0) {
      result.ok = false;
      result.errors.push(
        `❌ Puertos duplicados en agent-routing.json: ${[...new Set(duplicatePorts)].join(', ')}`
      );
    }

    // Validación 5: Verificar formato de URLs
    const invalidUrls = routes.filter(r => {
      try {
        new URL(r.url);
        return false;
      } catch {
        return true;
      }
    });

    if (invalidUrls.length > 0) {
      result.ok = false;
      result.errors.push(
        `❌ URLs inválidas: ${invalidUrls.map(r => `${r.id} -> ${r.url}`).join(', ')}`
      );
    }

    // Info adicional
    if (result.ok && missingRoutes.length === 0 && missingCockpit.length === 0) {
      result.info.push('✅ Sincronización perfecta: todos los agentes tienen ruta y viceversa');
    }

  } catch (error) {
    result.ok = false;
    result.errors.push(`❌ Error fatal: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

function main() {
  log('cyan', '\n🔍 Validando sincronización agent-routing.json ↔ EconeuraCockpit.tsx\n');

  const result = validateSync();

  // Mostrar info
  result.info.forEach(msg => log('blue', msg));

  // Mostrar warnings
  if (result.warnings.length > 0) {
    console.log('');
    result.warnings.forEach(msg => log('yellow', msg));
  }

  // Mostrar errores
  if (result.errors.length > 0) {
    console.log('');
    result.errors.forEach(msg => log('red', msg));
  }

  // Resultado final
  console.log('');
  if (result.ok && result.warnings.length === 0) {
    log('green', '✅ VALIDACIÓN EXITOSA: Sincronización 100% correcta\n');
    process.exit(0);
  } else if (result.ok && result.warnings.length > 0) {
    log('yellow', '⚠️  VALIDACIÓN CON WARNINGS: Hay advertencias pero no errores críticos\n');
    process.exit(0);
  } else {
    log('red', '❌ VALIDACIÓN FALLIDA: Hay errores críticos que deben corregirse\n');
    process.exit(1);
  }
}

main();
