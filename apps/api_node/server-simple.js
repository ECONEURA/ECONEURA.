require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware básico
app.use(express.json());

// Health check simple
app.get('/api/health', (req, res) => {
    console.log('Health check called');
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'econeura-gateway',
        version: '1.0.0'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ECONEURA Gateway running on port ${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/api/health`);
});
