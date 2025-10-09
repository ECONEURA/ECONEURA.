function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.substring(7);
    
    if (token !== process.env.API_BEARER_TOKEN) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    next();
}

module.exports = { authMiddleware };
