function requestTimingMiddleware(req, res, next) {
    const start = process.hrtime.bigint();

    res.on('finish', () => {
        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1_000_000;
        const rounded = Math.round(durationMs * 100) / 100;
        res.setHeader('X-Response-Time', `${rounded}ms`);

        if (process.env.API_REQUEST_LOGS !== 'quiet') {
            const method = req.method;
            const path = req.originalUrl || req.url;
            const status = res.statusCode;
            const correlationId = req.correlationId || res.locals.correlationId;
            console.log(`⚡ ${method} ${path} ${status} - ${rounded}ms${correlationId ? ` cid=${correlationId}` : ''}`);
        }
    });

    next();
}

module.exports = { requestTimingMiddleware };
