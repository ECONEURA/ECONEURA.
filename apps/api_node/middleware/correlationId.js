const { randomUUID } = require('crypto');

const HEADER_NAME = 'x-correlation-id';

function correlationIdMiddleware(req, res, next) {
    let correlationId = req.headers[HEADER_NAME];

    if (!correlationId) {
        correlationId = randomUUID();
        req.headers[HEADER_NAME] = correlationId;
    }

    req.correlationId = correlationId;
    res.locals.correlationId = correlationId;
    res.setHeader('X-Correlation-Id', correlationId);

    next();
}

module.exports = { correlationIdMiddleware, HEADER_NAME };
