const cors = require('cors');

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);

const corsMiddleware = cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (curl, Postman, same-origin)
        if (!origin) {
            return callback(null, true);
        }
        
        if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-Id', 'X-Route']
});

module.exports = { corsMiddleware };
