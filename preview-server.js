#!/usr/bin/env node
/**
 * Quick Local Preview Server for ECONEURA
 * Serves the built app + API endpoints for testing
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'apps', 'web');
const GATEWAY_HOST = 'localhost';
const GATEWAY_PORT = 8080;

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

  // Proxy API requests to Gateway
  if (pathname.startsWith('/api/')) {
    const options = {
      hostname: GATEWAY_HOST,
      port: GATEWAY_PORT,
      path: pathname + (urlObj.search || ''),
      method: req.method,
      headers: req.headers
    };

    console.log(`[PROXY] ${req.method} ${pathname} -> http://${GATEWAY_HOST}:${GATEWAY_PORT}${pathname}`);

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (error) => {
      console.error(`[PROXY ERROR] ${error.message}`);
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Gateway unavailable', 
        message: error.message,
        gateway: `http://${GATEWAY_HOST}:${GATEWAY_PORT}`
      }));
    });

    req.pipe(proxyReq, { end: true });
    return;
  }

  // Serve static files
  let filePath = path.join(DIST_DIR, pathname === '/' ? 'test-cockpit.html' : pathname);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    // SPA fallback
    filePath = path.join(DIST_DIR, 'test-cockpit.html');
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
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║           🚀 ECONEURA COCKPIT - TEST SERVER              ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  Server:    http://localhost:${PORT}                         ║`);
  console.log(`║  Gateway:   http://${GATEWAY_HOST}:${GATEWAY_PORT}                          ║`);
  console.log('║  Mode:      PROXY (Real agents)                          ║');
  console.log('║  Status:    ✅ READY                                      ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  console.log('📋 Next steps:');
  console.log('  1. Open http://localhost:3000 in your browser');
  console.log('  2. Select Reception agent (neura-9)');
  console.log('  3. Send a test message');
  console.log('  4. Verify E2E: Browser → Proxy → Gateway → Agent\n');
});
});
