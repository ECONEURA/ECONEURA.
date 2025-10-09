#!/usr/bin/env node
/**
 * ECONEURA Backend API Server (Node.js)
 * Puerto por defecto: 8080
 * Proxy a Make.com webhooks con soporte de simulación
 */

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración
const HOST = process.env.HOST || '127.0.0.1';
const PORT = parseInt(process.env.PORT || '8080', 10);
const MAKE_FORWARD = process.env.MAKE_FORWARD === '1';
const MAKE_TOKEN = process.env.MAKE_TOKEN || '';
const MAKE_TIMEOUT = parseInt(process.env.MAKE_TIMEOUT || '4000', 10);

// Path correcto a agent-routing.json desde apps/api_node
const ROUTING_PATH = join(__dirname, '../../packages/configs/agent-routing.json');

// IDs de agentes válidos
const VALID_AGENT_IDS = Array.from({ length: 11 }, (_, i) => `neura-${i + 1}`);

// Cargar configuración de rutas
let ROUTING = {};
try {
  const data = await readFile(ROUTING_PATH, 'utf-8');
  const config = JSON.parse(data);
  const routes = config.routes || config;
  ROUTING = Object.fromEntries(routes.map(r => [r.id, r]));
  console.log(`✅ Loaded ${Object.keys(ROUTING).length} agent routes from config`);
} catch (err) {
  console.warn(`⚠️  Warning: Could not load routing config: ${err.message}`);
}

/**
 * Forward request to Make.com webhook
 */
async function forwardToMake(agentId, body, headers) {
  const route = ROUTING[agentId];
  if (!route || !route.url) {
    throw new Error('routing-missing');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MAKE_TIMEOUT);

  try {
    const reqHeaders = {
      'Content-Type': 'application/json',
      'X-Correlation-Id': headers['x-correlation-id'] || '',
    };

    // Add auth header if configured
    if (route.auth === 'header' && MAKE_TOKEN) {
      reqHeaders['x-make-token'] = MAKE_TOKEN;
    }

    const response = await fetch(route.url, {
      method: 'POST',
      headers: reqHeaders,
      body: body,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const responseData = await response.text();
    let parsed;
    try {
      parsed = JSON.parse(responseData || '{}');
    } catch {
      parsed = { ok: true, raw: responseData };
    }

    return {
      status: response.status,
      data: parsed,
    };
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      return {
        status: 504,
        data: { ok: false, error: 'make_timeout', reason: 'Request timed out' },
      };
    }
    return {
      status: 502,
      data: { ok: false, error: 'make_unreachable', reason: err.message },
    };
  }
}

/**
 * HTTP Request Handler
 */
const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Route, X-Correlation-Id');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // GET /api/health
  if (req.method === 'GET' && req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ok: true,
      mode: MAKE_FORWARD ? 'forward' : 'sim',
      ts: new Date().toISOString(),
      agents: VALID_AGENT_IDS.length,
    }));
    return;
  }

  // POST /api/invoke/:agentId
  const invokeMatch = req.url?.match(/^\/api\/invoke\/([^/]+)$/);
  if (req.method === 'POST' && invokeMatch) {
    const agentId = invokeMatch[1];

    // Validate headers
    const auth = req.headers.authorization || '';
    const route = req.headers['x-route'] || '';
    const correlationId = req.headers['x-correlation-id'] || '';

    if (!auth || !auth.startsWith('Bearer ')) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'missing Authorization Bearer' }));
      return;
    }

    if (!route || !correlationId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'missing X-Route or X-Correlation-Id' }));
      return;
    }

    if (!VALID_AGENT_IDS.includes(agentId)) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'unknown agent id', valid: VALID_AGENT_IDS }));
      return;
    }

    // Read request body
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks).toString('utf-8') || '{}';

    let payload;
    try {
      payload = JSON.parse(body);
    } catch {
      payload = {};
    }

    // Forward or simulate
    if (MAKE_FORWARD) {
      try {
        const result = await forwardToMake(agentId, body, {
          'x-correlation-id': correlationId,
        });

        res.writeHead(result.status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          id: agentId,
          route,
          forward: true,
          resp: result.data,
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          ok: false,
          error: 'forward_failed',
          reason: err.message,
        }));
      }
    } else {
      // Simulation mode
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        id: agentId,
        ok: true,
        forward: false,
        echo: payload,
        route,
        correlationId,
        simulatedResponse: `Respuesta simulada del agente ${agentId}`,
        timestamp: new Date().toISOString(),
      }));
    }
    return;
  }

  // 404 for everything else
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

// Start server
server.listen(PORT, HOST, () => {
  console.log('\n🚀 ECONEURA Backend API Server');
  console.log('================================');
  console.log(`📡 Listening on: http://${HOST}:${PORT}`);
  console.log(`🔄 Mode: ${MAKE_FORWARD ? 'FORWARD to Make.com' : 'SIMULATION'}`);
  console.log(`🤖 Agents: ${VALID_AGENT_IDS.length} (${VALID_AGENT_IDS[0]} - ${VALID_AGENT_IDS[VALID_AGENT_IDS.length - 1]})`);
  console.log(`📋 Config: ${Object.keys(ROUTING).length} routes loaded`);
  console.log('================================\n');
  console.log('Health check: GET /api/health');
  console.log('Invoke agent: POST /api/invoke/:agentId\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
