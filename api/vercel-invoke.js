/**
 * Vercel Serverless Function - Invoke Agent
 * POST /api/invoke/[agentId]
 */

// Agent routes configuration
const agentRoutes = {
  "neura-1": { dept: "analytics", url: "https://hook.us2.make.com/xxx" },
  "neura-2": { dept: "cdo", url: "https://hook.us2.make.com/xxx" },
  "neura-3": { dept: "cfo", url: "https://hook.us2.make.com/xxx" },
  "neura-4": { dept: "chro", url: "https://hook.us2.make.com/xxx" },
  "neura-5": { dept: "ciso", url: "https://hook.us2.make.com/xxx" },
  "neura-6": { dept: "cmo", url: "https://hook.us2.make.com/xxx" },
  "neura-7": { dept: "cto", url: "https://hook.us2.make.com/xxx" },
  "neura-8": { dept: "legal", url: "https://hook.us2.make.com/xxx" },
  "neura-9": { dept: "reception", url: "https://hook.us2.make.com/xxx" },
  "neura-10": { dept: "research", url: "https://hook.us2.make.com/xxx" },
  "neura-11": { dept: "support", url: "https://hook.us2.make.com/xxx" }
};

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Route, X-Correlation-Id');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extract agentId from URL path
  const pathParts = req.url.split('/');
  const agentId = pathParts[pathParts.length - 1];

  // Get headers
  const authHeader = req.headers.authorization || '';
  const route = req.headers['x-route'] || '';
  const correlationId = req.headers['x-correlation-id'] || '';

  console.log(`Invoke agent: ${agentId}, route: ${route}, correlation: ${correlationId}`);

  // Validate headers
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Missing or invalid Authorization header' 
    });
  }

  if (!route || !correlationId) {
    return res.status(400).json({ 
      error: 'Missing required headers: X-Route, X-Correlation-Id' 
    });
  }

  // Validate agent exists
  if (!agentRoutes[agentId]) {
    return res.status(404).json({ 
      error: `Agent ${agentId} not found`,
      validAgents: Object.keys(agentRoutes)
    });
  }

  // Parse request body
  let payload;
  try {
    payload = req.body || {};
  } catch (err) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  const agentConfig = agentRoutes[agentId];

  // SIMULATION MODE (default)
  if (process.env.MAKE_FORWARD !== '1') {
    console.log(`✅ [SIM] ${agentId} - ${correlationId}`);
    return res.status(200).json({
      agentId,
      dept: agentConfig.dept,
      correlationId,
      route,
      mode: 'simulation',
      response: `Simulación de respuesta del agente ${agentId} (${agentConfig.dept}). Input recibido: ${JSON.stringify(payload.input || 'N/A')}`,
      timestamp: new Date().toISOString()
    });
  }

  // FORWARD MODE (to Make.com)
  try {
    const makeToken = process.env.MAKE_TOKEN;
    if (!makeToken) {
      throw new Error('MAKE_TOKEN not configured');
    }

    const response = await fetch(agentConfig.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${makeToken}`
      },
      body: JSON.stringify({
        ...payload,
        agentId,
        correlationId,
        route
      })
    });

    const data = await response.json();
    console.log(`✅ [FORWARD] ${agentId} - ${correlationId} - ${response.status}`);

    return res.status(response.status).json(data);
  } catch (err) {
    console.log(`❌ [FORWARD ERROR] ${agentId} - ${err.message}`);
    return res.status(502).json({
      error: 'Failed to forward request to Make.com',
      details: err.message
    });
  }
};
