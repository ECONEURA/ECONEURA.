require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const { corsMiddleware } = require('./middleware/cors');
const { rateLimitMiddleware } = require('./middleware/rateLimit');
const { authMiddleware } = require('./middleware/auth');
const healthRouter = require('./routes/health');
const invokeRouter = require('./routes/invoke');

const app = express();
const PORT = process.env.PORT || 8080;

// Security
app.use(helmet());
app.use(corsMiddleware);
app.use(express.json({ limit: '1mb' }));

// Rate limiting
app.use(rateLimitMiddleware);

// Routes
app.use('/api/health', healthRouter);
app.use('/api/invoke', authMiddleware, invokeRouter);

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        correlationId: req.headers['x-correlation-id']
    });
});

app.listen(PORT, () => {
    console.log(`🚀 ECONEURA Gateway running on port ${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/api/health`);
});
