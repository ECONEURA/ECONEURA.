const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'econeura-gateway',
        version: '1.0.0'
    });
});

module.exports = router;
