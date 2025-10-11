/**
 * Simple Proxy Server for ECONEURA Test
 * Serves static HTML and proxies /api requests to Gateway
 */

import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const PORT = 3000;
const GATEWAY_HOST = 'localhost';
const GATEWAY_PORT = 8080;

// MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Proxy function
function proxyRequest(req, res) {
  const options = {
    hostname: GATEWAY_HOST,
    port: GATEWAY_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers
  };

  console.log(`[PROXY] ${req.method} ${req.url} -> http://${GATEWAY_HOST}:${GATEWAY_PORT}${req.url}`);

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (error) => {
    console.error(`[PROXY ERROR] ${error.message}`);
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Gateway unavailable', message: error.message }));
  });

  req.pipe(proxyReq, { end: true });
}

// Server
const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Correlation-Id');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Proxy API requests
  if (req.url.startsWith('/api/')) {
    proxyRequest(req, res);
    return;
  }

  // Serve static files
  let filePath = '.' + req.url;
  
  if (filePath === './') {
    filePath = './test-cockpit.html';
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`, 'utf-8');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║              ECONEURA COCKPIT - TEST SERVER              ║
╠══════════════════════════════════════════════════════════╣
║  Server running at: http://localhost:${PORT}                ║
║  Gateway proxy:     http://localhost:${GATEWAY_PORT}           ║
║  Status:            ✅ READY                              ║
╚══════════════════════════════════════════════════════════╝

📋 Next steps:
  1. Open http://localhost:3000 in your browser
  2. Select an agent from the sidebar
  3. Send a test message
  4. Check E2E flow: Browser → Proxy → Gateway → Agent

Press Ctrl+C to stop
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down proxy server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});
