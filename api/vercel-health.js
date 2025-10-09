/**
 * Vercel Serverless Function - Health Check
 * GET /api/health
 */

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({
    ok: true,
    mode: process.env.MAKE_FORWARD === '1' ? 'forward' : 'simulation',
    ts: new Date().toISOString(),
    service: 'Vercel Serverless API',
    agents: 11
  });
};
