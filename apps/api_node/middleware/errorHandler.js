const { STATUS_CODES } = require('http');

function serializeError(error) {
    const base = {
        message: error.message || 'Unexpected error',
        name: error.name || 'Error'
    };

    if (error.code) {
        base.code = error.code;
    }
    if (error.statusCode || error.status) {
        base.status = error.statusCode || error.status;
    }
    if (error.details) {
        base.details = error.details;
    }

    return base;
}

function errorHandlerMiddleware(err, req, res, _next) {
    const statusCode = err.statusCode || err.status || 500;
    const payload = serializeError(err);
    payload.statusText = STATUS_CODES[statusCode] || 'Internal Server Error';
    payload.correlationId = res.locals.correlationId || req.correlationId;

    if (process.env.API_REQUEST_LOGS !== 'quiet') {
        console.error('❌ Request error', {
            statusCode,
            correlationId: payload.correlationId,
            message: err.message,
            stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
        });
    }

    res.status(statusCode).json(payload);
}

module.exports = {
    errorHandlerMiddleware
};
