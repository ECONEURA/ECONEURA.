// Servidor mínimo sin dependencias complejas
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Route, X-Correlation-Id');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'econeura-minimal-gateway',
        version: '1.0.0'
    });
});

// Mock invoke endpoint
app.post('/api/invoke/:agentId', (req, res) => {
    const { agentId } = req.params;
    const payload = req.body;
    
    // Simulación simple
    res.json({
        status: 'success',
        agentId,
        message: `Agent ${agentId} invoked successfully (mock)`,
        timestamp: new Date().toISOString(),
        input: payload
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
});

// START SERVER
console.log('Starting server...');
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ ECONEURA Minimal Gateway running on port ${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/api/health`);
    console.log(`🚀 Invoke: POST http://localhost:${PORT}/api/invoke/:agentId`);
});

server.on('error', (err) => {
    console.error('❌ Server error:', err);
    process.exit(1);
});

process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
