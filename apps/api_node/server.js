require('dotenv').config();
require('express-async-errors');

const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const pinoHttp = require('pino-http');

const { getRuntimeConfig } = require('./config/runtime');
const { corsMiddleware } = require('./middleware/cors');
const { rateLimitMiddleware } = require('./middleware/rateLimit');
const { authMiddleware } = require('./middleware/auth');
const { correlationIdMiddleware } = require('./middleware/correlationId');
const { requestTimingMiddleware } = require('./middleware/requestTiming');
const { errorHandlerMiddleware } = require('./middleware/errorHandler');
const healthRouter = require('./routes/health');
const invokeRouter = require('./routes/invoke');

const config = getRuntimeConfig();
const app = express();

app.disable('x-powered-by');

const httpLogger = pinoHttp({
    autoLogging: false,
    customProps: (_, res) => ({ correlationId: res?.locals?.correlationId })
});

app.use(correlationIdMiddleware);
app.use(httpLogger);
app.use(requestTimingMiddleware);
app.use(helmet());
app.use(compression({ level: 6 }));
app.use(corsMiddleware);
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '1mb' }));
app.use(rateLimitMiddleware);

app.use('/api/health', healthRouter);
app.use('/api/invoke', authMiddleware, invokeRouter);

app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        path: req.originalUrl,
        correlationId: res.locals.correlationId
    });
});

app.use(errorHandlerMiddleware);

app.listen(config.port, () => {
    console.log(`🚀 ECONEURA Gateway running on port ${config.port}`);
    console.log(`📊 Health: http://localhost:${config.port}/api/health`);
});
