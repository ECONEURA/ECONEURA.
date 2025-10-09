#!/usr/bin/env node
/**
 * Quick Local Preview Server for ECONEURA
 * Serves the built app + API endpoints for testing
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 8000;
const DIST_DIR = path.join(__dirname, 'apps', 'web', 'dist');

// Agent routes
const agentRoutes = {
  "neura-1": { dept: "analytics" },
  "neura-2": { dept: "cdo" },
  "neura-3": { dept: "cfo" },
  "neura-4": { dept: "chro" },
  "neura-5": { dept: "ciso" },
  "neura-6": { dept: "cmo" },
  "neura-7": { dept: "cto" },
  "neura-8": { dept: "legal" },
  "neura-9": { dept: "reception" },
  "neura-10": { dept: "research" },
  "neura-11": { dept: "support" }
};

// MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const pathname = urlObj.pathname;

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Route, X-Correlation-Id');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API: Health check
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ok: true,
      mode: 'simulation',
      ts: new Date().toISOString(),
      service: 'Local Preview Server',
      agents: 11
    }));
    return;
  }

  // API: Invoke agent
  const invokeMatch = pathname.match(/^\/api\/invoke\/(.+)$/);
  if (invokeMatch && req.method === 'POST') {
    const agentId = invokeMatch[1];

    if (!agentRoutes[agentId]) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Agent ${agentId} not found` }));
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let payload = {};
      try {
        payload = JSON.parse(body || '{}');
      } catch {}

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        agentId,
        dept: agentRoutes[agentId].dept,
        correlationId: req.headers['x-correlation-id'] || 'local-preview',
        route: req.headers['x-route'] || 'local',
        mode: 'simulation',
        response: `Simulación de respuesta del agente ${agentId} (${agentRoutes[agentId].dept}). Input: ${JSON.stringify(payload.input || 'N/A')}`,
        timestamp: new Date().toISOString()
      }));
    });
    return;
  }

  // Serve static files from dist
  let filePath = path.join(DIST_DIR, pathname === '/' ? 'index.html' : pathname);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    // SPA fallback - serve index.html for client-side routing
    filePath = path.join(DIST_DIR, 'index.html');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('\n🚀 ECONEURA Local Preview Server');
  console.log('==================================');
  console.log(`📡 Listening on: http://localhost:${PORT}`);
  console.log(`🌐 Frontend: Serving from ${DIST_DIR}`);
  console.log(`🤖 API: /api/health & /api/invoke/:agentId`);
  console.log('==================================\n');
  console.log(`✅ Open in browser: http://localhost:${PORT}\n`);
});
